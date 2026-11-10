import React from 'react';
import { History, UserCheck, ShieldCheck, CheckCircle2, FileEdit } from 'lucide-react';

export default function AuditTrail({ logs }) {
  if (!logs || logs.length === 0) return null;

  const getActionIcon = (action) => {
    if (action.includes('SUBMITTED') || action.includes('APPROVAL')) {
      return <UserCheck size={14} color="#10b981" />;
    }
    if (action.includes('INVESTIGATION')) {
      return <ShieldCheck size={14} color="#3b82f6" />;
    }
    if (action.includes('EDITED')) {
      return <FileEdit size={14} color="#fbbf24" />;
    }
    return <History size={14} color="#9ca3af" />;
  };

  return (
    <div className="glass-card" style={{ padding: '1.25rem 1.5rem', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <History size={16} color="#9ca3af" />
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e5e7eb' }}>
          Compliance & Operational Audit Trail
        </h4>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {logs.map((log) => (
          <div
            key={log.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              background: 'rgba(17, 24, 39, 0.6)',
              padding: '0.65rem 0.9rem',
              borderRadius: '6px',
              border: '1px solid #374151',
              fontSize: '0.78rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              {getActionIcon(log.action)}
              <div>
                <strong style={{ color: '#f3f4f6' }}>{log.action}</strong>
                <span style={{ color: '#9ca3af', marginLeft: '0.4rem' }}>by {log.actor}</span>
              </div>
            </div>
            <div style={{ color: '#6b7280', fontSize: '0.72rem' }}>
              {new Date(log.timestamp).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
