from app.services.rule_engine import rule_engine

class EvidenceAuditorAgent:
    """
    Step 4: Evidence Intelligence & Gap Detection.
    Checks whether required information is available, consistent, and whether
    contradictions exist before response drafting.
    """
    def run(self, dispute: dict, collector_output: dict, analyst_plan: dict) -> dict:
        order = collector_output.get("order_details")
        evidence_items = collector_output.get("evidence_items", [])

        # Run deterministic validation checks
        validation_results = rule_engine.validate_case(dispute, order, evidence_items)
        
        # Risk assessment
        rule_score = validation_results["rule_score"]
        gaps = validation_results["gaps"]
        contradictions = validation_results["contradictions"]

        if rule_score >= 80:
            evidence_readiness = "STRONG"
            audit_verdict = "EVIDENCE_VALIDATED_FOR_SUBMISSION"
        elif rule_score >= 50:
            evidence_readiness = "MODERATE"
            audit_verdict = "ACTIONABLE_GAPS_IDENTIFIED"
        else:
            evidence_readiness = "DEFICIENT"
            audit_verdict = "CRITICAL_MISSING_EVIDENCE"

        summary = (
            f"Audit finished with readiness '{evidence_readiness}' (Confidence Score: {rule_score}/100). "
            f"Detected {len(gaps)} missing evidence item(s) and {len(contradictions)} contradiction(s)."
        )

        return {
            "agent": "Evidence Auditor Agent",
            "evidence_readiness": evidence_readiness,
            "confidence_score": rule_score,
            "audit_verdict": audit_verdict,
            "checks": validation_results["checks"],
            "missing_gaps": gaps,
            "contradictions": contradictions,
            "recommendation": validation_results["recommendation"],
            "summary": summary
        }

auditor_agent = EvidenceAuditorAgent()
