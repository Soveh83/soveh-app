from fastapi import FastAPI, APIRouter, HTTPException, Depends, BackgroundTasks, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
from bson import ObjectId
import random
import string
import hashlib
import razorpay

# Import new utility modules
from email_service import send_otp_email, send_order_notification, send_admin_notification
from admin_auth import is_admin, verify_admin, get_user_by_uid
from sms_service import sms_service

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client.get_database(os.environ.get('DB_NAME', 'soveh_db'))

# Razorpay client (configured from environment)
RAZORPAY_KEY_ID = os.getenv('RAZORPAY_KEY_ID', 'rzp_test_dummy')
RAZORPAY_KEY_SECRET = os.getenv('RAZORPAY_KEY_SECRET', 'test_secret_dummy')
razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

# Security
security = HTTPBearer()

app = FastAPI(title="SOVEH API", version="1.0.0")
api_router = APIRouter(prefix="/api")

# ==================== MODELS ====================

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate
    
    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)
    
    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")

# User Models
class UserRole:
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    WAREHOUSE_MANAGER = "warehouse_manager"
    RETAILER = "retailer"
    DELIVERY_AGENT = "delivery_agent"
    CUSTOMER = "customer"
    SUPPORT_EXECUTIVE = "support_executive"
    FINANCE_TEAM = "finance_team"

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    phone: str
    role: str
    name: Optional[str] = None
    email: Optional[str] = None
    is_active: bool = True
    is_blocked: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None

class OTPRequest(BaseModel):
    phone: str

class OTPVerify(BaseModel):
    phone: str
    otp: str
    role: Optional[str] = "customer"

class OTPResponse(BaseModel):
    success: bool
    message: str
    session_id: Optional[str] = None

class LoginResponse(BaseModel):
    success: bool
    token: str
    user: User

# Retailer Models
class RetailerStatus:
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class RetailerOnboarding(BaseModel):
    user_id: str
    shop_name: str
    owner_name: str
    mobile: str
    address: str
    gst: Optional[str] = None
    pan: Optional[str] = None
    kyc_documents: List[str] = []  # base64 images
    status: str = RetailerStatus.PENDING
    credit_limit: float = 0.0
    is_vip: bool = False
    vip_since: Optional[datetime] = None
    total_purchases: float = 0.0
    created_at: datetime = Field(default_factory=datetime.utcnow)

class RetailerApproval(BaseModel):
    retailer_id: str
    status: str
    credit_limit: Optional[float] = 0.0

