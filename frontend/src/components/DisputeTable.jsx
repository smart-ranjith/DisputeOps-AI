import React from 'react';
import { Eye, Play, CheckCircle2, AlertTriangle, Clock, ArrowRight, ShieldAlert } from 'lucide-react';

export default function DisputeTable({ disputes, selectedDisputeId, onSelectDispute, onInvestigate, isInvestigating }) {
  const getReasonLabel = (reason) => {
    switch (reason) {
      case 'MERCHANDISE_OR_SERVICE_NOT_RECEIVED':
        return { label: 'Item Not Received (INR)', badge: 'badge-blue' };
      case 'MERCHANDISE_OR_SERVICE_NOT_AS_DESCRIBED':
        return { label: 'Not as Described (SNAD)', badge: 'badge-purple' };
      case 'UNAUTHORISED':
        return { label: 'Unauthorized Chargeback', badge: 'badge-red' };
      default:
        return { label: reason, badge: 'badge-amber' };
    }
  };

  const getStatusBadge = (status, invStatus) => {
    if (invStatus === 'SUBMITTED' || status === 'RESOLVED_REFUNDED') {
      return <span className="badge badge-green"><CheckCircle2 size={12} /> Resolved / Submitted</span>;
    }
    if (invStatus === 'INVESTIGATED') {
      return <span className="badge badge-purple"><Eye size={12} /> Investigated (Review)</span>;
    }
    return <span className="badge badge-amber"><Clock size={12} /> Awaiting Investigation</span>;
  };

  return (
    <div className="glass-card" style={{ overflow: 'hidden', marginBottom: '2rem' }}>
      <div style={{
        padding: '1.25rem 1.5rem',
        borderBottom: '1px solid #374151',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(31, 41, 55, 0.4)'
      }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f9fafb' }}>
            PayPal Dispute Inbox
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
            Authoritative cases synchronized via PayPal Disputes REST API
          </p>
        </div>
        <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
          Showing <strong>{disputes.length}</strong> active disputes
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: 'rgba(17, 24, 39, 0.6)', borderBottom: '1px solid #374151', color: '#9ca3af', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th style={{ padding: '0.85rem 1.25rem' }}>Dispute ID & Buyer</th>
              <th style={{ padding: '0.85rem 1.25rem' }}>Dispute Reason</th>
              <th style={{ padding: '0.85rem 1.25rem' }}>Amount</th>
              <th style={{ padding: '0.85rem 1.25rem' }}>Stage & Deadline</th>
              <th style={{ padding: '0.85rem 1.25rem' }}>Workflow Status</th>
              <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {disputes.map((d) => {
              const isSelected = d.dispute_id === selectedDisputeId;
              const reasonInfo = getReasonLabel(d.reason);
              const isCurrentlyInvestigating = isInvestigating && isSelected;

              return (
                <tr
                  key={d.dispute_id}
                  onClick={() => onSelectDispute(d.dispute_id)}
                  style={{
                    borderBottom: '1px solid #1f2937',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'rgba(55, 65, 81, 0.35)'; }}
                  onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                >
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ fontWeight: 600, color: '#f3f4f6' }}>{d.dispute_id}</div>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{d.buyer_name} ({d.seller_transaction_id})</div>
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span className={`badge ${reasonInfo.badge}`}>
                      {reasonInfo.label}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ fontWeight: 700, color: '#f9fafb' }}>
                      ₹{d.amount.toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{d.currency}</div>
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#fbbf24', fontSize: '0.8rem', fontWeight: 600 }}>
                      <Clock size={13} />
                      {d.lifecycle_stage}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
                      Due: {d.response_due_date ? new Date(d.response_due_date).toLocaleDateString() : 'N/A'}
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    {getStatusBadge(d.status, d.investigation_status)}
                  </td>
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                    {d.investigation_status === 'PENDING' ? (
                      <button
                        className="btn btn-primary"
                        style={{ padding: '0.4rem 0.85rem', fontSize: '0.75rem' }}
                        disabled={isCurrentlyInvestigating}
                        onClick={(e) => {
                          e.stopPropagation();
                          onInvestigate(d.dispute_id);
                        }}
                      >
                        <Play size={13} />
                        {isCurrentlyInvestigating ? 'Investigating...' : 'Start Investigation'}
                      </button>
                    ) : (
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '0.4rem 0.85rem', fontSize: '0.75rem' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectDispute(d.dispute_id);
                        }}
                      >
                        <Eye size={13} />
                        View Findings
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
