# SREYANIMTI - Retail Supply Network PRD

## Project Overview
**Name:** SREYANIMTI  
**Type:** B2B + B2C Retail Supply Network Platform  
**Target Scale:** Enterprise-level (1M+ users)  
**Date:** February 7, 2026  

---

## User Personas

### 1. Retailer (Primary)
- Shop owners & wholesalers
- Browse product catalog with retailer pricing
- Place bulk orders with credit facility
- Track orders and manage credit

### 2. Customer (B2C)
- End consumers
- Browse products with customer pricing
- Place orders with home delivery
- Track order status

### 3. Delivery Agent
- Delivery partners
- View assigned deliveries
- Update delivery status
- OTP verification for delivery

### 4. Admin
- Operations team
- Analytics dashboard
- Retailer approvals
- Product & inventory management
- Order management

---

## Core Requirements

### Authentication
- [x] Phone-based OTP authentication
- [x] Role selection (Retailer/Customer/Delivery/Admin)
- [x] Test mode OTP display for development
- [x] Session persistence with JWT tokens

### Product Catalog
- [x] Categories: Groceries, Beverages, Snacks, Personal Care
- [x] 21+ products with:
  - MRP, Retailer Price, Customer Price
  - Margin percentage display
  - Stock quantity tracking
- [x] Search and category filtering

### Shopping Cart
- [x] Add/remove products
- [x] Quantity management
- [x] Real-time total calculation
- [x] Savings display
- [x] GST calculation (5%)
- [x] Delivery charges (Free above threshold)

### Order Management
- [x] Order placement
- [x] Order history
- [x] Status tracking (Placed → Confirmed → Packed → Out for Delivery → Delivered)
- [x] Delivery OTP verification

### Credit System
- [x] Credit limit display
- [x] Used/available credit
- [x] Credit ledger

### Admin Dashboard
- [x] Analytics: Orders, Users, Products, Revenue
- [x] Charts (Area, Bar) with Recharts
- [x] Retailer approval workflow
- [x] Products table management
- [x] Orders table management

---

## Technical Architecture

### Frontend (React)
- React 18 with React Router
- Zustand for state management
- Framer Motion for animations
- Tailwind CSS for styling
- Recharts for analytics charts
- React Hot Toast for notifications

### Backend (FastAPI)
- FastAPI with async/await
- MongoDB with Motor (async driver)
- JWT token authentication
- Razorpay integration (test mode)
- Twilio SMS service (test mode)

### Database (MongoDB)
Collections:
- users
- retailers
- customers
- products
- categories
- orders
- order_items
- payments
- credit_ledgers
- support_tickets
- otp_sessions

---

## What's Been Implemented

### Feb 7, 2026 - MVP Release
1. **Authentication System**
   - Role selection screen
   - OTP send/verify flow
   - Test OTP display for development

2. **Retailer Dashboard**
   - Home with stats and credit summary
   - Category browsing
   - Product grid with margin display
   - Add to cart functionality
   - Cart & checkout
   - Order history

3. **Customer Dashboard**
   - Green-themed UI
   - Product browsing
   - Shopping cart
   - Order placement

4. **Delivery Dashboard**
   - Orange-themed UI
   - Delivery list
   - Status updates

5. **Admin Dashboard**
   - Stats cards with growth indicators
   - Analytics charts
   - Retailers management
   - Products table
   - Orders table
   - Settings

6. **Backend APIs**
   - Auth: send-otp, verify-otp, get-me
   - Products: CRUD operations
   - Categories: list, create
   - Orders: create, list, update status
   - Credit: balance, ledger
   - Admin: dashboard, users, approvals

---

## Prioritized Backlog

### P0 - Critical (Next Sprint)
- [ ] Product images integration
- [ ] Full KYC flow with document upload
- [ ] Payment gateway integration (Razorpay live)
- [ ] Push notifications

### P1 - High Priority
- [ ] Price negotiation system
- [ ] Bulk order CSV upload
- [ ] Invoice PDF generation
- [ ] Return request flow
- [ ] Warehouse management

### P2 - Medium Priority
- [ ] AI product recommendations
- [ ] Voice search
- [ ] Multi-language support (Hindi, Bengali)
- [ ] Dark mode
- [ ] Loyalty points system

### P3 - Future Enhancements
- [ ] Live delivery tracking
- [ ] EMI options
- [ ] Partner brand portals
- [ ] Automated procurement

---

## Test Accounts

| Role | Phone | Notes |
|------|-------|-------|
| Retailer | 9999999999 | Primary test account |
| Customer | 1111111111 | B2C testing |
| Delivery | 2222222222 | Delivery agent |
| Admin | 3333333333 | Full access |

---

## API Endpoints Summary

```
Auth:
POST /api/auth/send-otp
POST /api/auth/verify-otp
GET  /api/auth/me

Products:
GET  /api/products
GET  /api/products/{id}
POST /api/products

Categories:
GET  /api/categories
POST /api/categories

Orders:
POST /api/orders
GET  /api/orders
GET  /api/orders/{id}
PATCH /api/orders/{id}/status

Credit:
GET  /api/credit/balance
GET  /api/credit/ledger

Admin:
GET  /api/admin/dashboard
GET  /api/admin/users
GET  /api/retailers/pending
POST /api/retailers/approve
```

---

## Next Tasks

1. Add product images from Unsplash/Pexels
2. Implement full KYC verification flow
3. Integrate Razorpay for live payments
4. Build price negotiation feature
5. Add WhatsApp notification integration
