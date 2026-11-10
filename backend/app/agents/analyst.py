class DisputeAnalystAgent:
    """
    Step 2: Intelligent Dispute Classification & Requirement Mapping.
    Analyzes dispute details, lifecycle stage, and defines required evidence types.
    """
    def run(self, dispute: dict) -> dict:
        reason = dispute.get("reason", "UNKNOWN")
        stage = dispute.get("lifecycle_stage", "INQUIRY")
        amount = dispute.get("amount", 0.0)
        currency = dispute.get("currency", "INR")
        
        # Determine classification
        if "NOT_RECEIVED" in reason:
            classification = "ITEM_NOT_RECEIVED"
            investigation_type = "Logistics and Proof-of-Delivery Verification"
            required_evidence = [
                "Carrier Tracking Number",
                "Proof of Delivery (POD) / Consignment Receipt",
                "Delivery Address Match with Buyer PayPal Address",
                "Order Invoice and Timestamp Details"
            ]
            primary_risk = "Chargeback liability without verifiable delivery timestamp or signed courier receipt."
        elif "NOT_AS_DESCRIBED" in reason:
            classification = "SIGNIFICANTLY_NOT_AS_DESCRIBED"
            investigation_type = "Product Specification & Condition Validation"
            required_evidence = [
                "Product Catalog Listing & Detailed Specifications",
                "Pre-dispatch Quality Assurance Inspection Records",
                "Customer Communication & Return Policy Acknowledgement"
            ]
            primary_risk = "Buyer claims item received is materially defective or different from catalog."
        elif "UNAUTHORISED" in reason:
            classification = "UNAUTHORIZED_TRANSACTION"
            investigation_type = "Transaction Authentication & Fraud Screening"
            required_evidence = [
                "3D-Secure Authentication Logs",
                "IP Address & Geo-location at Checkout",
                "Device Fingerprint and Customer Account History"
            ]
            primary_risk = "Cardholder denies authorizing the transaction."
        else:
            classification = "GENERAL_PAYMENT_DISPUTE"
            investigation_type = "General Transaction Review"
            required_evidence = ["Order Confirmation", "Customer Invoicing", "Support Correspondence"]
            primary_risk = "Unspecified dispute reason."

        summary = (
            f"Analyzed {classification} dispute for {currency} {amount:,.2f} at stage '{stage}'. "
            f"Investigation strategy requires {investigation_type}."
        )

        return {
            "agent": "Dispute Analyst Agent",
            "classification": classification,
            "investigation_type": investigation_type,
            "required_evidence": required_evidence,
            "primary_risk": primary_risk,
            "lifecycle_urgency": "HIGH" if stage == "CHARGEBACK" else "MEDIUM",
            "summary": summary
        }

analyst_agent = DisputeAnalystAgent()
