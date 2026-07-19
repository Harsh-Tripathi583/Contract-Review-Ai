import uuid
import os
from pathlib import Path
from datetime import datetime
from fastapi import FastAPI, Depends, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from typing import Optional

from .database import engine, Base, get_db, SessionLocal
from .models import (
    ContractModel, ContractMetadataModel, PartyModel, ClauseModel,
    RiskModel, ObligationModel, ExecutiveSummaryModel, ConfidenceModel,
    ReviewerCommentModel, AuditEventModel
)
from .schemas import (
    ContractResponse, ContractMetadataUpdate, RiskUpdate,
    CommentCreate, ReviewerCommentBase, DecisionSubmit
)
from .parser import extract_text_pages
from .ai_service import extract_contract_data

load_dotenv(Path(__file__).resolve().with_name(".env"))

# Create DB tables
Base.metadata.create_all(bind=engine)

# Seed c-1001 mock contract if it doesn't exist
def seed_default_contract():
    db = SessionLocal()
    try:
        exists = db.query(ContractModel).filter(ContractModel.id == "c-1001").first()
        if not exists:
            sample_text = (
                "This Software as a Service Agreement (this \"Agreement\") is entered into as of October 15, "
                "2023 (the \"Effective Date\"), by and between Acme Corp, a Delaware "
                "corporation (\"Provider\"), and Globex Inc., a California corporation "
                "(\"Customer\").\n\n"
                "1. Definitions\n"
                "\"Authorized User\" means any employee, contractor, agent, or other individual authorized by "
                "Customer to access and use the Services.\n\n"
                "5. Term and Termination\n"
                "5.3 Renewal. This Agreement shall automatically renew for successive twelve (12) month "
                "periods unless either party provides written notice of non-renewal at least ninety (90) "
                "days prior to the expiration of the then-current term.\n\n"
                "12. Limitation of Liability\n"
                "12.2 Liability Cap. Except for obligations regarding confidentiality and indemnification, "
                "the total aggregate liability of Client shall not exceed the amounts paid under this "
                "Agreement. Provider liability remains uncapped for indirect damages arising from service "
                "failures.\n\n"
                "15. General Provisions\n"
                "[Section 15.4 Governing Law — Omitted from document]"
            )

            contract = ContractModel(
                id="c-1001",
                file_name="Software_as_a_Service_Agreement.pdf",
                uploaded_at=datetime.utcnow(),
                status="ready",
                raw_text=sample_text
            )
            db.add(contract)
            db.flush()

            metadata = ContractMetadataModel(
                contract_id="c-1001",
                title="Software as a Service (SaaS) Agreement",
                agreement_type="SaaS Agreement",
                effective_date="2023-10-15",
                expiration_date="2024-10-14",
                payment_terms="Net 30",
                termination_conditions="90 days written notice",
                contract_value=120000.0,
                currency="USD",
                governing_law="Delaware"
            )
            db.add(metadata)

            parties = [
                PartyModel(id="c-1001_p-1", contract_id="c-1001", name="Acme Corp", role="Provider", jurisdiction="Delaware"),
                PartyModel(id="c-1001_p-2", contract_id="c-1001", name="Globex Inc.", role="Customer", jurisdiction="California")
            ]
            for p in parties:
                db.add(p)

            clauses = [
                ClauseModel(
                    id="c-1001_cl-1",
                    contract_id="c-1001",
                    title="Renewal",
                    section="5.3",
                    text="This Agreement shall automatically renew for successive twelve (12) month periods unless either party provides written notice of non-renewal at least ninety (90) days prior to the expiration of the then-current term.",
                    page=1,
                    category="termination",
                    confidence=0.98
                ),
                ClauseModel(
                    id="c-1001_cl-2",
                    contract_id="c-1001",
                    title="Liability Cap",
                    section="12.2",
                    text="Except for obligations regarding confidentiality and indemnification, the total aggregate liability of Client shall not exceed the amounts paid under this Agreement. Provider liability remains uncapped for indirect damages arising from service failures.",
                    page=1,
                    category="liability",
                    confidence=0.95
                )
            ]
            for cl in clauses:
                db.add(cl)

            risks = [
                RiskModel(
                    id="c-1001_r-1",
                    contract_id="c-1001",
                    title="Automatic Renewal",
                    description="The contract auto-renews for 12-month periods unless notice is given 90 days in advance.",
                    severity="medium",
                    category="termination",
                    reasoning="90 days is a long lead time for termination and can lead to accidental renewal.",
                    recommendation="Negotiate notice period down to 30 or 60 days.",
                    page="1",
                    confidence=0.96,
                    status="open",
                    reviewer_note=""
                ),
                RiskModel(
                    id="c-1001_r-2",
                    contract_id="c-1001",
                    title="Uncapped Liability",
                    description="Provider's liability is uncapped for indirect damages.",
                    severity="high",
                    category="liability",
                    reasoning="Uncapped liability exposes the client to unlimited financial risk.",
                    recommendation="Negotiate a reasonable cap (e.g., 12 or 24 months fees).",
                    page="1",
                    confidence=0.95,
                    status="open",
                    reviewer_note=""
                )
            ]
            for r in risks:
                db.add(r)

            obligations = [
                ObligationModel(
                    id="c-1001_o-1",
                    contract_id="c-1001",
                    party="Globex Inc.",
                    description="Provide written notice of non-renewal 90 days prior to term expiration.",
                    due_date="2024-07-16",
                    status="pending",
                    clause_ref="Section 5.3"
                )
            ]
            for o in obligations:
                db.add(o)

            summary = ExecutiveSummaryModel(
                contract_id="c-1001",
                headline="Medium-risk SaaS agreement with auto-renewal and liability cap exposures.",
                key_points=["Auto-renews unless notified 90 days in advance.", "Uncapped liability for indirect damages.", "Governed by Delaware law."],
                overall_risk_score=45,
                ai_confidence=92,
                recommendation="Review the liability cap and negotiate a shorter renewal notice period."
            )
            db.add(summary)

            confidence = ConfidenceModel(
                contract_id="c-1001",
                overall=0.94,
                extraction=0.96,
                risk_detection=0.92
            )
            db.add(confidence)

            db.add(AuditEventModel(
                id="c-1001_a-1",
                contract_id="c-1001",
                timestamp=datetime.utcnow(),
                actor="System",
                action="Contract uploaded",
                detail="Document Software_as_a_Service_Agreement.pdf uploaded successfully.",
                icon="upload_file"
            ))
            db.add(AuditEventModel(
                id="c-1001_a-2",
                contract_id="c-1001",
                timestamp=datetime.utcnow(),
                actor="AI Assistant",
                action="AI analysis completed",
                detail="All clauses, risks, and obligations extracted.",
                icon="smart_toy"
            ))

            db.commit()
    except Exception as e:
        db.rollback()
        print("Failed to seed default contract:", e)
    finally:
        db.close()

