# Enhanced Pydantic models for SREYANIMTI/SOVEH system
from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

# Enums for status tracking
class KYCStatus(str, Enum):
    PENDING = "pending"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    RESUBMISSION_REQUIRED = "resubmission_required"

class RetailerTier(str, Enum):
    BRONZE = "bronze"
    SILVER = "silver"
    GOLD = "gold"
    PLATINUM = "platinum"

class OrderStatus(str, Enum):
    PLACED = "placed"
    CONFIRMED = "confirmed"
    PACKED = "packed"
    DISPATCHED = "dispatched"
    OUT_FOR_DELIVERY = "out_for_delivery"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    RETURNED = "returned"
    RETURN_REQUESTED = "return_requested"

class PaymentMethod(str, Enum):
    COD = "cod"
    UPI = "upi"
    CARD = "card"
    NETBANKING = "netbanking"
    WALLET = "wallet"
    CREDIT = "credit"

# Enhanced Retailer Models
class RetailerKYC(BaseModel):
    trade_license: Optional[str] = None  # base64 or URL
    shop_photo: Optional[str] = None
    gst_certificate: Optional[str] = None
    aadhaar: Optional[str] = None
    business_certificate: Optional[str] = None
    owner_photo: Optional[str] = None
    verification_selfie: Optional[str] = None

class RetailerProfile(BaseModel):
    user_id: str
    shop_name: str
    owner_name: str
    phone: str
    email: Optional[str] = None
    shop_address: str
    pincode: str
    city: str
    state: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    business_type: Optional[str] = None
    gst_number: Optional[str] = None
    kyc_documents: RetailerKYC = Field(default_factory=RetailerKYC)
    kyc_status: KYCStatus = KYCStatus.PENDING
    kyc_rejection_reason: Optional[str] = None
    tier: RetailerTier = RetailerTier.BRONZE
    trust_score: int = 0
    credit_limit: float = 0.0
    credit_used: float = 0.0
    total_orders: int = 0
    total_purchases: float = 0.0
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Enhanced Product Models
class ProductVariant(BaseModel):
    variant_id: str
    name: str
    pack_size: str
    unit: str
    mrp: float
    retailer_price: float
    margin_percent: float
    stock_quantity: int
    moq: int = 1

class Product(BaseModel):
    product_id: str
    name: str
    brand: str
    category_id: str
    subcategory_id: Optional[str] = None
    description: str
    images: List[str] = []  # base64 or URLs
    hsn_code: Optional[str] = None
    gst_rate: float = 0.0
    variants: List[ProductVariant] = []
    tags: List[str] = []  # "hot_selling", "best_margin", etc.
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Cart Models
class CartItem(BaseModel):
    product_id: str
    variant_id: str
    quantity: int
    price: float
    negotiated_price: Optional[float] = None

class Cart(BaseModel):
    user_id: str
    items: List[CartItem] = []
    subtotal: float = 0.0
    savings: float = 0.0
    delivery_fee: float = 0.0
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# Order Models
class DeliveryAddress(BaseModel):
    name: str
    phone: str
    address: str
    landmark: Optional[str] = None
    pincode: str
    city: str
    state: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class OrderItem(BaseModel):
    product_id: str
    product_name: str
    variant_id: str
    variant_name: str
    quantity: int
    unit_price: float
    total_price: float
    hsn_code: Optional[str] = None
    gst_rate: float = 0.0

class Order(BaseModel):
    order_id: str
    order_number: str
    user_id: str
    retailer_info: Dict[str, Any]
    items: List[OrderItem]
    subtotal: float
    gst_amount: float
    delivery_fee: float
    discount: float = 0.0
    total_amount: float
    payment_method: PaymentMethod
    payment_status: str = "pending"
    order_status: OrderStatus = OrderStatus.PLACED
    delivery_address: DeliveryAddress
    delivery_slot: Optional[str] = None
    delivery_otp: Optional[str] = None
    assigned_warehouse: Optional[str] = None
    assigned_delivery_agent: Optional[str] = None
    delivery_notes: Optional[str] = None
    invoice_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# Notification Models
class Notification(BaseModel):
    notification_id: str
    user_id: str
    title: str
    message: str
    type: str  # order, offer, credit, account, security, delivery
    action_url: Optional[str] = None
    is_read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Credit Models
class CreditTransaction(BaseModel):
    transaction_id: str
    user_id: str
    amount: float
    transaction_type: str  # credit_purchase, payment, penalty, adjustment
    order_id: Optional[str] = None
    balance_after: float
    description: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Analytics Models
class DashboardStats(BaseModel):
    total_orders: int = 0
    total_revenue: float = 0.0
    pending_kyc: int = 0
    active_retailers: int = 0
    total_products: int = 0
    low_stock_products: int = 0
    delivery_success_rate: float = 0.0
    average_order_value: float = 0.0

