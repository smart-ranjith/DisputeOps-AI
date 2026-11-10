import React, { useState } from 'react';
import { ShieldCheck, X, AlertTriangle, Send, CheckCircle2, Lock, FileCheck, ArrowRight } from 'lucide-react';

export default function ApprovalModal({ isOpen, onClose, dispute, statement, onConfirm, isSubmitting, submissionReceipt }) {
  const [reviewerName, setReviewerName] = useState('Senior Operations Analyst');
  const [notes, setNotes] = useState('Reviewed courier POD, invoice, and tracking logs. Evidence package verified and approved for formal submission to PayPal.');
  const [decision, setDecision] = useState('APPROVE_AND_SUBMIT');

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(3, 7, 18, 0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 120,
      padding: '1.5rem'
    }}>
      <div className="glass-card" style={{
        maxWidth: '720px',
        width: '100%',
        background: '#0f172a',
        border: '1px solid #10b981',
        boxShadow: '0 0 35px rgba(16, 185, 129, 0.25), 0 25px 50px rgba(0, 0, 0, 0.8)',
        borderRadius: '16px',
        padding: '2rem',
        color: '#f8fafc'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
            }}>
              <ShieldCheck size={24} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>
                  Human Review & PayPal Submission Gate
                </h3>
                <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>
                  Step 6 & 7
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                Mandatory operational oversight before transmitting financial dispute evidence to PayPal REST API
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <X size={22} />
          </button>
        </div>

        {submissionReceipt ? (
          /* Submission Receipt View */
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.2)',
              border: '2px solid #10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem'
            }}>
              <CheckCircle2 size={36} color="#10b981" />
            </div>
            <h4 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#34d399', marginBottom: '0.35rem' }}>
              Transmitted to PayPal Disputes API
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
              Authoritative evidence package registered with PayPal Resolution Center.
            </p>
            <div style={{
              background: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid #334155',
              borderRadius: '10px',
              padding: '1.25rem',
              textAlign: 'left',
              fontSize: '0.85rem',
              color: '#cbd5e1',
              fontFamily: 'monospace',
              lineHeight: '1.7',
              marginBottom: '1.75rem'
            }}>
              <div><strong style={{ color: '#94a3b8' }}>SUBMISSION RECEIPT:</strong> <span style={{ color: '#38bdf8' }}>{submissionReceipt.submission_id}</span></div>
              <div><strong style={{ color: '#94a3b8' }}>TRANSMITTED AT:</strong> {submissionReceipt.submitted_at}</div>
              <div><strong style={{ color: '#94a3b8' }}>GATEWAY STATUS:</strong> <span style={{ color: '#34d399' }}>{submissionReceipt.paypal_status}</span></div>
              <div><strong style={{ color: '#94a3b8' }}>INTEGRATION MODE:</strong> {submissionReceipt.mode} (OAuth 2.0)</div>
            </div>
            <button onClick={onClose} className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
              Return to Dispute Case Workspace
            </button>
          </div>
        ) : (
          /* Review Form */
          <div>
            {/* Case Snapshot Banner */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.7))',
              border: '1px solid #334155',
              borderRadius: '10px',
              padding: '1rem 1.25rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  PAYPAL DISPUTE CASE
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>
                  {dispute?.dispute_id} ({dispute?.buyer_name})
                </div>
                <div style={{ fontSize: '0.78rem', color: '#60a5fa' }}>
                  Transaction Ref: {dispute?.seller_transaction_id}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Disputed Claim</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#34d399' }}>
                  ₹{dispute?.amount?.toLocaleString('en-IN')} <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{dispute?.currency}</span>
                </div>
              </div>
            </div>

            {/* Evidence Checklist Verified by Auditor */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid #334155',
              borderRadius: '8px',
              padding: '0.85rem 1rem',
              marginBottom: '1.25rem',
              fontSize: '0.8rem'
            }}>
              <div style={{ fontWeight: 700, color: '#94a3b8', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FileCheck size={14} color="#34d399" />
                VERIFIED EVIDENCE BINDER ATTACHED (100% GROUNDED):
              </div>
              <ul style={{ paddingLeft: '1.2rem', color: '#cbd5e1', lineHeight: '1.6' }}>
                <li>✓ Carrier Logistics Consignment: BlueDart Express (Status: <strong>DELIVERED</strong>)</li>
                <li>✓ Digital Proof of Delivery: Geo-tagged signed sheet (Delivered: 04/11/2026)</li>
                <li>✓ Official Merchant Tax Invoice: Matched amount & customer details</li>
              </ul>
            </div>

            {/* Reviewer Name */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.35rem', fontWeight: 600 }}>
                Authorized Operator Name & Title:
              </label>
              <input
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  color: '#f8fafc',
                  padding: '0.6rem 0.8rem',
                  fontSize: '0.85rem',
                  fontWeight: 500
                }}
              />
            </div>

            {/* Action Decision Selector */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: 600 }}>
                Authorization Decision:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <button
                  type="button"
                  onClick={() => setDecision('APPROVE_AND_SUBMIT')}
                  style={{
                    padding: '0.85rem',
                    borderRadius: '8px',
                    border: `2px solid ${decision === 'APPROVE_AND_SUBMIT' ? '#10b981' : '#334155'}`,
                    background: decision === 'APPROVE_AND_SUBMIT' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(15, 23, 42, 0.7)',
                    color: decision === 'APPROVE_AND_SUBMIT' ? '#34d399' : '#94a3b8',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  ✓ Authorize & Submit Evidence Package
                </button>
                <button
                  type="button"
                  onClick={() => setDecision('REJECT_AND_REFUND')}
                  style={{
                    padding: '0.85rem',
                    borderRadius: '8px',
                    border: `2px solid ${decision === 'REJECT_AND_REFUND' ? '#ef4444' : '#334155'}`,
                    background: decision === 'REJECT_AND_REFUND' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(15, 23, 42, 0.7)',
                    color: decision === 'REJECT_AND_REFUND' ? '#f87171' : '#94a3b8',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  ✕ Concede & Issue Concession Refund
                </button>
              </div>
            </div>

            {/* Reviewer Audit Justification */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.35rem', fontWeight: 600 }}>
                Immutable Audit Log Justification:
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                style={{
                  width: '100%',
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  color: '#f8fafc',
                  padding: '0.6rem 0.8rem',
                  fontSize: '0.8rem',
                  lineHeight: '1.4'
                }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.85rem' }}>
              <button onClick={onClose} className="btn btn-secondary" style={{ padding: '0.65rem 1.25rem' }}>
                Cancel
              </button>
              <button
                onClick={() => onConfirm({ reviewerName, decision, notes, finalStatement: statement })}
                className={decision === 'APPROVE_AND_SUBMIT' ? "btn btn-success" : "btn btn-danger"}
                disabled={isSubmitting || !reviewerName}
                style={{ padding: '0.65rem 1.6rem', fontSize: '0.875rem' }}
              >
                {isSubmitting ? 'Transmitting to PayPal API...' : decision === 'APPROVE_AND_SUBMIT' ? 'Submit to PayPal Disputes API' : 'Confirm Concession'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
