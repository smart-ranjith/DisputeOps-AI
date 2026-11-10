# DisputeOps AI
### Agentic AI for Intelligent Payment Dispute Investigation and Financial Loss Prevention

DisputeOps AI is an intelligent payment dispute investigation and evidence management platform designed to help merchants and payment operations teams defend disputes faster, detect critical evidence gaps, prevent financial losses, and interface directly with PayPal's Disputes REST API.

---

## 🌟 Key Architecture & Capabilities

1. **Multi-Agent AI Intelligence Layer**:
   - **Dispute Analyst Agent**: Classifies dispute reason (Item Not Received, SNAD, Unauthorized), lifecycle stage, and defines required evidence mandates.
   - **Evidence Collector Agent**: Retrieves merchant records across OMS/ERP, carrier waybills, signed proof-of-delivery (POD) sheets, and invoices.
   - **Evidence Auditor Agent**: Uses a deterministic rule engine alongside semantic validation to detect missing evidence, date/amount inconsistencies, and flag critical information gaps before drafting.
   - **Resolution Agent**: Synthesizes an evidence-backed formal statement grounded in verified citations with recommended merchant strategy.
   - **Multi-Agent Orchestrator**: Coordinates synchronous agent handoffs with full execution timing and audit tracking.

2. **Deterministic Rules Engine**:
   - Validates transaction ID linking, amount parity, and buyer identity.
   - Flags approaching deadlines (e.g. < 48 hours to seller response due date).
   - Enforces dispute-category evidence checklists to prevent unsubstantiated AI claims or hallucinations.

3. **Human-in-the-Loop Review Gate**:
   - Operators can review collected evidence, inspect gap warnings, and edit the drafted formal statement.
   - Mandatory human approval gate before submitting to PayPal's API.

4. **PayPal Disputes REST API Integration**:
   - Connects to PayPal's Disputes API using OAuth 2.0.
   - Dual-mode support: Live/Sandbox PayPal API credentials, with a built-in sandbox mock engine for immediate testing without external credentials.

5. **Operational Analytics & Audit Trail**:
   - Real-time tracking of active dispute exposure, capital protected, win rates, and an immutable compliance audit trail.

6. **New Capabilities Added**:
   - **Interactive Document & e-POD Inspector**: Click any evidence document to inspect electronic Proof of Delivery with carrier barcodes, GPS coordinates, and recipient signature stamps.
   - **Live PayPal Webhook Ingestion Simulator**: Trigger simulated `DISPUTES.DISPUTE.CREATED` events with custom order details and watch the 4 agents ingest and audit in < 35ms.
   - **Financial Loss & Root-Cause Analytics Tab**: Real-time breakdown of logistics delays vs. SNAD vs. fraud, plus ₹1,500/case penalty fee savings calculator and carrier scorecard.
   - **Printable Official Evidence Dossier**: Formatted binder ready for PDF export, internal compliance reviews, or merchant arbitration.
   - **AI Re-Analysis & Tone Customizer**: 1-click toggles for *Standard PayPal Compliance*, *Firm Legal Rebuttal*, and *Customer-Centric / Conciliatory*.

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Start Backend (FastAPI)
```powershell
# Navigate to repository root
& "C:\Users\ranji\AppData\Local\Python\pythoncore-3.14-64\python.exe" -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000
```
- API Docs & Swagger UI: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- API Root: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)

### 2. Start Frontend (React + Vite)
```powershell
cd frontend
npm run dev -- --host 127.0.0.1 --port 5173
```
- Dashboard UI: [http://127.0.0.1:5173](http://127.0.0.1:5173)

---

## 🧪 Demonstration Scenarios (Pre-Loaded)

1. **₹5,000 Product Delivery Dispute (`PP-D-839210-INR`)**:
   - **Scenario**: Buyer claims item never delivered.
   - **Result**: Collector finds matching order `ORD-5000-INR` with BlueDart tracking and signed POD. Auditor validates 100/100 confidence score. Resolution agent drafts grounded contestation statement.
2. **Missing Proof-of-Delivery / Gap Detection (`PP-D-774129-INR`)**:
   - **Scenario**: Buyer claims ₹3,450 item not delivered. Courier status is `IN_TRANSIT` and POD is missing.
   - **Result**: Evidence Auditor detects missing delivery confirmation, prevents false claims, flags an explicit gap alert, and recommends requesting carrier manifest or settling to prevent fee penalties.
3. **Significantly Not As Described (`PP-D-610238-INR`)**:
   - **Scenario**: ₹8,990 chargeback claim regarding 4K Action Camera bundle.
   - **Result**: Validates pre-shipment QA certificate and listing specifications.
4. **Unauthorized Transaction (`PP-D-512094-INR`)**:
   - **Scenario**: ₹12,500 unauthorized claim.
   - **Result**: Correlates 3D-Secure authentication and checkout IP logs.

---

## 📁 Repository Structure

```
DisputeOps/
├── backend/
│   ├── app/
│   │   ├── agents/
│   │   │   ├── analyst.py       # Dispute Analyst Agent
│   │   │   ├── collector.py     # Evidence Collector Agent
│   │   │   ├── auditor.py       # Evidence Auditor Agent (Gap Detector)
│   │   │   ├── resolution.py    # Resolution Agent (Grounded Drafting)
│   │   │   └── orchestrator.py  # Multi-Agent Workflow Coordinator
│   │   ├── api/
│   │   │   └── routes.py        # REST API Endpoints
│   │   ├── services/
│   │   │   ├── paypal_service.py# PayPal Disputes API & OAuth 2.0
│   │   │   ├── merchant_data_service.py # OMS & Courier records
│   │   │   └── rule_engine.py   # Deterministic Validation Rules
│   │   ├── config.py
│   │   ├── database.py          # SQLite schema & audit logging
│   │   ├── seed_data.py         # Test scenarios & database initialization
│   │   └── main.py              # FastAPI application
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── MetricCards.jsx
│   │   │   ├── DisputeTable.jsx
│   │   │   ├── InvestigationFlow.jsx
│   │   │   ├── EvidencePackage.jsx
│   │   │   ├── ResponseEditor.jsx
│   │   │   ├── ApprovalModal.jsx
│   │   │   └── AuditTrail.jsx
│   │   ├── api.js
│   │   ├── App.jsx
│   │   └── index.css
│   └── package.json
└── README.md
```
