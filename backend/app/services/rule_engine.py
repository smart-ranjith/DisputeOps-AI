from datetime import datetime

class RuleEngine:
    @staticmethod
    def validate_case(dispute: dict, order: dict | None, evidence_records: list[dict]) -> dict:
        checks = []
        gaps = []
        contradictions = []
        rule_score = 100

        # Check 1: Order Linking
        if not order:
            checks.append({
                "rule": "TRANSACTION_LINKING",
                "status": "FAIL",
                "message": f"No merchant order found for transaction ID '{dispute.get('seller_transaction_id')}'."
            })
            gaps.append("Order and invoice records missing from Merchant OMS/ERP.")
            rule_score -= 40
        else:
            checks.append({
                "rule": "TRANSACTION_LINKING",
                "status": "PASS",
                "message": f"Order {order.get('order_id')} linked successfully to transaction {order.get('transaction_id')}."
            })

            # Check 2: Amount Consistency
            dispute_amount = float(dispute.get("amount", 0))
            order_amount = float(order.get("amount", 0))
            if abs(dispute_amount - order_amount) > 0.01:
                # Partial dispute or mismatch
                checks.append({
                    "rule": "AMOUNT_CONSISTENCY",
                    "status": "WARN",
                    "message": f"Disputed amount ({dispute.get('currency')} {dispute_amount}) differs from order total ({order.get('currency')} {order_amount}). Partial claim."
                })
                contradictions.append(f"Amount mismatch: Disputed {dispute.get('currency')} {dispute_amount} vs Order {order.get('currency')} {order_amount}.")
                rule_score -= 10
            else:
                checks.append({
                    "rule": "AMOUNT_CONSISTENCY",
                    "status": "PASS",
                    "message": f"Dispute amount matches order amount ({dispute.get('currency')} {dispute_amount})."
                })

            # Check 3: Customer Email Match
            buyer_email = (dispute.get("buyer_email") or "").strip().lower()
            order_email = (order.get("customer_email") or "").strip().lower()
            if buyer_email and order_email and buyer_email != order_email:
                checks.append({
                    "rule": "CUSTOMER_IDENTITY",
                    "status": "WARN",
                    "message": f"PayPal buyer email ({buyer_email}) differs from merchant billing email ({order_email})."
                })
                contradictions.append("Customer email mismatch between PayPal account and merchant order.")
                rule_score -= 10
            else:
                checks.append({
                    "rule": "CUSTOMER_IDENTITY",
                    "status": "PASS",
                    "message": "Customer email matches across systems."
                })

        # Check 4: Deadline Inspection
        deadline_str = dispute.get("response_due_date")
        if deadline_str:
            try:
                deadline = datetime.fromisoformat(deadline_str.replace("Z", "+00:00"))
                # If current time is past or within 48h
                now = datetime.now(deadline.tzinfo)
                hours_left = (deadline - now).total_seconds() / 3600
                if hours_left < 0:
                    checks.append({
                        "rule": "RESPONSE_DEADLINE",
                        "status": "FAIL",
                        "message": f"Dispute response deadline has expired ({deadline_str}). Immediate action required."
                    })
                    rule_score -= 30
                elif hours_left < 48:
                    checks.append({
                        "rule": "RESPONSE_DEADLINE",
                        "status": "WARN",
                        "message": f"Deadline approaching! Only {int(hours_left)} hours remaining until {deadline_str}."
                    })
                else:
                    checks.append({
                        "rule": "RESPONSE_DEADLINE",
                        "status": "PASS",
                        "message": f"{int(hours_left / 24)} days remaining until deadline ({deadline_str})."
                    })
            except Exception:
                checks.append({
                    "rule": "RESPONSE_DEADLINE",
                    "status": "INFO",
                    "message": f"Seller response deadline: {deadline_str}"
                })

        # Check 5: Dispute Reason-Specific Mandatory Evidence Checklist
        reason = dispute.get("reason", "")
        if "NOT_RECEIVED" in reason:
            # Requires carrier, tracking number, and proof of delivery
            has_tracking = False
            has_pod = False
            is_delivered = False

            if order:
                has_tracking = bool(order.get("tracking_number"))
                is_delivered = (order.get("delivery_status") == "DELIVERED")
                has_pod = bool(order.get("proof_of_delivery_url"))

            for ev in evidence_records:
                cat = ev.get("category", "")
                if cat in ("TRACKING_INFO", "SHIPPING_LABEL"):
                    has_tracking = True
                if cat == "PROOF_OF_DELIVERY":
                    has_pod = True

            if not has_tracking:
                gaps.append("Missing Courier Tracking Number / Consignment ID.")
                rule_score -= 25
            if not is_delivered:
                gaps.append("Logistics carrier status does not indicate 'DELIVERED'. Current: " + str(order.get("delivery_status") if order else "UNKNOWN"))
                rule_score -= 25
            if not has_pod:
                gaps.append("Missing official Proof of Delivery (POD) signature or geo-tagged delivery confirmation.")
                rule_score -= 20

            checks.append({
                "rule": "DELIVERY_EVIDENCE_MANDATE",
                "status": "PASS" if (has_tracking and is_delivered and has_pod) else "FAIL",
                "message": "Tracking, delivered status, and proof of delivery required for Item Not Received disputes."
            })

        elif "NOT_AS_DESCRIBED" in reason:
            has_spec = any(ev.get("category") == "PRODUCT_SPECIFICATION" for ev in evidence_records)
            has_inspection = any(ev.get("category") == "QUALITY_INSPECTION" for ev in evidence_records)
            if not has_spec:
                gaps.append("Original product catalog listing and technical specifications are missing.")
                rule_score -= 20
            if not has_inspection:
                gaps.append("Pre-dispatch Quality Assurance (QA) inspection record is missing.")
                rule_score -= 15
            checks.append({
                "rule": "SNAD_EVIDENCE_MANDATE",
                "status": "PASS" if (has_spec and has_inspection) else "WARN",
                "message": "Product specification and pre-shipment condition proof needed for SNAD disputes."
            })

        elif "UNAUTHORISED" in reason:
            has_auth = any(ev.get("category") in ("IP_LOGS", "3DS_AUTH", "DEVICE_FINGERPRINT") for ev in evidence_records)
            if not has_auth:
                gaps.append("3D-Secure authentication logs, customer IP address, or device fingerprint missing.")
                rule_score -= 25
            checks.append({
                "rule": "AUTH_EVIDENCE_MANDATE",
                "status": "PASS" if has_auth else "FAIL",
                "message": "Customer authentication logs and device telemetry required for unauthorized chargebacks."
            })

        rule_score = max(0, min(100, rule_score))
        
        # Determine verdict
        if rule_score >= 80 and not gaps:
            verdict = "HIGH_CONFIDENCE_CHALLENGE"
            recommendation = "Contest dispute with full verified evidence package."
        elif rule_score >= 50:
            verdict = "EVIDENCE_GAPS_DETECTED"
            recommendation = "Provide missing evidence before contesting, or consider settlement/offer."
        else:
            verdict = "INSUFFICIENT_EVIDENCE_HIGH_RISK"
            recommendation = "High risk of loss if contested without mandatory documents. Review refund options."

        return {
            "checks": checks,
            "gaps": gaps,
            "contradictions": contradictions,
            "rule_score": rule_score,
            "verdict": verdict,
            "recommendation": recommendation,
            "evaluated_at": datetime.utcnow().isoformat() + "Z"
        }

rule_engine = RuleEngine()