seed_default_contract()

app = FastAPI(title="Contract Insight Hub API")

# Configure CORS
default_cors_origins = (
    "http://localhost:3000,http://localhost:5173,http://localhost:8080,"
    "http://127.0.0.1:3000,http://127.0.0.1:5173,http://127.0.0.1:8080"
)
cors_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", default_cors_origins).split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path(__file__).resolve().parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)
MAX_UPLOAD_SIZE_BYTES = int(os.getenv("MAX_UPLOAD_SIZE_BYTES", str(50 * 1024 * 1024)))

def make_global_id(contract_id: str, local_id: Optional[str]) -> str:
    if not local_id:
        return f"{contract_id}_{uuid.uuid4().hex[:6]}"
    if local_id.startswith(contract_id):
        return local_id
    return f"{contract_id}_{local_id}"

@app.post("/api/contracts/upload", status_code=201)
async def upload_contract(file: UploadFile = File(...), db: Session = Depends(get_db)):
    contract_id = f"c-{uuid.uuid4().hex[:6]}"
    file_ext = os.path.splitext(file.filename)[1].lower()
    
    if file_ext not in [".pdf", ".docx", ".txt"]:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file extension. Only PDF, DOCX, and TXT files are allowed."
        )
    
    # Save the upload in bounded chunks instead of trusting the client-side size check.
    local_path = UPLOAD_DIR / f"{contract_id}{file_ext}"
    try:
        with open(local_path, "wb") as buffer:
            total_size = 0
            while chunk := await file.read(1024 * 1024):
                total_size += len(chunk)
                if total_size > MAX_UPLOAD_SIZE_BYTES:
                    raise HTTPException(
                        status_code=413,
                        detail=f"File exceeds the {MAX_UPLOAD_SIZE_BYTES // (1024 * 1024)}MB limit.",
                    )
                buffer.write(chunk)
    except HTTPException:
        local_path.unlink(missing_ok=True)
        raise
    except Exception as e:
        local_path.unlink(missing_ok=True)
        raise HTTPException(status_code=500, detail=f"Failed to save uploaded file: {str(e)}")
    finally:
        await file.close()

    # Extract Text
    try:
        pages_text = extract_text_pages(str(local_path))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse contract file: {str(e)}")

    # Perform AI Extraction
    try:
        ai_data = extract_contract_data(pages_text, file.filename)
    except ValueError as e:
        # OPENROUTER_API_KEY not set
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=400,
            detail=f"{str(e)}"
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"AI analysis failed: {str(e)}"
        )

    # Save to SQLite DB
    try:
        # Compile raw text from pages
        raw_text_compiled = "\n\n".join(pages_text)

        # Create Contract
        contract = ContractModel(
            id=contract_id,
            file_name=file.filename,
            uploaded_at=datetime.utcnow(),
            status="ready",
            raw_text=raw_text_compiled
        )
        db.add(contract)

        # Create Metadata
        meta_data = ai_data.get("metadata", {})
        metadata_model = ContractMetadataModel(
            contract_id=contract_id,
            title=meta_data.get("title", "Untitled Contract"),
            agreement_type=meta_data.get("agreement_type", "Omitted"),
            effective_date=meta_data.get("effective_date", "Omitted"),
            expiration_date=meta_data.get("expiration_date", "Omitted"),
            payment_terms=meta_data.get("payment_terms", "Omitted"),
            termination_conditions=meta_data.get("termination_conditions", "Omitted"),
            contract_value=float(meta_data.get("contract_value", 0) or 0),
            currency=meta_data.get("currency", "USD"),
            governing_law=meta_data.get("governing_law", "Omitted")
        )
        db.add(metadata_model)

        # Create Parties
        for p in meta_data.get("parties", []):
            party_model = PartyModel(
                id=make_global_id(contract_id, p.get("id")),
                contract_id=contract_id,
                name=p.get("name", "Unknown Party"),
                role=p.get("role", "Unknown Role"),
                jurisdiction=p.get("jurisdiction")
            )
            db.add(party_model)

        # Create Clauses
        for cl in ai_data.get("clauses", []):
            clause_model = ClauseModel(
                id=make_global_id(contract_id, cl.get("id")),
                contract_id=contract_id,
                title=cl.get("title", ""),
                section=cl.get("section", ""),
                text=cl.get("text", ""),
                page=cl.get("page"),
                category=cl.get("category"),
                confidence=cl.get("confidence")
            )
            db.add(clause_model)

        # Create Risks
        for r in ai_data.get("risks", []):
            risk_model = RiskModel(
                id=make_global_id(contract_id, r.get("id")),
                contract_id=contract_id,
                title=r.get("title", ""),
                description=r.get("description", ""),
                severity=r.get("severity", "medium"),
                category=r.get("category", "legal"),
                reasoning=r.get("reasoning", ""),
                recommendation=r.get("recommendation", ""),
                page=str(r.get("page", "")),
                confidence=float(r.get("confidence", 0.9) if r.get("confidence") is not None else 0.9),
                status="open"
            )
            db.add(risk_model)

        # Create Obligations
        for o in ai_data.get("obligations", []):
            obligation_model = ObligationModel(
                id=make_global_id(contract_id, o.get("id")),
                contract_id=contract_id,
                party=o.get("party", ""),
                description=o.get("description", ""),
                due_date=o.get("due_date"),
                status=o.get("status"),
                clause_ref=o.get("clause_ref")
            )
            db.add(obligation_model)

        # Create Summary
        sum_data = ai_data.get("summary", {})
        summary_model = ExecutiveSummaryModel(
            contract_id=contract_id,
            headline=sum_data.get("headline", ""),
            key_points=sum_data.get("key_points", []),
            overall_risk_score=int(sum_data.get("overall_risk_score", 0) if sum_data.get("overall_risk_score") is not None else 0),
            ai_confidence=int(sum_data.get("ai_confidence", 0) if sum_data.get("ai_confidence") is not None else 0),
            recommendation=sum_data.get("recommendation", "")
        )
        db.add(summary_model)

        # Create Confidence
        conf_data = ai_data.get("confidence", {})
        confidence_model = ConfidenceModel(
            contract_id=contract_id,
            overall=float(conf_data.get("overall", 0) if conf_data.get("overall") is not None else 0),
            extraction=float(conf_data.get("extraction", 0) if conf_data.get("extraction") is not None else 0),
            risk_detection=float(conf_data.get("risk_detection", 0) if conf_data.get("risk_detection") is not None else 0)
        )
        db.add(confidence_model)

        # Create Audit Logs
        audit_1 = AuditEventModel(
            id=f"a-{uuid.uuid4().hex[:4]}",
            contract_id=contract_id,
            timestamp=datetime.utcnow(),
            actor="System",
            action="Contract uploaded",
            detail=f"File: {file.filename}",
            icon="cloud_upload"
        )
        audit_2 = AuditEventModel(
            id=f"a-{uuid.uuid4().hex[:4]}",
            contract_id=contract_id,
            timestamp=datetime.utcnow(),
            actor="AI Engine",
            action="AI analysis completed",
            detail="All clauses, risks, and obligations extracted.",
            icon="smart_toy"
        )
        db.add(audit_1)
        db.add(audit_2)

        db.commit()
    except Exception as e:
        db.rollback()
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Database transaction failed: {str(e)}")

    return {"contractId": contract_id}

