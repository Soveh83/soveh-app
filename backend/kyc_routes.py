# KYC Routes for SREYANIMTI App
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid
import base64
from ai_service import ai_service

kyc_router = APIRouter(prefix="/kyc", tags=["KYC"])

class KYCDocument(BaseModel):
    id: str = None
    user_id: str
    document_type: str  # trade_license, shop_photo, id_proof, gst_certificate
    document_url: str  # base64 or URL
    status: str = "pending"  # pending, verified, rejected, manual_review
    ai_verification: Optional[dict] = None
    confidence_score: Optional[float] = None
    extracted_info: Optional[dict] = None
    issues: Optional[List[str]] = None
    created_at: datetime = None
    verified_at: Optional[datetime] = None
    verified_by: Optional[str] = None  # "ai" or admin_id

class KYCUploadRequest(BaseModel):
    document_type: str
    image_base64: str

class KYCStatus(BaseModel):
    user_id: str
    overall_status: str  # incomplete, pending, approved, rejected
    documents: List[dict]
    trust_score: Optional[int] = None
    missing_documents: List[str] = []

# Store reference (will be set from main server)
db = None

def set_db(database):
    global db
    db = database

@kyc_router.post("/upload")
async def upload_kyc_document(request: KYCUploadRequest, user_id: str):
    """Upload and verify KYC document with AI"""
    try:
        # Create document record
        doc_id = str(uuid.uuid4())
        
        # AI verification
        verification_result = await ai_service.verify_kyc_document(
            request.image_base64,
            request.document_type
        )
        
        # Parse AI response
        ai_response = verification_result.get("verification", "")
        status = "pending"
        confidence = 0
        extracted_info = {}
        issues = []
        
        # Try to parse AI response as JSON
        try:
            import json
            if isinstance(ai_response, str):
                # Clean up response if needed
                ai_response = ai_response.strip()
                if ai_response.startswith("```"):
                    ai_response = ai_response.split("```")[1]
                    if ai_response.startswith("json"):
                        ai_response = ai_response[4:]
                ai_data = json.loads(ai_response)
            else:
                ai_data = ai_response
            
            confidence = ai_data.get("confidence", 50)
            extracted_info = ai_data.get("extracted_info", {})
            issues = ai_data.get("issues", [])
            recommendation = ai_data.get("recommendation", "manual_review")
            
            if recommendation == "approve" and confidence >= 80:
                status = "verified"
            elif recommendation == "reject":
                status = "rejected"
            else:
                status = "manual_review"
        except:
            status = "manual_review"
            confidence = 50
        
        # Create document record
        document = {
            "id": doc_id,
            "user_id": user_id,
            "document_type": request.document_type,
            "document_url": f"data:image/jpeg;base64,{request.image_base64[:100]}...",  # Store reference
            "status": status,
            "ai_verification": verification_result,
            "confidence_score": confidence,
            "extracted_info": extracted_info,
            "issues": issues,
            "created_at": datetime.utcnow().isoformat(),
            "verified_at": datetime.utcnow().isoformat() if status == "verified" else None,
            "verified_by": "ai" if status == "verified" else None
        }
        
        if db:
            await db.kyc_documents.insert_one(document)
        
        return {
            "success": True,
            "document_id": doc_id,
            "status": status,
            "confidence": confidence,
            "extracted_info": extracted_info,
            "issues": issues,
            "message": f"Document {'verified automatically' if status == 'verified' else 'submitted for review'}"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@kyc_router.get("/status/{user_id}")
async def get_kyc_status(user_id: str):
    """Get KYC verification status for a user"""
    try:
        required_docs = ["trade_license", "shop_photo"]
        optional_docs = ["id_proof", "gst_certificate"]
        
        documents = []
        if db:
            docs = await db.kyc_documents.find({"user_id": user_id}).to_list(100)
            documents = docs
        
        submitted_types = [d.get("document_type") for d in documents]
        missing_docs = [doc for doc in required_docs if doc not in submitted_types]
        
        # Calculate overall status
        if missing_docs:
            overall_status = "incomplete"
        elif all(d.get("status") == "verified" for d in documents if d.get("document_type") in required_docs):
            overall_status = "approved"
        elif any(d.get("status") == "rejected" for d in documents):
            overall_status = "rejected"
        else:
            overall_status = "pending"
        
        # Calculate trust score
        trust_score = 0
        for doc in documents:
            if doc.get("status") == "verified":
                trust_score += 25
            elif doc.get("status") == "manual_review":
                trust_score += 10
        trust_score = min(100, trust_score)
        
        return KYCStatus(
            user_id=user_id,
            overall_status=overall_status,
            documents=[{
                "type": d.get("document_type"),
                "status": d.get("status"),
                "confidence": d.get("confidence_score"),
                "uploaded_at": d.get("created_at")
            } for d in documents],
            trust_score=trust_score,
            missing_documents=missing_docs
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@kyc_router.post("/analyze-shop")
async def analyze_shop_photo(request: KYCUploadRequest):
    """Analyze shop photo with AI"""
    try:
        result = await ai_service.analyze_shop_image(request.image_base64)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
