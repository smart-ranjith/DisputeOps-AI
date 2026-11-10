import React, { useState } from 'react';
import { X, Zap, Radio, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function SimulateDisputeModal({ isOpen, onClose, onSimulate, isSimulating }) {
  const [reason, setReason] = useState('MERCHANDISE_OR_SERVICE_NOT_RECEIVED');
  const [amount, setAmount] = useState(7200);
  const [buyerName, setBuyerName] = useState('Kavita Rao');
  const [buyerEmail, setBuyerEmail] = useState('kavita.rao@example.com');
  const [itemTitle, setItemTitle] = useState('Smart Home 2K Security Camera with Solar Panel');
  const [carrier, setCarrier] = useState('BlueDart Express');
  const [deliveryStatus, setDeliveryStatus] = useState('DELIVERED');
  const [hasPod, setHasPod] = useState(true);
  const [autoInvestigate, setAutoInvestigate] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSimulate({
      reason,
      amount: parseFloat(amount),
      currency: 'INR',
      buyer_name: buyerName,
      buyer_email: buyerEmail,
      item_title: itemTitle,
      carrier,
      delivery_status: deliveryStatus,
      has_pod: hasPod,
      auto_investigate: autoInvestigate
    });
  };

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
      zIndex: 105,
      padding: '1.5rem'
    }}>
      <div className="glass-card" style={{
        maxWidth: '640px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        background: '#111827',
        border: '1px solid #4b5563',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.6)',
        padding: '1.75rem'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid #374151', paddingBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Zap size={20} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f9fafb' }}>
                Simulate PayPal Webhook Dispute
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                Event: <code>DISPUTES.DISPUTE.CREATED</code> via PayPal REST API
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

        <form onSubmit={handleSubmit}>
          {/* Dispute Reason */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#9ca3af', marginBottom: '0.35rem', fontWeight: 600 }}>
              Dispute Category / Reason:
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(17, 24, 39, 0.85)',
                border: '1px solid #374151',
                borderRadius: '6px',
                color: '#f3f4f6',
                padding: '0.55rem 0.75rem',
                fontSize: '0.85rem'
              }}
            >
              <option value="MERCHANDISE_OR_SERVICE_NOT_RECEIVED">Item Not Received (INR) - Delivery Claim</option>
              <option value="MERCHANDISE_OR_SERVICE_NOT_AS_DESCRIBED">Significantly Not As Described (SNAD)</option>
              <option value="UNAUTHORISED">Unauthorized Transaction / Cardholder Fraud</option>
            </select>
          </div>

          {/* Amount & Buyer */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#9ca3af', marginBottom: '0.35rem', fontWeight: 600 }}>
                Disputed Amount (INR ₹):
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
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
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#9ca3af', marginBottom: '0.35rem', fontWeight: 600 }}>
                Buyer Full Name:
              </label>
              <input
                type="text"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                required
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
          </div>

          {/* Item Title */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#9ca3af', marginBottom: '0.35rem', fontWeight: 600 }}>
              Purchased Product / Item Title:
            </label>
            <input
              type="text"
              value={itemTitle}
              onChange={(e) => setItemTitle(e.target.value)}
              required
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

          {/* Carrier & Delivery Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#9ca3af', marginBottom: '0.35rem', fontWeight: 600 }}>
                Logistics Carrier:
              </label>
              <select
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(17, 24, 39, 0.85)',
                  border: '1px solid #374151',
                  borderRadius: '6px',
                  color: '#f3f4f6',
                  padding: '0.55rem 0.75rem',
                  fontSize: '0.85rem'
                }}
              >
                <option value="BlueDart Express">BlueDart Express</option>
                <option value="Delhivery Logistics">Delhivery Logistics</option>
                <option value="Express Courier">Express Courier</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#9ca3af', marginBottom: '0.35rem', fontWeight: 600 }}>
                Courier Delivery Status:
              </label>
              <select
                value={deliveryStatus}
                onChange={(e) => {
                  setDeliveryStatus(e.target.value);
                  if (e.target.value !== 'DELIVERED') setHasPod(false);
                }}
                style={{
                  width: '100%',
                  background: 'rgba(17, 24, 39, 0.85)',
                  border: '1px solid #374151',
                  borderRadius: '6px',
                  color: '#f3f4f6',
                  padding: '0.55rem 0.75rem',
                  fontSize: '0.85rem'
                }}
              >
                <option value="DELIVERED">DELIVERED (Fulfillment Complete)</option>
                <option value="IN_TRANSIT">IN_TRANSIT (Simulate Gap Detection!)</option>
                <option value="EXCEPTION">FAILED / DELIVERY EXCEPTION</option>
              </select>
            </div>
          </div>

          {/* POD Checkbox */}
          <div style={{
            background: 'rgba(31, 41, 55, 0.5)',
            border: '1px solid #374151',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#f3f4f6' }}>
                Digital Signed Proof of Delivery (POD)
              </div>
              <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
                Unchecking will trigger the Evidence Auditor's Gap Detection Alert
              </div>
            </div>
            <input
              type="checkbox"
              checked={hasPod}
              onChange={(e) => setHasPod(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSimulating}
              style={{ padding: '0.6rem 1.4rem' }}
            >
              {isSimulating ? 'Simulating Webhook & Investigating...' : 'Trigger Webhook & Run Agents'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
