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
| **Admin** | Operations team (Employee code required) | Full system access - products, orders, retailers, delivery agents |

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
- [x] AI chatbot for support

### Profile & Settings
- [x] Edit Profile (name, email, shop name, GST, business type)
- [x] Manage Addresses with Google Maps integration
- [x] Credit Details view
- [x] Shop Analytics dashboard

### Admin Portal
- [x] Employee code authentication (SOVEH001, SOVEH002, ADMIN123, SUPER001)
- [x] Dashboard with stats and charts
- [x] Product management (Add/Edit/Delete)
- [x] Category management
- [x] Order management with status updates
- [x] Delivery agent assignment
- [x] Retailer approval workflow
- [x] Analytics overview

### APIs Implemented
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/send-otp` | POST | Send OTP |
| `/api/auth/verify-otp` | POST | Verify & login |
| `/api/profile` | GET/PUT | User profile |
| `/api/addresses` | GET/POST/PUT/DELETE | Address CRUD |
| `/api/addresses/{id}/set-default` | POST | Set default address |
| `/api/products` | GET/POST | Products |
| `/api/categories` | GET/POST | Categories |
| `/api/orders` | GET/POST | Orders |
| `/api/orders/{id}/status` | PATCH | Update order status |
| `/api/orders/{id}/assign-agent` | POST | Assign delivery agent |
| `/api/ai/recommendations` | POST | AI recommendations |
| `/api/ai/chat` | POST | AI chatbot |
| `/api/analytics/retailer` | GET | Shop analytics |
| `/api/refunds/request` | POST | Request refund |
| `/api/refunds` | GET | List refunds |
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
  "token": "string",
  "created_at": "datetime"
}
```

### addresses
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "type": "shop|warehouse|home",
  "name": "string",
  "address": "string",
  "pincode": "string",
  "lat": "float",
  "lng": "float",
  "is_default": true
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
  "delivery_address": {},
  "assigned_delivery_agent": "uuid"
}
```

---

## Deployment Notes

### Environment Variables Required
**Backend (.env):**
- `MONGO_URL` - MongoDB connection string
- `EMERGENT_LLM_KEY` - AI API key

**Frontend (.env):**
- `REACT_APP_BACKEND_URL` - Backend API URL
- `REACT_APP_GOOGLE_MAPS_KEY` - Google Maps API key

### Notes for Production
1. WebSocket delivery tracking uses simulation mode if real GPS data unavailable
2. Admin portal requires employee code verification before access
3. OTP is shown in response for testing (remove in production)
4. Delivery agents in admin panel use mock data (connect to real delivery app for production)

---

## Known Limitations (SIMULATED)
- **Live GPS Tracking:** WebSocket provides simulated movement; real implementation needs a delivery partner mobile app
- **Push Notifications:** Service worker created but not fully integrated with backend events
- **Delivery Agents:** Admin panel shows mock agents; real agents need to be added through the delivery partner app

---

## Future Enhancements (Backlog)
- [ ] Real delivery partner mobile app for GPS tracking
- [ ] Push notification triggers from backend events
- [ ] Payment gateway integration (Razorpay configured but inactive)
- [ ] Invoice generation and download
- [ ] Multi-language support
- [ ] Dark mode theme
