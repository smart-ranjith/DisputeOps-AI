import React from 'react';
import { X, CheckCircle2, ShieldCheck, Printer, MapPin, Calendar, Clock, FileText, User } from 'lucide-react';

export default function DocumentViewerModal({ isOpen, onClose, doc, order, dispute }) {
  if (!isOpen) return null;

  const isPod = doc?.category === 'PROOF_OF_DELIVERY' || doc?.title?.toLowerCase().includes('proof of delivery') || doc?.title?.toLowerCase().includes('pod');
  const isInvoice = doc?.category === 'INVOICE' || doc?.title?.toLowerCase().includes('invoice');

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
        maxWidth: '750px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        background: '#0f172a',
        border: '1px solid #475569',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        padding: '2rem'
      }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span className="badge badge-blue">{doc?.category || 'DOCUMENT'}</span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc' }}>
                {doc?.title || 'Document Inspector'}
              </h3>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.2rem' }}>
              Authoritative record sourced from: <strong>{doc?.source_system || 'Merchant Records'}</strong>
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => window.print()}
              className="btn btn-secondary"
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}
            >
              <Printer size={14} /> Print
            </button>
            <button
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* PROOF OF DELIVERY (POD) DOCUMENT RENDERER */}
        {isPod ? (
          <div style={{
            background: '#ffffff',
            color: '#0f172a',
            borderRadius: '10px',
            padding: '2rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            {/* Courier Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#1e3a8a', letterSpacing: '-0.02em' }}>
                  {order?.carrier || 'LOGISTICS EXPRESS'}
                </h2>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                  ELECTRONIC PROOF OF DELIVERY (e-POD)
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>WAYBILL / CONSIGNMENT NO.</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'monospace', color: '#0f172a' }}>
                  {order?.tracking_number || 'TRK-99882211'}
                </div>
                {/* Barcode representation */}
                <div style={{
                  height: '24px',
                  background: 'repeating-linear-gradient(90deg, #000, #000 2px, #fff 2px, #fff 5px, #000 5px, #000 8px, #fff 8px, #fff 10px)',
                  width: '160px',
                  margin: '0.3rem 0 0 auto'
                }}></div>
              </div>
            </div>

            {/* Delivery Metadata Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.5rem',
              fontSize: '0.85rem'
            }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>DELIVERY STATUS:</span>
                <div style={{ fontWeight: 800, color: '#15803d', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <CheckCircle2 size={16} /> DELIVERED SUCCESSFULLY
                </div>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>DELIVERY DATE & TIME:</span>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>
                  {order?.delivered_date ? new Date(order.delivered_date).toLocaleString() : '2026-11-04, 14:12:00 IST'}
                </div>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>CONSIGNEE NAME:</span>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>
                  {order?.customer_name || dispute?.buyer_name || 'Aarav Sharma'}
                </div>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>GEO-COORDINATES:</span>
                <div style={{ fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>
                  12.9716° N, 77.5946° E (±4m GPS accuracy)
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div style={{ marginBottom: '1.5rem', fontSize: '0.85rem' }}>
              <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>DESTINATION ADDRESS:</span>
              <div style={{ fontWeight: 600, color: '#1e293b', marginTop: '0.2rem' }}>
                {order?.delivery_address || 'Flat 402, Lotus Residency, 12th Main, Indiranagar, Bengaluru, KA 560038'}
              </div>
            </div>

            {/* Signature Area */}
            <div style={{
              border: '2px dashed #cbd5e1',
              borderRadius: '8px',
              padding: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#fafafa'
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>RECIPIENT DIGITAL SIGNATURE</div>
                <div style={{
                  fontFamily: 'Brush Script MT, cursive, sans-serif',
                  fontSize: '2rem',
                  color: '#1e3a8a',
                  marginTop: '0.25rem',
                  transform: 'rotate(-3deg)'
                }}>
                  {order?.customer_name || 'Aarav Sharma'}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                  Device: Handheld Courier Terminal (Zebra TC57)
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: '#dcfce7',
                  color: '#166534',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.75rem'
                }}>
                  <ShieldCheck size={16} /> VERIFIED BY DISPATCHER
                </div>
              </div>
            </div>
          </div>
        ) : isInvoice ? (
          /* TAX INVOICE RENDERER */
          <div style={{
            background: '#ffffff',
            color: '#0f172a',
            borderRadius: '10px',
            padding: '2rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a' }}>MERCHANT TAX INVOICE</h2>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Original for Recipient</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>Invoice #: {order?.invoice_number || 'INV-2026-8819'}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Date: {order?.order_date ? new Date(order.order_date).toLocaleDateString() : '01/11/2026'}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>GSTIN: 29AABCU9603R1ZM</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
              <div>
                <div style={{ fontWeight: 700, color: '#64748b', fontSize: '0.75rem' }}>BILLED TO:</div>
                <div style={{ fontWeight: 700 }}>{order?.customer_name || dispute?.buyer_name}</div>
                <div>{order?.customer_email || dispute?.buyer_email}</div>
                <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{order?.delivery_address}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, color: '#64748b', fontSize: '0.75rem' }}>PAYMENT INFO:</div>
                <div>Gateway: <strong>PayPal Express Checkout</strong></div>
                <div style={{ fontFamily: 'monospace' }}>Txn ID: {order?.transaction_id}</div>
                <div style={{ color: '#16a34a', fontWeight: 700 }}>STATUS: PAID IN FULL</div>
              </div>
            </div>

            {/* Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1', textAlign: 'left' }}>
                  <th style={{ padding: '0.6rem' }}>Item Description</th>
                  <th style={{ padding: '0.6rem' }}>HSN</th>
                  <th style={{ padding: '0.6rem', textAlign: 'center' }}>Qty</th>
                  <th style={{ padding: '0.6rem', textAlign: 'right' }}>Total (INR)</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '0.75rem 0.6rem', fontWeight: 600 }}>{order?.item_title || 'Purchased Merchandise'}</td>
                  <td style={{ padding: '0.75rem 0.6rem', color: '#64748b' }}>85183000</td>
                  <td style={{ padding: '0.75rem 0.6rem', textAlign: 'center' }}>1</td>
                  <td style={{ padding: '0.75rem 0.6rem', textAlign: 'right', fontWeight: 700 }}>₹{order?.amount?.toLocaleString('en-IN') || '5,000.00'}</td>
                </tr>
              </tbody>
            </table>

            <div style={{ textAlign: 'right', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
              Total Invoice Amount: ₹{order?.amount?.toLocaleString('en-IN') || '5,000.00'}
            </div>
          </div>
        ) : (
          /* GENERIC DOCUMENT INSPECTOR */
          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid #334155',
            borderRadius: '8px',
            padding: '1.5rem',
            color: '#e2e8f0',
            fontSize: '0.875rem'
          }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#38bdf8', marginBottom: '0.5rem' }}>
              {doc?.title}
            </h4>
            <p style={{ color: '#cbd5e1', marginBottom: '1rem', lineHeight: '1.6' }}>
              {doc?.description}
            </p>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              <div><strong>Category:</strong> {doc?.category}</div>
              <div><strong>Source System:</strong> {doc?.source_system}</div>
              <div><strong>Verification Status:</strong> {doc?.verified ? 'Verified Active' : 'Pending Confirmation'}</div>
              <div><strong>Document Reference URL:</strong> {doc?.document_url}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
