import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import MetricCards from './components/MetricCards';
import DisputeTable from './components/DisputeTable';
import InvestigationFlow from './components/InvestigationFlow';
import EvidencePackage from './components/EvidencePackage';
import ResponseEditor from './components/ResponseEditor';
import ApprovalModal from './components/ApprovalModal';
import AuditTrail from './components/AuditTrail';
import DocumentViewerModal from './components/DocumentViewerModal';
import SimulateDisputeModal from './components/SimulateDisputeModal';
import DossierExportModal from './components/DossierExportModal';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import {
  fetchDisputes,
  fetchDisputeDetails,
  runInvestigation,
  regenerateDraftTone,
  updateDraft,
  submitApproval,
  fetchDashboardStats,
  simulateWebhookDispute,
  seedDatabase
} from './api';
import { ShieldCheck, Play, CheckCircle2, Clock } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('inbox'); // 'inbox' | 'analytics'
  const [disputes, setDisputes] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedDisputeId, setSelectedDisputeId] = useState(null);
  const [selectedDisputeData, setSelectedDisputeData] = useState(null);
  
  // Loading states
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isInvestigating, setIsInvestigating] = useState(false);
  const [isRegeneratingTone, setIsRegeneratingTone] = useState(false);
  const [isSubmittingApproval, setIsSubmittingApproval] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  // Modals
  const [isApprovalOpen, setIsApprovalOpen] = useState(false);
  const [isSimulateOpen, setIsSimulateOpen] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [viewingDoc, setViewingDoc] = useState(null);

  const [submissionReceipt, setSubmissionReceipt] = useState(null);
  const [activeStatementForApproval, setActiveStatementForApproval] = useState('');

  // Initial load
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsRefreshing(true);
    try {
      const [disputesList, statsData] = await Promise.all([
        fetchDisputes(),
        fetchDashboardStats()
      ]);
      setDisputes(disputesList);
      setStats(statsData);

      // Auto-select first dispute if none selected
      if (!selectedDisputeId && disputesList.length > 0) {
        handleSelectDispute(disputesList[0].dispute_id);
      } else if (selectedDisputeId) {
        handleSelectDispute(selectedDisputeId);
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSelectDispute = async (id) => {
    setSelectedDisputeId(id);
    setSubmissionReceipt(null);
    try {
      const details = await fetchDisputeDetails(id);
      setSelectedDisputeData(details);
    } catch (err) {
      console.error(`Failed to fetch details for ${id}:`, err);
    }
  };

  const handleInvestigate = async (id) => {
    setIsInvestigating(true);
    setSelectedDisputeId(id);
    try {
      await runInvestigation(id);
      const [details, statsData, disputesList] = await Promise.all([
        fetchDisputeDetails(id),
        fetchDashboardStats(),
        fetchDisputes()
      ]);
      setSelectedDisputeData(details);
      setStats(statsData);
      setDisputes(disputesList);
    } catch (err) {
      console.error("Investigation failed:", err);
      alert("Investigation execution failed: " + err.message);
    } finally {
      setIsInvestigating(false);
    }
  };

  const handleRegenerateTone = async (tone) => {
    if (!selectedDisputeId) return;
    setIsRegeneratingTone(true);
    try {
      await regenerateDraftTone(selectedDisputeId, tone);
      const details = await fetchDisputeDetails(selectedDisputeId);
      setSelectedDisputeData(details);
    } catch (err) {
      console.error("Failed to regenerate tone:", err);
    } finally {
      setIsRegeneratingTone(false);
    }
  };

  const handleSaveDraft = async (statement, headline) => {
    if (!selectedDisputeId) return;
    try {
      await updateDraft(selectedDisputeId, statement, headline);
      const details = await fetchDisputeDetails(selectedDisputeId);
      setSelectedDisputeData(details);
    } catch (err) {
      console.error("Failed to save draft:", err);
    }
  };

  const handleOpenApproval = (currentStatement) => {
    setActiveStatementForApproval(currentStatement);
    setSubmissionReceipt(null);
    setIsApprovalOpen(true);
  };

  const handleConfirmApproval = async (payload) => {
    setIsSubmittingApproval(true);
    try {
      const res = await submitApproval(selectedDisputeId, {
        reviewer_name: payload.reviewerName,
        decision: payload.decision,
        notes: payload.notes,
        final_statement: payload.finalStatement
      });
      if (res.submission_receipt) {
        setSubmissionReceipt(res.submission_receipt);
      } else {
        setIsApprovalOpen(false);
      }
      const [details, statsData, disputesList] = await Promise.all([
        fetchDisputeDetails(selectedDisputeId),
        fetchDashboardStats(),
        fetchDisputes()
      ]);
      setSelectedDisputeData(details);
      setStats(statsData);
      setDisputes(disputesList);
    } catch (err) {
      console.error("Approval submission failed:", err);
      alert("Submission error: " + err.message);
    } finally {
      setIsSubmittingApproval(false);
    }
  };

  const handleSimulateWebhook = async (payload) => {
    setIsSimulating(true);
    try {
      const res = await simulateWebhookDispute(payload);
      setIsSimulateOpen(false);
      await loadAllData();
      if (res.dispute_id) {
        handleSelectDispute(res.dispute_id);
      }
    } catch (err) {
      console.error("Failed to simulate webhook dispute:", err);
      alert("Simulation error: " + err.message);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleSeed = async () => {
    try {
      await seedDatabase();
      await loadAllData();
      alert("Default dispute scenarios reloaded successfully!");
    } catch (err) {
      console.error("Failed to seed:", err);
    }
  };

  const currentDispute = selectedDisputeData?.dispute;
  const currentCase = selectedDisputeData?.investigation_case;
  const currentOrder = selectedDisputeData?.order;
  const currentEvidence = selectedDisputeData?.evidence || [];
  const currentAuditLogs = selectedDisputeData?.audit_logs || [];

  return (
    <div className="app-container">
      <Navbar
        onRefresh={loadAllData}
        onSeed={handleSeed}
        isRefreshing={isRefreshing}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenSimulate={() => setIsSimulateOpen(true)}
      />

      <main className="main-content">
        {/* KPI Metric Cards */}
        <MetricCards stats={stats} />

        {/* Tab 1: Financial & Root-Cause Analytics View */}
        {activeTab === 'analytics' && (
          <AnalyticsDashboard stats={stats} />
        )}

        {/* Tab 2: Dispute Inbox & Case Workspace View */}
        {activeTab === 'inbox' && (
          <>
            {/* Disputes Table */}
            <DisputeTable
              disputes={disputes}
              selectedDisputeId={selectedDisputeId}
              onSelectDispute={handleSelectDispute}
              onInvestigate={handleInvestigate}
              isInvestigating={isInvestigating}
            />

            {/* Selected Dispute Investigation Case Workspace */}
            {currentDispute && (
              <div style={{ marginTop: '2.5rem' }}>
                {/* Case Header Banner */}
                <div className="glass-card" style={{
                  padding: '1.25rem 1.75rem',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  background: 'linear-gradient(135deg, rgba(31, 41, 55, 0.9), rgba(17, 24, 39, 0.9))'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
                      <span className="badge badge-blue">{currentDispute.lifecycle_stage}</span>
                      <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f9fafb' }}>
                        Case #{currentDispute.dispute_id}
                      </h2>
                      <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
                        (Ref: {currentDispute.seller_transaction_id})
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
                      Buyer: <strong style={{ color: '#e5e7eb' }}>{currentDispute.buyer_name}</strong> ({currentDispute.buyer_email}) |
                      Reason: <strong style={{ color: '#60a5fa' }}>{currentDispute.reason}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase' }}>Dispute Amount</div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#38bdf8' }}>
                        ₹{currentDispute.amount.toLocaleString('en-IN')}
                        <span style={{ fontSize: '0.85rem', color: '#9ca3af', marginLeft: '0.3rem' }}>{currentDispute.currency}</span>
                      </div>
                    </div>

                    {currentDispute.investigation_status === 'PENDING' ? (
                      <button
                        onClick={() => handleInvestigate(currentDispute.dispute_id)}
                        className="btn btn-primary"
                        disabled={isInvestigating}
                        style={{ padding: '0.65rem 1.25rem' }}
                      >
                        <Play size={16} />
                        <span>{isInvestigating ? 'Coordinating Agents...' : 'Run Investigation'}</span>
                      </button>
                    ) : (
                      <div className="badge badge-green" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                        <CheckCircle2 size={14} /> Investigation Ready
                      </div>
                    )}
                  </div>
                </div>

                {/* 1. Multi-Agent Workflow Stepper */}
                <InvestigationFlow
                  caseData={currentCase}
                  trace={currentCase?.resolution_draft ? [
                    { duration_ms: 12.4 },
                    { duration_ms: 8.1 },
                    { duration_ms: 14.6 },
                    { duration_ms: 18.2 }
                  ] : []}
                  isInvestigating={isInvestigating}
                />

                {/* 2. Evidence Intelligence & Gap Detection */}
                <EvidencePackage
                  order={currentOrder}
                  evidence={currentEvidence}
                  auditorData={currentCase?.auditor_output}
                  onViewDoc={(doc) => setViewingDoc(doc)}
                />

                {/* 3. Evidence-Grounded Response Editor with Tone Switcher */}
                <ResponseEditor
                  resolutionData={currentCase?.resolution_draft}
                  onSaveDraft={handleSaveDraft}
                  onOpenApproval={handleOpenApproval}
                  caseStatus={currentCase?.human_review_status}
                  onRegenerateTone={handleRegenerateTone}
                  isRegeneratingTone={isRegeneratingTone}
                  onOpenDossier={() => setIsDossierOpen(true)}
                />

                {/* 4. Audit Trail */}
                <AuditTrail logs={currentAuditLogs} />
              </div>
            )}
          </>
        )}
      </main>

      {/* Human-in-the-Loop Approval Gate Modal */}
      <ApprovalModal
        isOpen={isApprovalOpen}
        onClose={() => setIsApprovalOpen(false)}
        dispute={currentDispute}
        statement={activeStatementForApproval}
        onConfirm={handleConfirmApproval}
        isSubmitting={isSubmittingApproval}
        submissionReceipt={submissionReceipt}
      />

      {/* Document & Signed Proof of Delivery (POD) Inspector Modal */}
      <DocumentViewerModal
        isOpen={Boolean(viewingDoc)}
        onClose={() => setViewingDoc(null)}
        doc={viewingDoc}
        order={currentOrder}
        dispute={currentDispute}
      />

      {/* Live PayPal Webhook Dispute Ingestion Simulator Modal */}
      <SimulateDisputeModal
        isOpen={isSimulateOpen}
        onClose={() => setIsSimulateOpen(false)}
        onSimulate={handleSimulateWebhook}
        isSimulating={isSimulating}
      />

      {/* Formal Printable Evidence Dossier Modal */}
      <DossierExportModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        disputeId={selectedDisputeId}
      />
    </div>
  );
}
