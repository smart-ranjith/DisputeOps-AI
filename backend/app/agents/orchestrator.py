import time
import json
from datetime import datetime
from app.database import get_db_connection, log_audit
from app.agents.analyst import analyst_agent
from app.agents.collector import collector_agent
from app.agents.auditor import auditor_agent
from app.agents.resolution import resolution_agent

class MultiAgentOrchestrator:
    """
    Coordinates the multi-agent investigation workflow:
    Analyst -> Collector -> Auditor -> Resolution Agent
    """
    def run_investigation(self, dispute_id: str, tone: str = "PAYPAL_STANDARD") -> dict:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 1. Fetch Dispute record
        cursor.execute("SELECT * FROM disputes WHERE dispute_id = ?", (dispute_id,))
        dispute_row = cursor.fetchone()
        if not dispute_row:
            conn.close()
            raise ValueError(f"Dispute with ID {dispute_id} not found.")

        dispute = dict(dispute_row)
        trace = []
        overall_start = time.time()

        # Step 1: Analyst Agent
        s1_start = time.time()
        analyst_result = analyst_agent.run(dispute)
        s1_duration = round((time.time() - s1_start) * 1000, 2)
        trace.append({
            "step": 1,
            "agent": "Dispute Analyst Agent",
            "status": "COMPLETED",
            "duration_ms": s1_duration,
            "output_summary": analyst_result.get("summary")
        })

        # Step 2: Collector Agent
        s2_start = time.time()
        collector_result = collector_agent.run(dispute, analyst_result)
        s2_duration = round((time.time() - s2_start) * 1000, 2)
        trace.append({
            "step": 2,
            "agent": "Evidence Collector Agent",
            "status": "COMPLETED",
            "duration_ms": s2_duration,
            "output_summary": collector_result.get("summary")
        })

        # Step 3: Auditor Agent
        s3_start = time.time()
        auditor_result = auditor_agent.run(dispute, collector_result, analyst_result)
        s3_duration = round((time.time() - s3_start) * 1000, 2)
        trace.append({
            "step": 3,
            "agent": "Evidence Auditor Agent",
            "status": "COMPLETED",
            "duration_ms": s3_duration,
            "output_summary": auditor_result.get("summary")
        })

        # Step 4: Resolution Agent
        s4_start = time.time()
        resolution_result = resolution_agent.run(dispute, analyst_result, collector_result, auditor_result, tone=tone)
        s4_duration = round((time.time() - s4_start) * 1000, 2)
        trace.append({
            "step": 4,
            "agent": "Resolution Agent",
            "status": "COMPLETED",
            "duration_ms": s4_duration,
            "output_summary": f"Draft response generated with strategy: {resolution_result.get('strategy')}"
        })

        total_time_ms = round((time.time() - overall_start) * 1000, 2)

        # Update Investigation Case in database
        updated_at = datetime.utcnow().isoformat() + "Z"
        cursor.execute("""
            INSERT INTO investigation_cases (
                dispute_id, analyst_output, collector_output, auditor_output, resolution_draft,
                human_review_status, updated_at
            ) VALUES (?, ?, ?, ?, ?, 'PENDING_REVIEW', ?)
            ON CONFLICT(dispute_id) DO UPDATE SET
                analyst_output = excluded.analyst_output,
                collector_output = excluded.collector_output,
                auditor_output = excluded.auditor_output,
                resolution_draft = excluded.resolution_draft,
                human_review_status = 'PENDING_REVIEW',
                updated_at = excluded.updated_at
        """, (
            dispute_id,
            json.dumps(analyst_result),
            json.dumps(collector_result),
            json.dumps(auditor_result),
            json.dumps(resolution_result),
            updated_at
        ))

        cursor.execute("UPDATE disputes SET investigation_status = 'INVESTIGATED' WHERE dispute_id = ?", (dispute_id,))
        conn.commit()
        conn.close()

        log_audit(
            dispute_id=dispute_id,
            action="MULTI_AGENT_INVESTIGATION_COMPLETED",
            actor="DisputeOps Orchestrator",
            details={
                "total_time_ms": total_time_ms,
                "readiness": auditor_result.get("evidence_readiness"),
                "confidence": auditor_result.get("confidence_score")
            }
        )

        return {
            "dispute_id": dispute_id,
            "status": "SUCCESS",
            "total_time_ms": total_time_ms,
            "trace": trace,
            "analyst": analyst_result,
            "collector": collector_result,
            "auditor": auditor_result,
            "resolution": resolution_result,
            "human_review_status": "PENDING_REVIEW"
        }

orchestrator = MultiAgentOrchestrator()
