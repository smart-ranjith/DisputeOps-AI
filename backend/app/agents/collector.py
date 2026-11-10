from app.services.merchant_data_service import merchant_data_service

class EvidenceCollectorAgent:
    """
    Step 3: Automated Evidence Collection.
    Retrieves records from merchant OMS, WMS, CRM, and shipping carriers.
    """
    def run(self, dispute: dict, analyst_plan: dict) -> dict:
        transaction_id = dispute.get("seller_transaction_id")
        dispute_id = dispute.get("dispute_id")
        
        # 1. Fetch matching Order
        order = merchant_data_service.get_order_by_transaction_id(transaction_id)
        collected_documents = []
        sources_consulted = ["Merchant ERP/OMS", "Logistics Gateway", "Payment Gateway Audit"]

        if order:
            # Add Invoice
            if order.get("invoice_number"):
                inv_doc = {
                    "category": "INVOICE",
                    "title": f"Tax Invoice #{order.get('invoice_number')}",
                    "description": f"Official invoice for item '{order.get('item_title')}' totaling {order.get('currency')} {order.get('amount')}.",
                    "document_url": f"/documents/invoices/{order.get('invoice_number')}.pdf",
                    "source_system": "ERP Billing System",
                    "verified": True
                }
                collected_documents.append(inv_doc)

            # Add Tracking & Carrier Info
            if order.get("tracking_number"):
                track_doc = {
                    "category": "TRACKING_INFO",
                    "title": f"Logistics Consignment - {order.get('carrier')}",
                    "description": f"Waybill #{order.get('tracking_number')} showing status: {order.get('delivery_status')} to {order.get('delivery_address')}.",
                    "document_url": f"https://track.{order.get('carrier', 'carrier').lower()}.com/{order.get('tracking_number')}",
                    "source_system": f"{order.get('carrier')} API",
                    "verified": bool(order.get("delivery_status") == "DELIVERED")
                }
                collected_documents.append(track_doc)

            # Add Proof of Delivery
            if order.get("proof_of_delivery_url"):
                pod_doc = {
                    "category": "PROOF_OF_DELIVERY",
                    "title": "Digital Proof of Delivery (POD) Receipt",
                    "description": f"Carrier signed electronic delivery sheet. Delivered date: {order.get('delivered_date')}. Signature recorded: {'YES' if order.get('signature_available') else 'NO'}.",
                    "document_url": order.get("proof_of_delivery_url"),
                    "source_system": "Courier Dispatch System",
                    "verified": True
                }
                collected_documents.append(pod_doc)

            # Add Refund / History check
            if order.get("refund_records"):
                refund_doc = {
                    "category": "REFUND_HISTORY",
                    "title": "Merchant Ledger Refund Records",
                    "description": f"Ledger entries: {order.get('refund_records')}",
                    "document_url": "/documents/ledger/refunds.json",
                    "source_system": "Merchant Ledger",
                    "verified": True
                }
                collected_documents.append(refund_doc)
        
        # Save records in database for this dispute
        existing_evidence = merchant_data_service.get_evidence_by_dispute(dispute_id)
        if not existing_evidence:
            for doc in collected_documents:
                doc_record = {**doc, "dispute_id": dispute_id}
                merchant_data_service.add_evidence_record(doc_record)

        summary = (
            f"Collected {len(collected_documents)} supporting documents across "
            f"{len(sources_consulted)} merchant and logistics data sources."
        )

        return {
            "agent": "Evidence Collector Agent",
            "order_found": bool(order),
            "order_details": order,
            "evidence_count": len(collected_documents),
            "evidence_items": collected_documents,
            "sources_consulted": sources_consulted,
            "summary": summary
        }

collector_agent = EvidenceCollectorAgent()
