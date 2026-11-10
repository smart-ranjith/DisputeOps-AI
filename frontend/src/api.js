const API_BASE = "http://localhost:8000/api";

export async function fetchDisputes(status) {
  const url = status ? `${API_BASE}/disputes?status=${encodeURIComponent(status)}` : `${API_BASE}/disputes`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch disputes");
  return res.json();
}

export async function fetchDisputeDetails(disputeId) {
  const res = await fetch(`${API_BASE}/disputes/${disputeId}`);
  if (!res.ok) throw new Error("Failed to fetch dispute details");
  return res.json();
}

export async function runInvestigation(disputeId, tone = "PAYPAL_STANDARD") {
  const res = await fetch(`${API_BASE}/disputes/${disputeId}/investigate`, {
    method: "POST"
  });
  if (!res.ok) throw new Error("Investigation failed");
  return res.json();
}

export async function regenerateDraftTone(disputeId, tone) {
  const res = await fetch(`${API_BASE}/disputes/${disputeId}/regenerate-draft`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tone })
  });
  if (!res.ok) throw new Error("Failed to regenerate response draft");
  return res.json();
}

export async function updateDraft(disputeId, statement, headline) {
  const res = await fetch(`${API_BASE}/disputes/${disputeId}/draft`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ statement, headline })
  });
  if (!res.ok) throw new Error("Failed to update response draft");
  return res.json();
}

export async function submitApproval(disputeId, payload) {
  const res = await fetch(`${API_BASE}/disputes/${disputeId}/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Approval submission failed");
  return res.json();
}

export async function fetchDashboardStats() {
  const res = await fetch(`${API_BASE}/stats`);
  if (!res.ok) throw new Error("Failed to fetch dashboard stats");
  return res.json();
}

export async function fetchAnalytics() {
  const res = await fetch(`${API_BASE}/analytics`);
  if (!res.ok) throw new Error("Failed to fetch analytics");
  return res.json();
}

export async function simulateWebhookDispute(payload) {
  const res = await fetch(`${API_BASE}/webhooks/paypal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Failed to simulate webhook dispute");
  return res.json();
}

export async function seedDatabase() {
  const res = await fetch(`${API_BASE}/disputes/seed`, {
    method: "POST"
  });
  if (!res.ok) throw new Error("Failed to seed database");
  return res.json();
}
