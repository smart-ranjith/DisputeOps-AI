import React, { useState, useEffect } from 'react';
import { Send, Edit3, Check, ShieldCheck, Tag, Sparkles, FileText, Printer } from 'lucide-react';

export default function ResponseEditor({
  resolutionData,
  onSaveDraft,
  onOpenApproval,
  caseStatus,
  onRegenerateTone,
  isRegeneratingTone,
  onOpenDossier
}) {
  const [statement, setStatement] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const currentTone = resolutionData?.tone || 'PAYPAL_STANDARD';

  useEffect(() => {
    if (resolutionData?.formal_statement) {
      setStatement(resolutionData.formal_statement);
    }
  }, [resolutionData]);

  if (!resolutionData) {
    return (
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem', textAlign: 'center', color: '#9ca3af' }}>
        Run multi-agent investigation to generate an evidence-grounded response draft.
      </div>
    );
  }

  const handleSave = () => {
    onSaveDraft(statement, resolutionData.response_headline);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const isAlreadySubmitted = caseStatus === 'APPROVED_AND_SUBMITTED';

  return (
    <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f9fafb' }}>
              Evidence-Backed Response Draft
            </h3>
            <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>
              Grounding Verified
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
            Synthesized by Resolution Agent with deterministic fact-checking
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            onClick={onOpenDossier}
            className="btn btn-secondary"
            style={{ padding: '0.45rem 0.85rem' }}
            title="Export Evidence Dossier PDF"
          >
            <Printer size={14} />
            <span>Export Dossier</span>
          </button>

          <button
            onClick={handleSave}
            className="btn btn-secondary"
            disabled={isAlreadySubmitted}
            style={{ padding: '0.45rem 0.9rem' }}
          >
            {isSaved ? <Check size={14} color="#34d399" /> : <Edit3 size={14} />}
            <span>{isSaved ? 'Saved Draft' : 'Save Edits'}</span>
          </button>

          {!isAlreadySubmitted && (
            <button
              onClick={() => onOpenApproval(statement)}
              className="btn btn-primary"
              style={{ padding: '0.45rem 1.1rem' }}
            >
              <ShieldCheck size={16} />
              <span>Review & Approve Submission</span>
            </button>
          )}
        </div>
      </div>

      {/* AI Tone Customizer Toolbar */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.7)',
        border: '1px solid #334155',
        borderRadius: '8px',
        padding: '0.75rem 1rem',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#cbd5e1' }}>
          <Sparkles size={14} color="#38bdf8" />
          <span>Resolution Agent Voice & Tone:</span>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {[
            { id: 'PAYPAL_STANDARD', label: 'Standard PayPal Compliance' },
            { id: 'FIRM_LEGAL', label: 'Firm Legal Rebuttal' },
            { id: 'CUSTOMER_CENTRIC', label: 'Customer-Centric / Conciliatory' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => onRegenerateTone(t.id)}
              disabled={isRegeneratingTone || isAlreadySubmitted}
              style={{
                background: currentTone === t.id ? '#2563eb' : 'rgba(30, 41, 59, 0.7)',
                color: currentTone === t.id ? '#ffffff' : '#94a3b8',
                border: `1px solid ${currentTone === t.id ? '#3b82f6' : '#334155'}`,
                padding: '0.3rem 0.65rem',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: currentTone === t.id ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recommended Strategy Badge */}
      <div style={{
        background: 'rgba(17, 24, 39, 0.75)',
        border: '1px solid #374151',
        borderRadius: '8px',
        padding: '0.75rem 1rem',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ fontSize: '0.825rem' }}>
          <span style={{ color: '#9ca3af' }}>Investigation Strategy: </span>
          <strong style={{ color: '#60a5fa' }}>{resolutionData.strategy}</strong>
        </div>
        <div className="badge badge-purple" style={{ fontSize: '0.65rem' }}>
          Action: {resolutionData.recommended_action}
        </div>
      </div>

      {/* Editable Response Area */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontSize: '0.78rem', color: '#9ca3af', marginBottom: '0.4rem', fontWeight: 600 }}>
          Formal Statement Prepared for PayPal Dispute Operations:
        </label>
        <textarea
          value={statement}
          onChange={(e) => setStatement(e.target.value)}
          disabled={isAlreadySubmitted || isRegeneratingTone}
          rows={9}
          style={{
            width: '100%',
            background: 'rgba(11, 15, 25, 0.85)',
            border: '1px solid #374151',
            borderRadius: '8px',
            color: '#f3f4f6',
            padding: '0.85rem',
            fontSize: '0.85rem',
            fontFamily: 'monospace',
            lineHeight: '1.5',
            resize: 'vertical'
          }}
        />
      </div>

      {/* Evidence Citations Attached */}
      <div>
        <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.4rem' }}>
          <Tag size={12} /> Grounded Evidence Citations Attached to Submission:
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {resolutionData.citations?.map((c, i) => (
            <span key={i} className="badge badge-blue" style={{ fontSize: '0.7rem' }}>
              [{c.category}] {c.title}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
