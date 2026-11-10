from datetime import datetime
from app.config import settings

class ResolutionAgent:
    """
    Step 5: AI Investigation Summary and Response Generation.
    Prepares a grounded dispute response citing verified evidence documents,
    with customizable tone for merchant operations.
    """
    def run(self, dispute: dict, analyst_output: dict, collector_output: dict, auditor_output: dict, tone: str = "PAYPAL_STANDARD") -> dict:
        dispute_id = dispute.get("dispute_id")
        amount = dispute.get("amount")
        currency = dispute.get("currency")
        reason = dispute.get("reason")
        buyer_name = dispute.get("buyer_name", "the customer")
        order = collector_output.get("order_details")
        evidence_items = collector_output.get("evidence_items", [])
        gaps = auditor_output.get("missing_gaps", [])
        score = auditor_output.get("confidence_score", 0)

        # Build evidence citations list
        citations = []
        for doc in evidence_items:
            citations.append({
                "category": doc.get("category"),
                "title": doc.get("title"),
                "verified": doc.get("verified"),
                "source": doc.get("source_system")
            })

        # Logic for grounded response drafting based on score and selected tone
        if score >= 75 and order and order.get("delivery_status") == "DELIVERED":
            recommended_action = "CONTEST_DISPUTE"
            response_headline = f"Contest Claim with Proof of Delivery for Transaction {order.get('transaction_id')}"
            
            if tone == "FIRM_LEGAL":
                formal_statement = (
                    f"NOTICE OF CONTESTATION & FORMAL REBUTTAL\n"
                    f"Case Identifier: {dispute_id}\n"
                    f"Merchant Reference: {order.get('transaction_id')} | Order: {order.get('order_id')}\n"
                    f"Disputed Value: {currency} {amount:,.2f}\n\n"
                    f"1. CONTRACTUAL PERFORMANCE: The merchant has fully satisfied its binding delivery obligations under the sale agreement. "
                    f"The merchandise '{order.get('item_title')}' was released for dispatch under {order.get('carrier')} tracking consignment #{order.get('tracking_number')}.\n\n"
                    f"2. INDISPUTABLE PROOF OF RECEIPT: Carrier telematics and signed manifest confirm physical delivery to the designated consignee at {order.get('delivery_address')} "
                    f"on {order.get('delivered_date')}. Under applicable commercial regulations and PayPal Seller Protection Policy, title and possession transferred unconditionally upon confirmed receipt.\n\n"
                    f"3. CLAIMS MITIGATION: In light of conclusive digital Proof of Delivery (attached), the buyer's assertion of non-receipt is factually erroneous. "
                    f"We formally assert our rights under seller protection and request immediate and final dismissal of this chargeback."
                )
                strategy = "Firm legal contestation emphasizing contractual performance and binding carrier telematics."

            elif tone == "CUSTOMER_CENTRIC":
                formal_statement = (
                    f"Dear PayPal Customer Resolution Team,\n\n"
                    f"We appreciate the opportunity to clarify the fulfillment status for dispute {dispute_id} involving our valued customer {buyer_name} ({currency} {amount:,.2f}).\n\n"
                    f"We always strive for a delightful customer experience. According to our dispatch records for order {order.get('order_id')}, "
                    f"the parcel containing '{order.get('item_title')}' was delivered by {order.get('carrier')} on {order.get('delivered_date')} to {order.get('delivery_address')}.\n\n"
                    f"We have attached the official carrier Proof of Delivery with courier notes. If {buyer_name} was unable to locate the parcel upon delivery, "
                    f"we warmly encourage them to check with building reception or contact our dedicated support team directly. "
                    f"As delivery was fulfilled per merchant standards, we kindly request the dispute be closed in our favor."
                )
                strategy = "Customer-centric, empathetic defense maintaining brand goodwill while providing proof."

            else:  # PAYPAL_STANDARD
                formal_statement = (
                    f"To the PayPal Dispute Resolution Team,\n\n"
                    f"We are providing formal evidence regarding dispute {dispute_id} filed by {buyer_name} for the amount of "
                    f"{currency} {amount:,.2f}.\n\n"
                    f"1. Transaction Verification: The customer placed order {order.get('order_id')} on {order.get('order_date')} "
                    f"for '{order.get('item_title')}'. The billed amount of {currency} {order.get('amount'):,.2f} exactly matches the disputed transaction.\n\n"
                    f"2. Logistics & Delivery Fulfillment: The package was dispatched via {order.get('carrier')} under tracking number "
                    f"{order.get('tracking_number')}. According to official carrier records, the consignment was successfully DELIVERED on "
                    f"{order.get('delivered_date')} to the verified address: {order.get('delivery_address')}.\n\n"
                    f"3. Verification Attachments: Official digital Proof of Delivery (POD) and carrier tracking records are attached to this submission. "
                    f"The delivery location and recipient details correspond directly to the PayPal transaction.\n\n"
                    f"In accordance with PayPal Seller Protection guidelines for Item Not Received claims, we respectfully request that this dispute be resolved in the merchant's favor."
                )
                strategy = "Standard PayPal compliance contest backed by carrier delivery confirmation and invoice records."

        elif gaps and score < 60:
            recommended_action = "REVIEW_GAPS_OR_SETTLE"
            response_headline = "High Risk: Missing Delivery Evidence. Settle or Request Carrier Proof"
            
            missing_text = "\n- ".join(gaps)
            formal_statement = (
                f"INVESTIGATION ALERT: Evidence Auditor detected critical documentation gaps:\n"
                f"- {missing_text}\n\n"
                f"Draft Response (HOLD UNTIL EVIDENCE SUPPLIED):\n"
                f"Order {order.get('order_id') if order else 'N/A'} was processed for {currency} {amount:,.2f}. "
                f"However, carrier records do not currently provide unequivocal proof of delivery. "
                f"Submitting a defense without carrier delivery confirmation will likely result in an automatic chargeback loss. "
                f"Recommendation: Obtain carrier signed manifest from logistics partner immediately, or issue a concession refund to avoid dispute penalty fees."
            )
            strategy = "Mitigate loss; avoid submitting unsubstantiated claims to PayPal."

        else:
            recommended_action = "CONTEST_WITH_CAUTION"
            response_headline = f"Provide Available Records for Dispute {dispute_id}"
            formal_statement = (
                f"To the PayPal Dispute Resolution Team,\n\n"
                f"Regarding dispute {dispute_id} in the amount of {currency} {amount:,.2f}:\n"
                f"We have reviewed transaction {dispute.get('seller_transaction_id')}. Attached are the merchant billing receipts "
                f"and order processing records. We ask that the buyer verify receipt details and review the transaction timeline."
            )
            strategy = "Balanced contest with highlighted merchant transaction records."

        return {
            "agent": "Resolution Agent",
            "tone": tone,
            "recommended_action": recommended_action,
            "response_headline": response_headline,
            "formal_statement": formal_statement,
            "citations": citations,
            "strategy": strategy,
            "confidence_score": score,
            "prepared_at": datetime.utcnow().isoformat() + "Z"
        }

resolution_agent = ResolutionAgent()
