import json
from sqlalchemy import Column, String, Integer, Float, ForeignKey, DateTime, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.types import TypeDecorator
from datetime import datetime
from .database import Base

class JSONEncodedDict(TypeDecorator):
    """Represents an Immutable structure as a json-encoded string."""
    impl = Text

    def process_bind_param(self, value, dialect):
        if value is not None:
            return json.dumps(value)
        return None

    def process_result_value(self, value, dialect):
        if value is not None:
            return json.loads(value)
        return None

class ContractModel(Base):
    __tablename__ = "contracts"

    id = Column(String, primary_key=True, index=True)
    file_name = Column(String, nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="processing") # "processing" | "ready" | "reviewed"
    raw_text = Column(Text, nullable=True)

    metadata_rel = relationship("ContractMetadataModel", back_populates="contract", uselist=False, cascade="all, delete-orphan")
    clauses = relationship("ClauseModel", back_populates="contract", cascade="all, delete-orphan")
    risks = relationship("RiskModel", back_populates="contract", cascade="all, delete-orphan")
    obligations = relationship("ObligationModel", back_populates="contract", cascade="all, delete-orphan")
    summary = relationship("ExecutiveSummaryModel", back_populates="contract", uselist=False, cascade="all, delete-orphan")
    confidence = relationship("ConfidenceModel", back_populates="contract", uselist=False, cascade="all, delete-orphan")
    comments = relationship("ReviewerCommentModel", back_populates="contract", cascade="all, delete-orphan")
    audit = relationship("AuditEventModel", back_populates="contract", cascade="all, delete-orphan")

class ContractMetadataModel(Base):
    __tablename__ = "contract_metadata"

    contract_id = Column(String, ForeignKey("contracts.id"), primary_key=True)
    title = Column(String, nullable=False)
    agreement_type = Column(String, nullable=False)
    effective_date = Column(String, nullable=False)
    expiration_date = Column(String, nullable=True)
    payment_terms = Column(String, nullable=False)
    termination_conditions = Column(String, nullable=False)
    contract_value = Column(Float, nullable=False)
    currency = Column(String, nullable=False)
    governing_law = Column(String, nullable=False)

    contract = relationship("ContractModel", back_populates="metadata_rel")
    parties = relationship("PartyModel", back_populates="metadata_rel", cascade="all, delete-orphan")

class PartyModel(Base):
    __tablename__ = "parties"

    id = Column(String, primary_key=True)
    contract_id = Column(String, ForeignKey("contract_metadata.contract_id"), nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False)
    jurisdiction = Column(String, nullable=True)

    metadata_rel = relationship("ContractMetadataModel", back_populates="parties")

class ClauseModel(Base):
    __tablename__ = "clauses"

    id = Column(String, primary_key=True)
    contract_id = Column(String, ForeignKey("contracts.id"), nullable=False)
    title = Column(String, nullable=False)
    section = Column(String, nullable=False)
    text = Column(Text, nullable=False)
    page = Column(Integer, nullable=True)
    category = Column(String, nullable=True)
    confidence = Column(Float, nullable=True)

    contract = relationship("ContractModel", back_populates="clauses")

class RiskModel(Base):
    __tablename__ = "risks"

    id = Column(String, primary_key=True)
    contract_id = Column(String, ForeignKey("contracts.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String, nullable=False) # "critical" | "high" | "medium" | "low"
    category = Column(String, nullable=False) # "legal" | "commercial" | "operational" | "compliance"
    reasoning = Column(Text, nullable=False)
    recommendation = Column(Text, nullable=False)
    page = Column(String, nullable=True) # can be string "Entire Doc" or number
    confidence = Column(Float, nullable=False)
    status = Column(String, default="open") # "open" | "accepted" | "rejected"
    reviewer_note = Column(Text, nullable=True)

    contract = relationship("ContractModel", back_populates="risks")

class ObligationModel(Base):
    __tablename__ = "obligations"

    id = Column(String, primary_key=True)
    contract_id = Column(String, ForeignKey("contracts.id"), nullable=False)
    party = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    due_date = Column(String, nullable=True)
    status = Column(String, nullable=True) # "pending" | "recurring" | "one-time"
    clause_ref = Column(String, nullable=True)

    contract = relationship("ContractModel", back_populates="obligations")

class ExecutiveSummaryModel(Base):
    __tablename__ = "executive_summaries"

    contract_id = Column(String, ForeignKey("contracts.id"), primary_key=True)
    headline = Column(String, nullable=False)
    key_points = Column(JSONEncodedDict, nullable=False) # List[str] stored as JSON string
    overall_risk_score = Column(Integer, nullable=False)
    ai_confidence = Column(Integer, nullable=False)
    recommendation = Column(Text, nullable=False)

    contract = relationship("ContractModel", back_populates="summary")

class ConfidenceModel(Base):
    __tablename__ = "confidences"

    contract_id = Column(String, ForeignKey("contracts.id"), primary_key=True)
    overall = Column(Float, nullable=False)
    extraction = Column(Float, nullable=False)
    risk_detection = Column(Float, nullable=False)

    contract = relationship("ContractModel", back_populates="confidence")

class ReviewerCommentModel(Base):
    __tablename__ = "reviewer_comments"

    id = Column(String, primary_key=True)
    contract_id = Column(String, ForeignKey("contracts.id"), nullable=False)
    author = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    target_type = Column(String, nullable=True) # "risk" | "clause" | "obligation" | "general"
    target_id = Column(String, nullable=True)

    contract = relationship("ContractModel", back_populates="comments")

class AuditEventModel(Base):
    __tablename__ = "audit_events"

    id = Column(String, primary_key=True)
    contract_id = Column(String, ForeignKey("contracts.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    actor = Column(String, nullable=False)
    action = Column(String, nullable=False)
    detail = Column(Text, nullable=True)
    icon = Column(String, nullable=True)

    contract = relationship("ContractModel", back_populates="audit")
