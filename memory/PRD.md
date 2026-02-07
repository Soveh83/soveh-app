# SOVEH - Enterprise B2B Retail Supply Network

## Final Version - Production Ready
**Last Updated:** February 7, 2026

---

## Overview
SOVEH is a comprehensive B2B retail supply network application connecting retailers with wholesalers, featuring AI-powered recommendations, real-time delivery tracking, and a robust admin management system.

## User Roles
| Role | Description | Access |
|------|-------------|--------|
| **Retailer** | Shop owners & wholesalers | Browse products, place orders, track deliveries, view AI recommendations |
| **Delivery Agent** | Delivery partners | View assignments, update delivery status, GPS tracking |
| **Admin** | Operations team (Employee code required) | Full system access - products, orders, retailers, delivery agents, employees |

*Note: Customer role has been removed - focus is on B2B operations*

---

## Tech Stack
- **Frontend:** React 18, Tailwind CSS, Framer Motion, Google Maps
- **Backend:** FastAPI, Python 3.11
- **Database:** MongoDB
- **AI:** OpenAI GPT-4o (via Emergent LLM Key)
- **Real-time:** WebSocket for live delivery tracking

---

## Completed Features

### Authentication
- [x] OTP-based phone authentication
- [x] Multi-role support (Retailer, Delivery, Admin)
- [x] Session management with JWT tokens
- [x] Admin employee code verification gate

### Retailer Dashboard
- [x] AI-powered product recommendations (formatted display)
- [x] Product browsing with category filters
- [x] Shopping cart with real-time updates
- [x] Order placement and tracking
- [x] Order status progress visualization
- [x] Live GPS delivery tracking (WebSocket)
- [x] iOS 26-style glassmorphism navigation
- [x] **Auto-fetch current location on load**
- [x] AI chatbot for support

### Profile & Settings
- [x] Edit Profile (name, email, shop name, GST, business type)
- [x] Manage Addresses with Google Maps integration
- [x] Credit Details view
- [x] Shop Analytics dashboard

### KYC Verification (Updated)
**Mandatory Documents:**
- [x] Shop Photo
- [x] Owner Live Photo (Camera capture)
- [x] Aadhaar Card

**Optional Documents:**
- [x] PAN Card
- [x] Trade License

### Admin Portal
- [x] Employee code authentication (SOVEH001, SOVEH002, ADMIN123, SUPER001)
- [x] Dashboard with stats and charts
- [x] **Product management (Add/Edit/Delete) - FULLY FUNCTIONAL**
- [x] Category management
- [x] Order management with status updates
- [x] Delivery agent assignment
- [x] Retailer approval workflow
- [x] **Employee Management (Add/Block/Unblock/Remove)**
- [x] Analytics overview

---

## API Endpoints

### Authentication
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/send-otp` | POST | Send OTP |
| `/api/auth/verify-otp` | POST | Verify & login |

### Profile & Address
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/profile` | GET/PUT | User profile |
| `/api/addresses` | GET/POST/PUT/DELETE | Address CRUD |
| `/api/addresses/{id}/set-default` | POST | Set default address |

### Products
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/products` | GET | List products |
| `/api/products` | POST | Create product (admin) |
| `/api/products/{id}` | PUT | **Update product (admin)** |
| `/api/products/{id}` | DELETE | **Delete product (admin)** |

### Orders
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/orders` | GET/POST | Orders CRUD |
| `/api/orders/{id}/status` | PATCH | Update order status |
| `/api/orders/{id}/assign-agent` | POST | Assign delivery agent |

### Other
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/categories` | GET/POST | Categories |
| `/api/ai/recommendations` | POST | AI recommendations |
| `/api/ai/chat` | POST | AI chatbot |
| `/api/analytics/retailer` | GET | Shop analytics |
| `/api/refunds/request` | POST | Request refund |
| `/api/delivery-agents` | GET/POST | Delivery agents |
| `/ws/tracking/{order_id}` | WebSocket | Live tracking |

---

## Test Credentials
```
Retailer Phone: 9999999999
Admin Phone: 9999999998
Admin Employee Codes: SOVEH001, SOVEH002, ADMIN123, SUPER001
OTP: Displayed on screen after sending (Test OTP: XXXXXX)
```

---

## Database Schema

### users
```json
{
  "id": "uuid",
  "phone": "string",
  "role": "retailer|delivery_agent|admin",
  "name": "string",
  "email": "string",
  "shop_name": "string",
  "gst": "string",
  "business_type": "retail|wholesale|distributor|manufacturer",
  "is_active": true,
  "token": "string"
}
```

### products
```json
{
  "id": "uuid",
  "name": "string",
  "description": "string",
  "category_id": "uuid",
  "mrp": "float",
  "retailer_price": "float",
  "customer_price": "float",
  "margin_percent": "float",
  "stock_quantity": "int",
  "images": ["url"]
}
```

### orders
```json
{
  "id": "uuid",
  "order_number": "string",
  "user_id": "uuid",
  "items": [{"product_id", "quantity", "price"}],
  "total_amount": "float",
  "order_status": "placed|confirmed|packed|out_for_delivery|delivered|cancelled",
  "assigned_delivery_agent": "uuid"
}
```

---

## Recent Fixes (February 7, 2026)

1. **Admin Edit Products** - Now fully functional with modal showing pre-filled product data
2. **Admin Delete Products** - Working with confirmation dialog
3. **Employee Management** - New tab with Add/Block/Unblock/Remove functionality
4. **Auto Location** - Improved geolocation with better error handling and toast notifications
5. **KYC Documents** - Updated requirements:
   - Mandatory: Shop Photo, Owner Live Photo, Aadhaar Card
   - Optional: PAN Card, Trade License

---

## Known Limitations (SIMULATED)
- **Live GPS Tracking:** WebSocket provides simulated movement
- **Push Notifications:** Service created but not fully integrated
- **Delivery Agents:** Admin panel shows mock agents

---

## Future Enhancements (Backlog)
- [ ] Real delivery partner mobile app for GPS tracking
- [ ] Push notification triggers from backend events
- [ ] Payment gateway integration (Razorpay configured)
- [ ] Invoice generation and download
- [ ] Multi-language support
- [ ] Dark mode theme
