import React from 'react';
import { Package, Truck, FileCheck, AlertOctagon, CheckCircle2, AlertTriangle, ExternalLink, ShieldAlert } from 'lucide-react';

export default function EvidencePackage({ order, evidence, auditorData, onViewDoc }) {
  const gaps = auditorData?.missing_gaps || [];
  const contradictions = auditorData?.contradictions || [];
  const checks = auditorData?.checks || [];

  return (
    <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f9fafb' }}>
            Evidence Intelligence & Audit Package
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
            Merchant records evaluated against PayPal seller protection and evidence mandates
          </p>
        </div>

        {auditorData && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Readiness Score:</span>
            <div style={{
              fontSize: '1.2rem',
              fontWeight: 800,
              color: auditorData.confidence_score >= 80 ? '#34d399' : auditorData.confidence_score >= 50 ? '#fbbf24' : '#f87171'
            }}>
              {auditorData.confidence_score} / 100
            </div>
          </div>
        )}
      </div>

      {/* GAP DETECTOR ALERT CARD (If Gaps Exist) */}
      {gaps.length > 0 && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.35)',
          borderRadius: '10px',
          padding: '1.15rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <AlertOctagon size={20} color="#f87171" />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fca5a5' }}>
              Evidence Auditor Flagged Critical Information Gaps
            </h4>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#e5e7eb', marginBottom: '0.75rem' }}>
            The system prevented generating an unsubstantiated delivery claim because the following mandatory evidence is missing:
          </p>
          <ul style={{ paddingLeft: '1.25rem', fontSize: '0.8rem', color: '#fca5a5' }}>
            {gaps.map((gap, i) => (
              <li key={i} style={{ marginBottom: '0.25rem' }}>{gap}</li>
            ))}
          </ul>
          {auditorData?.recommendation && (
            <div style={{
              marginTop: '0.75rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid rgba(239, 68, 68, 0.25)',
              fontSize: '0.8rem',
              color: '#fbbf24',
              fontWeight: 600
            }}>
              Recommendation: {auditorData.recommendation}
            </div>
          )}
        </div>
      )}

      {/* Linked Order Overview */}
      {order ? (
        <div style={{
          background: 'rgba(17, 24, 39, 0.6)',
          border: '1px solid #374151',
          borderRadius: '10px',
          padding: '1.15rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Package size={17} color="#38bdf8" />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f3f4f6' }}>
              Linked Merchant Order: {order.order_id} ({order.item_title})
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.75rem',
            fontSize: '0.8rem'
          }}>
            <div>
              <span style={{ color: '#9ca3af' }}>Transaction Ref:</span>
              <div style={{ fontWeight: 600, color: '#e5e7eb' }}>{order.transaction_id}</div>
            </div>
            <div>
              <span style={{ color: '#9ca3af' }}>Customer & Email:</span>
              <div style={{ fontWeight: 600, color: '#e5e7eb' }}>{order.customer_name} ({order.customer_email})</div>
            </div>
            <div>
              <span style={{ color: '#9ca3af' }}>Carrier & Tracking:</span>
              <div style={{ fontWeight: 600, color: '#38bdf8' }}>{order.carrier} - {order.tracking_number}</div>
            </div>
            <div>
              <span style={{ color: '#9ca3af' }}>Logistics Status:</span>
              <div style={{ fontWeight: 700, color: order.delivery_status === 'DELIVERED' ? '#34d399' : '#fbbf24' }}>
                {order.delivery_status}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: '#9ca3af' }}>
            <strong>Destination Address:</strong> {order.delivery_address}
          </div>
        </div>
      ) : (
        <div style={{ padding: '1rem', background: 'rgba(17, 24, 39, 0.5)', borderRadius: '8px', color: '#9ca3af', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          No linked merchant order found in database.
        </div>
      )}

      {/* Collected Evidence Items List */}
      <div>
        <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#e5e7eb', marginBottom: '0.75rem' }}>
          Verified Supporting Documents ({evidence.length})
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
          {evidence.map((item) => (
            <div
              key={item.id}
              style={{
                background: 'rgba(17, 24, 39, 0.7)',
                border: '1px solid #374151',
                borderRadius: '8px',
                padding: '0.85rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>
                  {item.category}
                </span>
                {item.verified ? (
                  <span className="badge badge-green" style={{ fontSize: '0.6rem' }}>
                    <CheckCircle2 size={10} /> Verified
                  </span>
                ) : (
                  <span className="badge badge-amber" style={{ fontSize: '0.6rem' }}>
                    Unconfirmed
                  </span>
                )}
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#f3f4f6', marginBottom: '0.2rem' }}>
                {item.title}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.5rem', lineHeight: '1.3' }}>
                {item.description}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem', color: '#6b7280' }}>
                <span>Source: {item.source_system}</span>
                <button
                  type="button"
                  onClick={() => onViewDoc(item)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#38bdf8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.2rem',
                    fontWeight: 600,
                    fontSize: '0.75rem'
                  }}
                >
                  Inspect Doc <ExternalLink size={11} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
