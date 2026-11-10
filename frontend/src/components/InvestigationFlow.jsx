import React from 'react';
import { Bot, Search, ShieldCheck, FileText, CheckCircle2, AlertTriangle, ArrowRight, Clock, Zap } from 'lucide-react';

export default function InvestigationFlow({ caseData, trace, isInvestigating }) {
  const steps = [
    {
      id: 1,
      title: "Dispute Analyst Agent",
      role: "Dispute Reason & Requirement Analysis",
      icon: Bot,
      color: "#3b82f6",
      data: caseData?.analyst_output
    },
    {
      id: 2,
      title: "Evidence Collector Agent",
      role: "Cross-System Merchant Record Retrieval",
      icon: Search,
      color: "#06b6d4",
      data: caseData?.collector_output
    },
    {
      id: 3,
      title: "Evidence Auditor Agent",
      role: "Deterministic Audit & Gap Detection",
      icon: ShieldCheck,
      color: "#f59e0b",
      data: caseData?.auditor_output
    },
    {
      id: 4,
      title: "Resolution Agent",
      role: "Grounded Response & Strategy Synthesis",
      icon: FileText,
      color: "#10b981",
      data: caseData?.resolution_draft
    }
  ];

  return (
    <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f9fafb' }}>
              Multi-Agent Investigation Workflow
            </h3>
            <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>
              Autonomous Execution
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
            Specialized agents collaborate across the case context to assemble and audit evidence
          </p>
        </div>

        {trace && trace.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'rgba(17, 24, 39, 0.7)',
            padding: '0.35rem 0.75rem',
            borderRadius: '6px',
            border: '1px solid #374151',
            fontSize: '0.75rem',
            color: '#10b981'
          }}>
            <Zap size={13} />
            <span>Completed in {trace.reduce((acc, t) => acc + (t.duration_ms || 0), 0).toFixed(1)} ms</span>
          </div>
        )}
      </div>

      {/* Agents Stepper Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '1rem'
      }}>
        {steps.map((step) => {
          const Icon = step.icon;
          const hasData = Boolean(step.data);

          return (
            <div
              key={step.id}
              style={{
                background: 'rgba(17, 24, 39, 0.75)',
                border: `1px solid ${hasData ? step.color + '55' : '#374151'}`,
                borderRadius: '10px',
                padding: '1.15rem',
                position: 'relative',
                transition: 'all 0.2s ease'
              }}
            >
              {/* Agent Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: `rgba(${step.id === 1 ? '59, 130, 246' : step.id === 2 ? '6, 182, 212' : step.id === 3 ? '245, 158, 11' : '16, 185, 129'}, 0.2)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon size={18} color={step.color} />
                </div>

                {hasData ? (
                  <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>
                    <CheckCircle2 size={11} /> Ready
                  </span>
                ) : isInvestigating ? (
                  <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>
                    <Clock size={11} /> Running...
                  </span>
                ) : (
                  <span className="badge" style={{ background: '#374151', color: '#9ca3af', fontSize: '0.65rem' }}>
                    Standby
                  </span>
                )}
              </div>

              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f3f4f6', marginBottom: '0.15rem' }}>
                {step.title}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginBottom: '0.85rem' }}>
                {step.role}
              </div>

              {/* Agent Findings Snippet */}
              {step.data ? (
                <div style={{
                  background: 'rgba(31, 41, 55, 0.6)',
                  borderRadius: '6px',
                  padding: '0.65rem',
                  fontSize: '0.75rem',
                  color: '#d1d5db',
                  lineHeight: '1.4'
                }}>
                  {step.id === 1 && (
                    <>
                      <div><strong>Type:</strong> {step.data.classification}</div>
                      <div><strong>Strategy:</strong> {step.data.investigation_type}</div>
                      <div style={{ color: '#fbbf24', marginTop: '0.2rem' }}>
                        Required: {step.data.required_evidence?.length || 0} evidence categories
                      </div>
                    </>
                  )}

                  {step.id === 2 && (
                    <>
                      <div><strong>Found Order:</strong> {step.data.order_found ? step.data.order_details?.order_id : 'No Match'}</div>
                      <div><strong>Collected:</strong> {step.data.evidence_count} documents</div>
                      <div style={{ color: '#38bdf8', marginTop: '0.2rem' }}>
                        Sources: {step.data.sources_consulted?.join(', ')}
                      </div>
                    </>
                  )}

                  {step.id === 3 && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span><strong>Score:</strong> {step.data.confidence_score}/100</span>
                        <span className={`badge ${step.data.confidence_score >= 80 ? 'badge-green' : 'badge-amber'}`} style={{ fontSize: '0.6rem' }}>
                          {step.data.evidence_readiness}
                        </span>
                      </div>
                      <div style={{ color: step.data.missing_gaps?.length ? '#f87171' : '#34d399', marginTop: '0.2rem' }}>
                        {step.data.missing_gaps?.length ? `⚠️ ${step.data.missing_gaps.length} Gap(s) Flagged` : '✓ All Mandates Met'}
                      </div>
                    </>
                  )}

                  {step.id === 4 && (
                    <>
                      <div style={{ color: '#34d399', fontWeight: 600 }}>
                        {step.data.recommended_action}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.2rem' }}>
                        {step.data.citations?.length || 0} Verified citations attached
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div style={{ fontSize: '0.75rem', color: '#6b7280', fontStyle: 'italic' }}>
                  Awaiting case execution trigger
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
