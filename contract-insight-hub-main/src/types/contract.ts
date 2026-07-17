// Shared domain types. Kept in sync with the future FastAPI response shapes.

export type RiskSeverity = "critical" | "high" | "medium" | "low";
export type RiskCategory = "legal" | "commercial" | "operational" | "compliance";

export interface Party {
  id: string;
  name: string;
  role: string;
  jurisdiction?: string;
}

export interface Clause {
  id: string;
  title: string;
  section: string;
  text: string;
  page?: number;
  category?: string;
  confidence?: number;
}

export interface Risk {
  id: string;
  title: string;
  description: string;
  severity: RiskSeverity;
  category: RiskCategory;
  reasoning: string;
  recommendation: string;
  page?: number | string;
  confidence: number;
  status?: "open" | "accepted" | "rejected";
  reviewerNote?: string;
}

export interface Obligation {
  id: string;
  party: string;
  description: string;
  dueDate?: string;
  status?: "pending" | "recurring" | "one-time";
  clauseRef?: string;
}

export interface ContractMetadata {
  title: string;
  agreementType: string;
  effectiveDate: string;
  expirationDate?: string;
  paymentTerms: string;
  terminationConditions: string;
  contractValue: number;
  currency: string;
  governingLaw: string;
  parties: Party[];
}

export interface Confidence {
  overall: number;
  extraction: number;
  riskDetection: number;
}

export interface ExecutiveSummary {
  headline: string;
  keyPoints: string[];
  overallRiskScore: number;
  aiConfidence: number;
  recommendation: string;
}

export interface ReviewerComment {
  id: string;
  author: string;
  message: string;
  createdAt: string;
  target?: { type: "risk" | "clause" | "obligation" | "general"; id?: string };
}

export type ReviewDecision =
  | "ready"
  | "minor"
  | "legal"
  | "procurement"
  | "high-risk"
  | "missing-info";

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  detail?: string;
  icon?: string;
}

export interface Contract {
  id: string;
  fileName: string;
  uploadedAt: string;
  status: "processing" | "ready" | "reviewed";
  metadata: ContractMetadata;
  clauses: Clause[];
  risks: Risk[];
  obligations: Obligation[];
  summary: ExecutiveSummary;
  confidence: Confidence;
  comments: ReviewerComment[];
  audit: AuditEvent[];
}
