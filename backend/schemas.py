from pydantic import BaseModel, Field
from typing import List, Optional, Union, Dict
from datetime import datetime

class PartyBase(BaseModel):
    id: str
    name: str
    role: str
    jurisdiction: Optional[str] = None

    class Config:
        from_attributes = True

class PartyCreate(PartyBase):
    pass

class ClauseBase(BaseModel):
    id: str
    title: str
    section: str
    text: str
    page: Optional[int] = None
    category: Optional[str] = None
    confidence: Optional[float] = None

    class Config:
        from_attributes = True

class RiskBase(BaseModel):
    id: str
    title: str
    description: str
    severity: str # "critical" | "high" | "medium" | "low"
    category: str # "legal" | "commercial" | "operational" | "compliance"
    reasoning: str
    recommendation: str
    page: Optional[Union[int, str]] = None
    confidence: float
    status: Optional[str] = "open" # "open" | "accepted" | "rejected"
    reviewerNote: Optional[str] = Field(None, alias="reviewer_note")

    class Config:
        from_attributes = True
        populate_by_name = True

class RiskUpdate(BaseModel):
    id: str
    title: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[str] = None
    category: Optional[str] = None
    reasoning: Optional[str] = None
    recommendation: Optional[str] = None
    page: Optional[Union[int, str]] = None
    confidence: Optional[float] = None
    status: Optional[str] = None
    reviewerNote: Optional[str] = Field(None, alias="reviewer_note")

    class Config:
        from_attributes = True
        populate_by_name = True

class ObligationBase(BaseModel):
    id: str
    party: str
    description: str
    dueDate: Optional[str] = Field(None, alias="due_date")
    status: Optional[str] = None # "pending" | "recurring" | "one-time"
    clauseRef: Optional[str] = Field(None, alias="clause_ref")

    class Config:
        from_attributes = True
        populate_by_name = True

class ContractMetadataBase(BaseModel):
    title: str
    agreementType: str = Field(..., alias="agreement_type")
    effectiveDate: str = Field(..., alias="effective_date")
    expirationDate: Optional[str] = Field(None, alias="expiration_date")
    paymentTerms: str = Field(..., alias="payment_terms")
    terminationConditions: str = Field(..., alias="termination_conditions")
    contractValue: float = Field(..., alias="contract_value")
    currency: str
    governingLaw: str = Field(..., alias="governing_law")
    parties: List[PartyBase]

    class Config:
        from_attributes = True
        populate_by_name = True

class ContractMetadataUpdate(BaseModel):
    title: Optional[str] = None
    agreementType: Optional[str] = Field(None, alias="agreement_type")
    effectiveDate: Optional[str] = Field(None, alias="effective_date")
    expirationDate: Optional[str] = Field(None, alias="expiration_date")
    paymentTerms: Optional[str] = Field(None, alias="payment_terms")
    terminationConditions: Optional[str] = Field(None, alias="termination_conditions")
    contractValue: Optional[float] = Field(None, alias="contract_value")
    currency: Optional[str] = None
    governingLaw: Optional[str] = Field(None, alias="governing_law")
    parties: Optional[List[PartyBase]] = None

    class Config:
        from_attributes = True
        populate_by_name = True

class ExecutiveSummaryBase(BaseModel):
    headline: str
    keyPoints: List[str] = Field(..., alias="key_points")
    overallRiskScore: int = Field(..., alias="overall_risk_score")
    aiConfidence: int = Field(..., alias="ai_confidence")
    recommendation: str

    class Config:
        from_attributes = True
        populate_by_name = True

class ConfidenceBase(BaseModel):
    overall: float
    extraction: float
    riskDetection: float = Field(..., alias="risk_detection")

    class Config:
        from_attributes = True
        populate_by_name = True

class CommentTarget(BaseModel):
    type: str # "risk" | "clause" | "obligation" | "general"
    id: Optional[str] = None

class ReviewerCommentBase(BaseModel):
    id: str
    author: str
    message: str
    createdAt: str = Field(..., alias="created_at")
    target: Optional[CommentTarget] = None

    class Config:
        from_attributes = True
        populate_by_name = True

class CommentCreate(BaseModel):
    author: str
    message: str
    target: Optional[CommentTarget] = None

class AuditEventBase(BaseModel):
    id: str
    timestamp: str
    actor: str
    action: str
    detail: Optional[str] = None
    icon: Optional[str] = None

    class Config:
        from_attributes = True

class ContractResponse(BaseModel):
    id: str
    fileName: str = Field(..., alias="file_name")
    uploadedAt: str = Field(..., alias="uploaded_at")
    status: str
    rawText: Optional[str] = Field(None, alias="raw_text")
    metadata: ContractMetadataBase
    clauses: List[ClauseBase]
    risks: List[RiskBase]
    obligations: List[ObligationBase]
    summary: ExecutiveSummaryBase
    confidence: ConfidenceBase
    comments: List[ReviewerCommentBase]
    audit: List[AuditEventBase]

    class Config:
        from_attributes = True
        populate_by_name = True

class DecisionSubmit(BaseModel):
    decision: str # ReviewDecision values
    comments: str
    checklist: Dict[str, bool]
