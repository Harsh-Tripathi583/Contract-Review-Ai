import type { Contract } from "@/types/contract";

// Mock data lives only in this dedicated file. Swap for real API when backend
// exists — no component should import from here directly.
export const mockContract: Contract = {
  id: "c-1001",
  fileName: "Master_Services_Agreement.pdf",
  uploadedAt: new Date().toISOString(),
  status: "ready",
  metadata: {
    title: "SaaS Service Agreement",
    agreementType: "Master Services",
    effectiveDate: "2023-10-15",
    expirationDate: "2024-10-15",
    paymentTerms: "Net 30 from invoice date",
    terminationConditions:
      "Auto-renews for successive 12 month periods unless 90 days written notice.",
    contractValue: 1200000,
    currency: "USD",
    governingLaw: "Delaware",
    parties: [
      { id: "p1", name: "Acme Corp", role: "Provider", jurisdiction: "Delaware" },
      { id: "p2", name: "Globex Inc.", role: "Customer", jurisdiction: "California" },
    ],
  },
  clauses: [
    {
      id: "cl-1",
      title: "Term and Termination",
      section: "5",
      text: "This Agreement shall commence on the Effective Date and continue for an initial period of twelve (12) months.",
      page: 5,
      confidence: 0.98,
    },
    {
      id: "cl-2",
      title: "Automatic Renewal",
      section: "5.3",
      text: "This Agreement shall automatically renew for successive twelve (12) month periods unless either party provides written notice of non-renewal at least ninety (90) days prior to the expiration.",
      page: 5,
      confidence: 0.99,
    },
    {
      id: "cl-3",
      title: "Limitation of Liability",
      section: "12.2",
      text: "The total aggregate liability of Client shall not exceed the amounts paid under this Agreement. Provider liability remains uncapped for indirect damages.",
      page: 14,
      confidence: 0.94,
    },
  ],
  risks: [
    {
      id: "r-1",
      title: "Unlimited Liability Clause",
      description: "The vendor has not capped liability for indirect damages.",
      severity: "critical",
      category: "legal",
      reasoning:
        "Section 12.2 lacks standard 'Aggregate Liability' carve-outs. High financial exposure in case of breach.",
      recommendation: "Negotiate a cap at 2x annual contract value.",
      page: 14,
      confidence: 0.94,
      status: "open",
    },
    {
      id: "r-2",
      title: "Automatic Renewal",
      description: "Contract renews for 12 months unless 90-day notice is given.",
      severity: "medium",
      category: "operational",
      reasoning:
        "Detected in Section 5.3 'Term and Termination'. Standard risk for unintended continuation.",
      recommendation: "Set a calendar reminder or move to explicit renewal.",
      page: 5,
      confidence: 0.99,
      status: "open",
    },
    {
      id: "r-3",
      title: "Missing Governing Law",
      description: "The document does not explicitly state the jurisdiction governing this agreement.",
      severity: "low",
      category: "compliance",
      reasoning:
        "Absence detected in Section 15 General Provisions. May lead to jurisdictional disputes.",
      recommendation: "Insert standard governing law clause (e.g., Delaware or New York).",
      page: "Entire Doc",
      confidence: 0.88,
      status: "open",
    },
  ],
  obligations: [
    {
      id: "o-1",
      party: "Customer",
      description: "Pay invoices within 30 days of issuance.",
      status: "recurring",
      clauseRef: "3.1",
    },
    {
      id: "o-2",
      party: "Provider",
      description: "Maintain 99.9% uptime SLA.",
      status: "recurring",
      clauseRef: "4.2",
    },
    {
      id: "o-3",
      party: "Customer",
      description: "Provide written notice 90 days prior to non-renewal.",
      dueDate: "2024-07-15",
      status: "one-time",
      clauseRef: "5.3",
    },
  ],
  summary: {
    headline: "Medium overall risk. Legal review recommended before signature.",
    keyPoints: [
      "Uncapped indirect liability for Provider — critical exposure.",
      "Automatic 12-month renewal with 90-day notice — operational risk.",
      "Governing law omitted — jurisdictional ambiguity.",
    ],
    overallRiskScore: 65,
    aiConfidence: 92,
    recommendation: "Route to Legal for liability cap negotiation before executing.",
  },
  confidence: { overall: 0.92, extraction: 0.95, riskDetection: 0.89 },
  comments: [
    {
      id: "cm-1",
      author: "Alex Reyes",
      message: "Legal team needs to double-check the IP indemnity section before we sign off.",
      createdAt: new Date().toISOString(),
      target: { type: "general" },
    },
  ],
  audit: [
    {
      id: "a-1",
      timestamp: new Date(Date.now() - 2 * 3600_000).toISOString(),
      actor: "System",
      action: "Contract uploaded",
      icon: "cloud_upload",
    },
    {
      id: "a-2",
      timestamp: new Date(Date.now() - 1.9 * 3600_000).toISOString(),
      actor: "AI Engine",
      action: "AI analysis completed",
      icon: "smart_toy",
    },
    {
      id: "a-3",
      timestamp: new Date(Date.now() - 30 * 60_000).toISOString(),
      actor: "Alex Reyes",
      action: "Reviewer started",
      icon: "person",
    },
  ],
};
