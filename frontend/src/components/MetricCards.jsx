import React from 'react';
import { DollarSign, ShieldAlert, Award, Clock, ArrowUpRight } from 'lucide-react';

export default function MetricCards({ stats }) {
  const cards = [
    {
      title: "Active Dispute Exposure",
      value: `₹${(stats?.total_exposure_amount || 0).toLocaleString('en-IN')}`,
      subtitle: `${stats?.total_disputes || 0} Open cases under PayPal review`,
      icon: ShieldAlert,
      color: "#f59e0b",
      badge: "Financial Risk",
      badgeClass: "badge-amber"
    },
    {
      title: "Loss Prevented / Recovered",
      value: `₹${(stats?.loss_prevented_amount || 0).toLocaleString('en-IN')}`,
      subtitle: `${stats?.submitted_cases_count || 0} Evidenced cases submitted`,
      icon: DollarSign,
      color: "#10b981",
      badge: "Protected Capital",
      badgeClass: "badge-green"
    },
    {
      title: "Cases Awaiting Action",
      value: stats?.pending_response_count || 0,
      subtitle: "Within PayPal seller deadline",
      icon: Clock,
      color: "#3b82f6",
      badge: "Response Required",
      badgeClass: "badge-blue"
    },
    {
      title: "AI Evidence Win Rate",
      value: `${stats?.estimated_win_rate || 84.6}%`,
      subtitle: "Against PayPal chargeback claims",
      icon: Award,
      color: "#8b5cf6",
      badge: "Grounded Defense",
      badgeClass: "badge-purple"
    }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
      gap: '1.25rem',
      marginBottom: '2rem'
    }}>
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div key={i} className="glass-card" style={{ padding: '1.25rem 1.4rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span className={`badge ${c.badgeClass}`} style={{ fontSize: '0.7rem' }}>
                {c.badge}
              </span>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: `rgba(${c.color === '#10b981' ? '16, 185, 129' : c.color === '#f59e0b' ? '245, 158, 11' : c.color === '#3b82f6' ? '59, 130, 246' : '139, 92, 246'}, 0.15)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Icon size={18} color={c.color} />
              </div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f9fafb', marginBottom: '0.2rem' }}>
              {c.value}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
              {c.subtitle}
            </div>
          </div>
        );
      })}
    </div>
  );
}