@app.get("/api/contracts/{contract_id}", response_model=ContractResponse, response_model_by_alias=False)
def get_contract(contract_id: str, db: Session = Depends(get_db)):
    contract = db.query(ContractModel).filter(ContractModel.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    # Structure metadata for response
    parties = [
        {
            "id": p.id,
            "name": p.name,
            "role": p.role,
            "jurisdiction": p.jurisdiction
        }
        for p in contract.metadata_rel.parties
    ]
    
    metadata = {
        "title": contract.metadata_rel.title,
        "agreement_type": contract.metadata_rel.agreement_type,
        "effective_date": contract.metadata_rel.effective_date,
        "expiration_date": contract.metadata_rel.expiration_date,
        "payment_terms": contract.metadata_rel.payment_terms,
        "termination_conditions": contract.metadata_rel.termination_conditions,
        "contract_value": contract.metadata_rel.contract_value,
        "currency": contract.metadata_rel.currency,
        "governing_law": contract.metadata_rel.governing_law,
        "parties": parties
    }

    clauses = [
        {
            "id": cl.id,
            "title": cl.title,
            "section": cl.section,
            "text": cl.text,
            "page": cl.page,
            "category": cl.category,
            "confidence": cl.confidence
        }
        for cl in contract.clauses
    ]

    risks = [
        {
            "id": r.id,
            "title": r.title,
            "description": r.description,
            "severity": r.severity,
            "category": r.category,
            "reasoning": r.reasoning,
            "recommendation": r.recommendation,
            "page": r.page,
            "confidence": r.confidence,
            "status": r.status,
            "reviewer_note": r.reviewer_note
        }
        for r in contract.risks
    ]

    obligations = [
        {
            "id": o.id,
            "party": o.party,
            "description": o.description,
            "due_date": o.due_date,
            "status": o.status,
            "clause_ref": o.clause_ref
        }
        for o in contract.obligations
    ]

    summary = {
        "headline": contract.summary.headline,
        "key_points": contract.summary.key_points,
        "overall_risk_score": contract.summary.overall_risk_score,
        "ai_confidence": contract.summary.ai_confidence,
        "recommendation": contract.summary.recommendation
    }

    confidence = {
        "overall": contract.confidence.overall,
        "extraction": contract.confidence.extraction,
        "risk_detection": contract.confidence.risk_detection
    }

    comments = []
    for c in contract.comments:
        target = None
        if c.target_type:
            target = {"type": c.target_type, "id": c.target_id}
        
        comments.append({
            "id": c.id,
            "author": c.author,
            "message": c.message,
            "created_at": c.created_at.isoformat() + "Z",
            "target": target
        })

    audit = [
        {
            "id": a.id,
            "timestamp": a.timestamp.isoformat() + "Z",
            "actor": a.actor,
            "action": a.action,
            "detail": a.detail,
            "icon": a.icon
        }
        for a in contract.audit
    ]

    return {
        "id": contract.id,
        "file_name": contract.file_name,
        "uploaded_at": contract.uploaded_at.isoformat() + "Z",
        "status": contract.status,
        "raw_text": contract.raw_text,
        "metadata": metadata,
        "clauses": clauses,
        "risks": risks,
        "obligations": obligations,
        "summary": summary,
        "confidence": confidence,
        "comments": comments,
        "audit": audit
    }

@app.patch("/api/contracts/{contract_id}/metadata")
def update_metadata(contract_id: str, payload: ContractMetadataUpdate, db: Session = Depends(get_db)):
    contract = db.query(ContractModel).filter(ContractModel.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    meta = contract.metadata_rel
    update_data = payload.model_dump(exclude_unset=True, by_alias=True)

    if "parties" in update_data:
        # Delete existing parties
        db.query(PartyModel).filter(PartyModel.contract_id == contract_id).delete()
        # Add new parties
        for p in update_data["parties"]:
            party_model = PartyModel(
                id=make_global_id(contract_id, p.get("id")),
                contract_id=contract_id,
                name=p.get("name"),
                role=p.get("role"),
                jurisdiction=p.get("jurisdiction")
            )
            db.add(party_model)
        del update_data["parties"]

    for key, val in update_data.items():
        setattr(meta, key, val)

    # Add audit event
    audit = AuditEventModel(
        id=f"a-{uuid.uuid4().hex[:4]}",
        contract_id=contract_id,
        timestamp=datetime.utcnow(),
        actor="Reviewer",
        action="Metadata updated",
        detail="Contract details and party definitions adjusted manually.",
        icon="edit"
    )
    db.add(audit)
    db.commit()
    db.refresh(meta)
    
    return {"ok": True}

@app.patch("/api/contracts/{contract_id}/risks/{risk_id}")
def update_risk(contract_id: str, risk_id: str, payload: RiskUpdate, db: Session = Depends(get_db)):
    risk = db.query(RiskModel).filter(RiskModel.contract_id == contract_id, RiskModel.id == risk_id).first()
    if not risk:
        raise HTTPException(status_code=404, detail="Risk not found")

    update_data = payload.model_dump(exclude_unset=True, by_alias=True, exclude={"id"})
    for key, val in update_data.items():
        setattr(risk, key, val)

    # Log audit event
    status_msg = f"Risk status set to {payload.status}" if payload.status else "Risk note edited"
    audit = AuditEventModel(
        id=f"a-{uuid.uuid4().hex[:4]}",
        contract_id=contract_id,
        timestamp=datetime.utcnow(),
        actor="Reviewer",
        action="Risk assessment updated",
        detail=f"Risk: '{risk.title}'. {status_msg}.",
        icon="rule"
    )
    db.add(audit)
    db.commit()
    return {"ok": True}

@app.post("/api/contracts/{contract_id}/comments", response_model=ReviewerCommentBase, response_model_by_alias=False)
def add_comment(contract_id: str, payload: CommentCreate, db: Session = Depends(get_db)):
    contract = db.query(ContractModel).filter(ContractModel.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    comment_id = f"cm-{uuid.uuid4().hex[:4]}"
    target_type = payload.target.type if payload.target else None
    target_id = payload.target.id if payload.target else None

    comment = ReviewerCommentModel(
        id=comment_id,
        contract_id=contract_id,
        author=payload.author,
        message=payload.message,
        created_at=datetime.utcnow(),
        target_type=target_type,
        target_id=target_id
    )
    db.add(comment)

    # Log audit event
    audit = AuditEventModel(
        id=f"a-{uuid.uuid4().hex[:4]}",
        contract_id=contract_id,
        timestamp=datetime.utcnow(),
        actor=payload.author,
        action="Comment added",
        detail=f"Placed comment: '{payload.message[:60]}...'",
        icon="comment"
    )
    db.add(audit)
    db.commit()
    db.refresh(comment)

    target_res = None
    if comment.target_type:
        target_res = {"type": comment.target_type, "id": comment.target_id}

    return {
        "id": comment.id,
        "author": comment.author,
        "message": comment.message,
        "created_at": comment.created_at.isoformat() + "Z",
        "target": target_res
    }

@app.post("/api/contracts/{contract_id}/decision")
def submit_decision(contract_id: str, payload: DecisionSubmit, db: Session = Depends(get_db)):
    contract = db.query(ContractModel).filter(ContractModel.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    contract.status = "reviewed"
    
    # Log audit event
    audit = AuditEventModel(
        id=f"a-{uuid.uuid4().hex[:4]}",
        contract_id=contract_id,
        timestamp=datetime.utcnow(),
        actor="Reviewer",
        action="Review completed",
        detail=f"Decision: {payload.decision.upper()}. Comments: {payload.comments}",
        icon="gavel"
    )
    db.add(audit)
    db.commit()
    return {"ok": True}

@app.post("/api/log-error")
async def log_error(payload: dict):
    print("\n[CLIENT LOG] Client-side error captured:")
    import json
    print(json.dumps(payload, indent=2))
    print("[CLIENT LOG] End of error log\n")
    return {"ok": True}