# Product Models
class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    category_id: str
    brand_id: Optional[str] = None
    images: List[str] = []  # base64 images
    mrp: float
    retailer_price: float
    customer_price: float
    margin_percent: float
    stock_quantity: int
    min_order_qty: int = 1
    max_order_qty: Optional[int] = None
    unit_size: Optional[str] = None
    expiry_date: Optional[datetime] = None
    gst_percent: float = 0.0
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Category(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    image: Optional[str] = None
    parent_id: Optional[str] = None
    is_active: bool = True

class Brand(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    logo: Optional[str] = None
    is_active: bool = True

# Order Models
class OrderStatus:
    PLACED = "placed"
    CONFIRMED = "confirmed"
    PACKED = "packed"
    OUT_FOR_DELIVERY = "out_for_delivery"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    RETURNED = "returned"

class OrderItem(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    price: float
    total: float

class Order(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order_number: str = Field(default_factory=lambda: f"ORD{random.randint(100000, 999999)}")
    user_id: str
    user_role: str
    items: List[OrderItem]
    subtotal: float
    gst_amount: float
    delivery_charges: float
    discount: float = 0.0
    total_amount: float
    payment_mode: str  # cod, online, credit
    payment_status: str = "pending"
    order_status: str = OrderStatus.PLACED
    delivery_address: Dict[str, Any]
    delivery_slot: Optional[str] = None
    assigned_warehouse: Optional[str] = None
    assigned_delivery_agent: Optional[str] = None
    delivery_otp: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class OrderCreate(BaseModel):
    items: List[OrderItem]
    payment_mode: str
    delivery_address: Dict[str, Any]
    delivery_slot: Optional[str] = None

# Payment Models
class Payment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order_id: str
    user_id: str
    amount: float
    payment_method: str
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    status: str = "pending"
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Credit Models
class CreditLedger(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    retailer_id: str
    transaction_type: str  # credit_purchase, payment, adjustment
    amount: float
    balance: float
    order_id: Optional[str] = None
    description: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Return Models
class ReturnRequest(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order_id: str
    user_id: str
    items: List[OrderItem]
    reason: str
    images: List[str] = []
    status: str = "pending"  # pending, approved, rejected
    refund_amount: float
    refund_method: str  # wallet, credit, original
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Support Models
class SupportTicket(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    ticket_number: str = Field(default_factory=lambda: f"TKT{random.randint(100000, 999999)}")
    user_id: str
    subject: str
    description: str
    status: str = "open"  # open, in_progress, resolved, closed
    assigned_to: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Config Models
class AppConfig(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    key: str
    value: Any
    description: Optional[str] = None
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# ==================== HELPER FUNCTIONS ====================

def generate_otp():
    return ''.join(random.choices(string.digits, k=6))

def generate_token(user_id: str, role: str):
    token_data = f"{user_id}:{role}:{datetime.utcnow().isoformat()}"
    return hashlib.sha256(token_data.encode()).hexdigest()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    # Simple token validation (in production, use JWT)
    user = await db.users.find_one({"token": token})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return User(**user)

# ==================== AUTH ENDPOINTS ====================

@api_router.post("/auth/send-otp", response_model=OTPResponse)
async def send_otp(request: OTPRequest):
    """Send OTP to phone number via SMS"""
    try:
        otp = generate_otp()
        session_id = str(uuid.uuid4())
        
        # Store OTP in database (expires in 5 minutes)
        await db.otp_sessions.insert_one({
            "session_id": session_id,
            "phone": request.phone,
            "otp": otp,
            "created_at": datetime.utcnow(),
            "expires_at": datetime.utcnow() + timedelta(minutes=5)
        })
        
        # Send OTP via SMS
        success, message = await sms_service.send_otp_sms(request.phone, otp)
        
        logging.info(f"OTP for {request.phone}: {otp}")
        
        return OTPResponse(
            success=True,
            message=message,
            session_id=session_id
        )
    except Exception as e:
        logging.error(f"Error sending OTP: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/auth/verify-otp", response_model=LoginResponse)
async def verify_otp(request: OTPVerify):
    """Verify OTP and login/register user"""
    try:
        # Find OTP session
        otp_session = await db.otp_sessions.find_one({
            "phone": request.phone,
            "otp": request.otp,
            "expires_at": {"$gt": datetime.utcnow()}
        })
        
        if not otp_session:
            raise HTTPException(status_code=400, detail="Invalid or expired OTP")
        
        # Check if user exists
        user = await db.users.find_one({"phone": request.phone})
        
        if not user:
            # Create new user
            new_user = User(
                phone=request.phone,
                role=request.role,
                last_login=datetime.utcnow()
            )
            await db.users.insert_one(new_user.dict())
            user = new_user.dict()
        else:
            # Update last login
            await db.users.update_one(
                {"phone": request.phone},
                {"$set": {"last_login": datetime.utcnow()}}
            )
        
        # Generate token
        token = generate_token(user["id"], user["role"])
        await db.users.update_one({"id": user["id"]}, {"$set": {"token": token}})
        
        # Delete used OTP
        await db.otp_sessions.delete_one({"session_id": otp_session["session_id"]})
        
        return LoginResponse(
            success=True,
            token=token,
            user=User(**user)
        )
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error verifying OTP: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/auth/me", response_model=User)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

# ==================== RETAILER ENDPOINTS ====================

@api_router.post("/retailers/onboard")
async def onboard_retailer(retailer: RetailerOnboarding, current_user: User = Depends(get_current_user)):
    try:
        retailer_dict = retailer.dict()
        await db.retailers.insert_one(retailer_dict)
        return {"success": True, "message": "Retailer onboarding submitted for approval"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/retailers/profile")
async def get_retailer_profile(current_user: User = Depends(get_current_user)):
    retailer = await db.retailers.find_one({"user_id": current_user.id})
    if not retailer:
        raise HTTPException(status_code=404, detail="Retailer profile not found")
    return retailer

@api_router.get("/retailers/pending")
async def get_pending_retailers(current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    retailers = await db.retailers.find({"status": RetailerStatus.PENDING}).to_list(100)
    return retailers

@api_router.post("/retailers/approve")
async def approve_retailer(approval: RetailerApproval, current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    update_data = {
        "status": approval.status,
        "updated_at": datetime.utcnow()
    }
    
    if approval.credit_limit:
        update_data["credit_limit"] = approval.credit_limit
    
    await db.retailers.update_one(
        {"user_id": approval.retailer_id},
        {"$set": update_data}
    )
    
    return {"success": True, "message": "Retailer status updated"}

# ==================== PRODUCT ENDPOINTS ====================

@api_router.post("/products")
async def create_product(product: Product, current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    product_dict = product.dict()
    await db.products.insert_one(product_dict)
    return {"success": True, "product": product_dict}

@api_router.get("/products")
async def get_products(category_id: Optional[str] = None, search: Optional[str] = None, skip: int = 0, limit: int = 50):
    query = {"is_active": True}
    
    if category_id:
        query["category_id"] = category_id
    
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    
    products = await db.products.find(query).skip(skip).limit(limit).to_list(limit)
    # Remove MongoDB _id field for JSON serialization
    for product in products:
        if "_id" in product:
            del product["_id"]
    return products

@api_router.get("/products/{product_id}")
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    # Remove MongoDB _id field for JSON serialization
    if "_id" in product:
        del product["_id"]
    return product

# ==================== CATEGORY ENDPOINTS ====================

@api_router.post("/categories")
async def create_category(category: Category, current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    category_dict = category.dict()
    await db.categories.insert_one(category_dict)
    return {"success": True, "category": category_dict}

@api_router.get("/categories")
async def get_categories():
    categories = await db.categories.find({"is_active": True}).to_list(100)
    # Remove MongoDB _id field for JSON serialization
    for category in categories:
        if "_id" in category:
            del category["_id"]
    return categories

# ==================== ORDER ENDPOINTS ====================

@api_router.post("/orders")
async def create_order(order_data: OrderCreate, current_user: User = Depends(get_current_user)):
    try:
        # Calculate totals
        subtotal = sum(item.total for item in order_data.items)
        gst_amount = subtotal * 0.05  # 5% GST
        delivery_charges = 0 if subtotal > 500 else 50
        total_amount = subtotal + gst_amount + delivery_charges
        
        # Create order
        order = Order(
            user_id=current_user.id,
            user_role=current_user.role,
            items=order_data.items,
            subtotal=subtotal,
            gst_amount=gst_amount,
            delivery_charges=delivery_charges,
            total_amount=total_amount,
            payment_mode=order_data.payment_mode,
            delivery_address=order_data.delivery_address,
            delivery_slot=order_data.delivery_slot,
            delivery_otp=generate_otp()[:4]  # 4-digit OTP
        )
        
        order_dict = order.dict()
        await db.orders.insert_one(order_dict)
        
        # Handle payment
        if order_data.payment_mode == "online":
            # Create Razorpay order
            try:
                razorpay_order = razorpay_client.order.create({
                    "amount": int(total_amount * 100),  # paise
                    "currency": "INR",
                    "receipt": order.order_number
                })
                order_dict["razorpay_order_id"] = razorpay_order["id"]
            except:
                # If Razorpay fails (test mode), continue
                order_dict["razorpay_order_id"] = f"order_test_{order.id[:12]}"
        
        # Update stock
        for item in order_data.items:
            await db.products.update_one(
                {"id": item.product_id},
                {"$inc": {"stock_quantity": -item.quantity}}
            )
        
        return {"success": True, "order": order_dict}
    except Exception as e:
        logging.error(f"Error creating order: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/orders")
async def get_orders(current_user: User = Depends(get_current_user), status: Optional[str] = None):
    query = {}
    
    if current_user.role in [UserRole.RETAILER, UserRole.CUSTOMER, UserRole.DELIVERY_AGENT]:
        query["user_id"] = current_user.id
    
    if status:
        query["order_status"] = status
    
    orders = await db.orders.find(query).sort("created_at", -1).to_list(100)
    # Remove MongoDB _id field for JSON serialization
    for order in orders:
        if "_id" in order:
            del order["_id"]
    return orders

@api_router.get("/orders/{order_id}")
async def get_order(order_id: str, current_user: User = Depends(get_current_user)):
    order = await db.orders.find_one({"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Check authorization
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN] and order["user_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Remove MongoDB _id field for JSON serialization
    if "_id" in order:
        del order["_id"]
    return order

@api_router.patch("/orders/{order_id}/status")
async def update_order_status(order_id: str, status: str, current_user: User = Depends(get_current_user)):
    await db.orders.update_one(
        {"id": order_id},
        {"$set": {"order_status": status, "updated_at": datetime.utcnow()}}
    )
    return {"success": True, "message": "Order status updated"}

# ==================== CREDIT ENDPOINTS ====================

@api_router.get("/credit/ledger")
async def get_credit_ledger(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.RETAILER:
        raise HTTPException(status_code=403, detail="Only for retailers")
    
    ledger = await db.credit_ledgers.find({"retailer_id": current_user.id}).sort("created_at", -1).to_list(100)
    return ledger

@api_router.get("/credit/balance")
async def get_credit_balance(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.RETAILER:
        raise HTTPException(status_code=403, detail="Only for retailers")
    
    retailer = await db.retailers.find_one({"user_id": current_user.id})
    if not retailer:
        raise HTTPException(status_code=404, detail="Retailer not found")
    
    # Get latest ledger entry for balance
    latest_entry = await db.credit_ledgers.find_one(
        {"retailer_id": current_user.id},
        sort=[("created_at", -1)]
    )
    
    balance = latest_entry["balance"] if latest_entry else 0
    
    return {
        "credit_limit": retailer["credit_limit"],
        "used_credit": retailer["credit_limit"] - balance,
        "available_credit": balance
    }

# ==================== ADMIN ENDPOINTS ====================

@api_router.get("/admin/dashboard")
async def get_admin_dashboard(current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    total_orders = await db.orders.count_documents({})
    total_users = await db.users.count_documents({})
    total_products = await db.products.count_documents({})
    pending_retailers = await db.retailers.count_documents({"status": RetailerStatus.PENDING})
    
    # Calculate total revenue
    pipeline = [
        {"$match": {"payment_status": "completed"}},
        {"$group": {"_id": None, "total": {"$sum": "$total_amount"}}}
    ]
    revenue_result = await db.orders.aggregate(pipeline).to_list(1)
    total_revenue = revenue_result[0]["total"] if revenue_result else 0
    
    return {
        "total_orders": total_orders,
        "total_users": total_users,
        "total_products": total_products,
        "pending_retailers": pending_retailers,
        "total_revenue": total_revenue
    }

@api_router.get("/admin/users")
async def get_all_users(current_user: User = Depends(get_current_user), role: Optional[str] = None):
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    query = {}
    if role:
        query["role"] = role
    
    users = await db.users.find(query).to_list(1000)
    return users

# ==================== SUPPORT ENDPOINTS ====================

@api_router.post("/support/tickets")
async def create_ticket(ticket: SupportTicket, current_user: User = Depends(get_current_user)):
    ticket_dict = ticket.dict()
    ticket_dict["user_id"] = current_user.id
    await db.support_tickets.insert_one(ticket_dict)
    return {"success": True, "ticket": ticket_dict}

@api_router.get("/support/tickets")
async def get_tickets(current_user: User = Depends(get_current_user)):
    query = {"user_id": current_user.id}
    
    if current_user.role in [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.SUPPORT_EXECUTIVE]:
        query = {}  # Admins see all tickets
    
    tickets = await db.support_tickets.find(query).sort("created_at", -1).to_list(100)
    return tickets

# ==================== UTILITY ENDPOINTS ====================

@api_router.get("/")
async def root():
    return {"message": "SOVEH API v1.0", "status": "running"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_db_client():
    """Create MongoDB indexes for performance"""
    try:
        await db.users.create_index("phone", unique=True)
        await db.users.create_index("token")
        await db.users.create_index("role")
        await db.products.create_index("category_id")
        await db.products.create_index("is_active")
        await db.products.create_index([("name", 1), ("description", 1)])
        await db.categories.create_index("is_active")
        await db.orders.create_index("user_id")
        await db.orders.create_index("order_status")
        await db.orders.create_index("created_at")
        await db.carts.create_index("user_id", unique=True)
        await db.otp_sessions.create_index("expires_at", expireAfterSeconds=0)
        await db.retailers.create_index("user_id", unique=True)
        await db.credit_ledgers.create_index("retailer_id")
        logger.info("MongoDB indexes created successfully")
    except Exception as e:
        logger.warning(f"Index creation warning: {e}")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
