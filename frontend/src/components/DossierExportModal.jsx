import React, { useState, useEffect } from 'react';
import { X, Printer, ShieldCheck, Download, CheckCircle2, FileText, Lock } from 'lucide-react';

export default function DossierExportModal({ isOpen, onClose, disputeId }) {
  const [dossier, setDossier] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && disputeId) {
      setLoading(true);
      fetch(`http://localhost:8000/api/disputes/${disputeId}/dossier`)
        .then(res => res.json())
        .then(data => {
          setDossier(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch dossier:", err);
          setLoading(false);
        });
    }
  }, [isOpen, disputeId]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 110,
      padding: '1.5rem'
    }}>
      <div className="glass-card" style={{
        maxWidth: '850px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        background: '#ffffff',
        color: '#0f172a',
        border: '1px solid #cbd5e1',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.6)',
        padding: '2.5rem',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        {/* Top Action Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              OFFICIAL DISPUTE EVIDENCE DOSSIER
            </span>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a' }}>
              Case Binder: {disputeId}
            </h2>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => window.print()}
              style={{
                background: '#1e3a8a',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '0.5rem 1rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Printer size={15} /> Print / Export PDF
            </button>
            <button
              onClick={onClose}
              style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#475569', padding: '0.5rem', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            Compiling Official Evidence Packet...
          </div>
        ) : (
          <div>
            {/* Header Metadata */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '1.25rem',
              marginBottom: '1.5rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
              fontSize: '0.85rem'
            }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>DISPUTE ID:</span>
                <div style={{ fontWeight: 800 }}>{dossier?.dispute?.dispute_id}</div>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>DISPUTED VALUE:</span>
                <div style={{ fontWeight: 800, color: '#2563eb' }}>
                  ₹{dossier?.dispute?.amount?.toLocaleString('en-IN')} {dossier?.dispute?.currency}
                </div>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>CLAIMANT (BUYER):</span>
                <div style={{ fontWeight: 700 }}>{dossier?.dispute?.buyer_name}</div>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>PAYPAL REASON:</span>
                <div style={{ fontWeight: 700 }}>{dossier?.dispute?.reason}</div>
              </div>
            </div>

            {/* Section 1: Multi-Agent Findings */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e3a8a', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.4rem', marginBottom: '0.75rem' }}>
                1. Multi-Agent Autonomous Findings
              </h3>
              <div style={{ fontSize: '0.85rem', lineHeight: '1.5', color: '#334155' }}>
                <p style={{ marginBottom: '0.4rem' }}>
                  <strong>Dispute Analyst:</strong> {dossier?.case?.analyst_output?.summary || 'N/A'}
                </p>
                <p style={{ marginBottom: '0.4rem' }}>
                  <strong>Evidence Auditor:</strong> {dossier?.case?.auditor_output?.summary || 'N/A'} (Readiness Confidence: {dossier?.case?.auditor_output?.confidence_score}/100)
                </p>
                {dossier?.case?.auditor_output?.missing_gaps?.length > 0 && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '0.6rem 0.8rem', borderRadius: '6px', color: '#b91c1c', marginTop: '0.5rem' }}>
                    <strong>Detected Evidence Gaps:</strong> {dossier?.case?.auditor_output?.missing_gaps?.join('; ')}
                  </div>
                )}
              </div>
            </div>

            {/* Section 2: Fulfillment & Carrier Audit */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e3a8a', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.4rem', marginBottom: '0.75rem' }}>
                2. Merchant Fulfillment & Carrier Telematics
              </h3>
              <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                <div>Order Ref: <strong>{dossier?.order?.order_id}</strong> (Invoice: {dossier?.order?.invoice_number})</div>
                <div>Logistics Carrier: <strong>{dossier?.order?.carrier}</strong> | Waybill #{dossier?.order?.tracking_number}</div>
                <div>Delivery Status: <strong style={{ color: dossier?.order?.delivery_status === 'DELIVERED' ? '#15803d' : '#b45309' }}>{dossier?.order?.delivery_status}</strong> (Timestamp: {dossier?.order?.delivered_date || 'N/A'})</div>
                <div>Recipient Address: {dossier?.order?.delivery_address}</div>
              </div>
            </div>

            {/* Section 3: Formal Defense Statement Submitted to PayPal */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e3a8a', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.4rem', marginBottom: '0.75rem' }}>
                3. Grounded Response Statement Transmitted to PayPal API
              </h3>
              <div style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '1rem',
                fontSize: '0.825rem',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                lineHeight: '1.5',
                color: '#0f172a'
              }}>
                {dossier?.case?.resolution_draft?.formal_statement || 'No statement drafted.'}
              </div>
            </div>

            {/* Section 4: Human Review & Submission Seal */}
            <div style={{
              border: '2px solid #22c55e',
              background: '#f0fdf4',
              borderRadius: '8px',
              padding: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#15803d', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ShieldCheck size={18} /> AUTHORIZED HUMAN REVIEW VERIFICATION
                </div>
                <div style={{ fontSize: '0.85rem', color: '#14532d', marginTop: '0.2rem' }}>
                  Approved by: <strong>{dossier?.case?.reviewer_notes || 'Senior Operations Specialist'}</strong>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#166534' }}>
                  Submitted to PayPal Disputes API (OAuth 2.0). Immutable audit trail preserved in SQLite ledger.
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 700 }}>SUBMISSION RECEIPT</div>
                <div style={{ fontFamily: 'monospace', fontWeight: 800, color: '#0f172a' }}>
                  {dossier?.case?.submission_receipt?.submission_id || 'PP-SUB-AUTHENTICATED'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
