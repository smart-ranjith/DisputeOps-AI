import React, { useState } from 'react';
import { ShieldCheck, X, AlertTriangle, Send, CheckCircle2 } from 'lucide-react';

export default function ApprovalModal({ isOpen, onClose, dispute, statement, onConfirm, isSubmitting, submissionReceipt }) {
  const [reviewerName, setReviewerName] = useState('Senior Operations Analyst');
  const [notes, setNotes] = useState('Reviewed courier POD, invoice, and tracking logs. Evidence package approved for contestation.');
  const [decision, setDecision] = useState('APPROVE_AND_SUBMIT');

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '1.5rem'
    }}>
      <div className="glass-card" style={{
        maxWidth: '680px',
        width: '100%',
        background: '#111827',
        border: '1px solid #4b5563',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
        padding: '1.75rem'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid #374151', paddingBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldCheck size={20} color="#10b981" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f9fafb' }}>
                Human Review & PayPal Submission Gate
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                Mandatory human oversight before submitting financial dispute evidence
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {submissionReceipt ? (
          /* Submission Result Card */
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem'
            }}>
              <CheckCircle2 size={32} color="#10b981" />
            </div>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#34d399', marginBottom: '0.35rem' }}>
              Successfully Submitted to PayPal API
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '1.25rem' }}>
              The authoritative dispute record has been updated with your evidence package.
            </p>
            <div style={{
              background: 'rgba(17, 24, 39, 0.8)',
              border: '1px solid #374151',
              borderRadius: '8px',
              padding: '1rem',
              textAlign: 'left',
              fontSize: '0.8rem',
              color: '#d1d5db',
              fontFamily: 'monospace',
              marginBottom: '1.5rem'
            }}>
              <div><strong>Receipt ID:</strong> {submissionReceipt.submission_id}</div>
              <div><strong>Submitted At:</strong> {submissionReceipt.submitted_at}</div>
              <div><strong>API Mode:</strong> {submissionReceipt.mode}</div>
              <div><strong>PayPal Status:</strong> {submissionReceipt.paypal_status}</div>
            </div>
            <button onClick={onClose} className="btn btn-primary" style={{ width: '100%' }}>
              Close & Return to Dashboard
            </button>
          </div>
        ) : (
          /* Form for Approval */
          <div>
            <div style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '8px',
              padding: '0.85rem',
              marginBottom: '1.25rem',
              fontSize: '0.8rem'
            }}>
              <div style={{ color: '#60a5fa', fontWeight: 600, marginBottom: '0.2rem' }}>
                Case Context: {dispute?.dispute_id}
              </div>
              <div style={{ color: '#d1d5db' }}>
                Claimant: {dispute?.buyer_name} | Disputed Amount: ₹{dispute?.amount?.toLocaleString('en-IN')} {dispute?.currency}
              </div>
            </div>

            {/* Reviewer Name */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#9ca3af', marginBottom: '0.3rem', fontWeight: 600 }}>
                Authorized Reviewer Name / Employee ID:
              </label>
              <input
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(17, 24, 39, 0.85)',
                  border: '1px solid #374151',
                  borderRadius: '6px',
                  color: '#f3f4f6',
                  padding: '0.55rem 0.75rem',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            {/* Decision selector */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#9ca3af', marginBottom: '0.4rem', fontWeight: 600 }}>
                Action Decision:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setDecision('APPROVE_AND_SUBMIT')}
                  style={{
                    padding: '0.7rem',
                    borderRadius: '8px',
                    border: `2px solid ${decision === 'APPROVE_AND_SUBMIT' ? '#10b981' : '#374151'}`,
                    background: decision === 'APPROVE_AND_SUBMIT' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(17, 24, 39, 0.6)',
                    color: decision === 'APPROVE_AND_SUBMIT' ? '#34d399' : '#9ca3af',
                    fontWeight: 600,
                    fontSize: '0.825rem',
                    cursor: 'pointer'
                  }}
                >
                  ✓ Approve & Transmit to PayPal
                </button>
                <button
                  type="button"
                  onClick={() => setDecision('REJECT_AND_REFUND')}
                  style={{
                    padding: '0.7rem',
                    borderRadius: '8px',
                    border: `2px solid ${decision === 'REJECT_AND_REFUND' ? '#ef4444' : '#374151'}`,
                    background: decision === 'REJECT_AND_REFUND' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(17, 24, 39, 0.6)',
                    color: decision === 'REJECT_AND_REFUND' ? '#f87171' : '#9ca3af',
                    fontWeight: 600,
                    fontSize: '0.825rem',
                    cursor: 'pointer'
                  }}
                >
                  ✕ Concede & Issue Refund
                </button>
              </div>
            </div>

            {/* Reviewer Audit Notes */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#9ca3af', marginBottom: '0.3rem', fontWeight: 600 }}>
                Audit Log Justification Notes:
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  background: 'rgba(17, 24, 39, 0.85)',
                  border: '1px solid #374151',
                  borderRadius: '6px',
                  color: '#f3f4f6',
                  padding: '0.55rem 0.75rem',
                  fontSize: '0.8rem',
                  lineHeight: '1.4'
                }}
              />
            </div>

            {/* Submit Action */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
              <button
                onClick={() => onConfirm({ reviewerName, decision, notes, finalStatement: statement })}
                className={decision === 'APPROVE_AND_SUBMIT' ? "btn btn-success" : "btn btn-danger"}
                disabled={isSubmitting || !reviewerName}
                style={{ padding: '0.6rem 1.4rem' }}
              >
                {isSubmitting ? 'Transmitting to PayPal API...' : decision === 'APPROVE_AND_SUBMIT' ? 'Authorize & Submit to PayPal' : 'Confirm Concession'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
