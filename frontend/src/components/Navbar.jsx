import React from 'react';
import { ShieldCheck, RefreshCw, Zap, PlusCircle, BarChart3, Inbox } from 'lucide-react';

export default function Navbar({
  onRefresh,
  onSeed,
  isRefreshing,
  activeTab,
  onSelectTab,
  onOpenSimulate
}) {
  return (
    <header style={{
      background: 'rgba(17, 24, 39, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid #374151',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '0.8rem 2rem'
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Brand / Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.35)'
          }}>
            <ShieldCheck size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#f9fafb' }}>
                DisputeOps <span style={{ color: '#38bdf8' }}>AI</span>
              </h1>
              <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>
                Multi-Agent System
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
              Intelligent Payment Dispute Investigation & Loss Prevention
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          background: 'rgba(31, 41, 55, 0.5)',
          padding: '0.25rem',
          borderRadius: '8px',
          border: '1px solid #374151'
        }}>
          <button
            onClick={() => onSelectTab('inbox')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.9rem',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'inbox' ? '#2563eb' : 'transparent',
              color: activeTab === 'inbox' ? '#fff' : '#9ca3af',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            <Inbox size={15} /> Disputes Inbox
          </button>
          <button
            onClick={() => onSelectTab('analytics')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.9rem',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'analytics' ? '#2563eb' : 'transparent',
              color: activeTab === 'analytics' ? '#fff' : '#9ca3af',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            <BarChart3 size={15} /> Analytics & Root Causes
          </button>
        </div>

        {/* Integration Status & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={onOpenSimulate}
            className="btn btn-primary"
            style={{ padding: '0.45rem 0.9rem', background: 'linear-gradient(135deg, #059669, #047857)' }}
            title="Simulate Receiving a Live PayPal Dispute"
          >
            <PlusCircle size={15} />
            <span style={{ fontSize: '0.8rem' }}>Simulate Webhook Dispute</span>
          </button>

          <button
            onClick={onRefresh}
            className="btn btn-secondary"
            title="Sync Data"
            disabled={isRefreshing}
            style={{ padding: '0.45rem 0.85rem' }}
          >
            <RefreshCw size={15} className={isRefreshing ? "spin-icon" : ""} />
            <span style={{ fontSize: '0.8rem' }}>Sync</span>
          </button>

          <button
            onClick={onSeed}
            className="btn btn-secondary"
            style={{ padding: '0.45rem 0.85rem' }}
            title="Reload Default Demo Cases"
          >
            <Zap size={14} color="#fbbf24" />
            <span style={{ fontSize: '0.8rem' }}>Reset Demo</span>
          </button>
        </div>
      </div>
    </header>
  );
}
