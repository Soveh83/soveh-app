# SOVEH - Complete Project Handover Document
**Date:** February 7, 2026  
**Project:** SOVEH B2B Retail Supply Network  
**Version:** 1.0.0

---

## 📁 1. PROJECT STRUCTURE & SOURCE CODE

### Web Application (React + FastAPI)
```
/app/
├── frontend/                    # React Web App
│   ├── src/
│   │   ├── components/         # UI Components
│   │   │   ├── admin/          # Admin Dashboard
│   │   │   ├── auth/           # Authentication
│   │   │   ├── kyc/            # KYC Upload
│   │   │   ├── profile/        # Profile Pages
│   │   │   ├── retailer/       # Retailer Dashboard
│   │   │   ├── tracking/       # Live Tracking
│   │   │   └── ui/             # Shadcn UI Components
│   │   ├── store/              # Zustand State Management
│   │   ├── lib/                # API Client & Utilities
│   │   ├── App.js              # Main App Component
│   │   └── index.css           # Global Styles
│   ├── public/                 # Static Assets
│   ├── package.json            # Dependencies
│   └── .env                    # Environment Variables
│
├── backend/                     # FastAPI Backend
│   ├── server.py               # Main API Server
│   ├── ai_service.py           # AI Integration (GPT-4o)
│   ├── kyc_routes.py           # KYC Endpoints
│   ├── websocket_handler.py    # Live Tracking WebSocket
│   ├── email_service.py        # Email Notifications
│   ├── sms_service.py          # SMS/OTP Service
│   ├── admin_auth.py           # Admin Authentication
│   ├── requirements.txt        # Python Dependencies
│   └── .env                    # Environment Variables
│
└── mobile/                      # React Native App
    └── soveh-mobile/
        ├── App.js              # Main Entry
        ├── src/
        │   ├── screens/        # All Screens
        │   ├── navigation/     # Navigation Config
        │   ├── store/          # State Management
        │   └── lib/            # API & Config
        ├── app.json            # Expo Config
        └── eas.json            # Build Config
```

---

## 🔐 2. CREDENTIALS & API KEYS

### Frontend Environment (`/app/frontend/.env`)
```env
REACT_APP_BACKEND_URL=https://repo-bridge-38.preview.emergentagent.com
WDS_SOCKET_PORT=443
ENABLE_HEALTH_CHECK=false
REACT_APP_GOOGLE_MAPS_KEY=AIzaSyDphHUTttoWlK2hqX-LsHSPGhxnF6xbqyw
```

### Backend Environment (`/app/backend/.env`)
```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="test_database"
CORS_ORIGINS="*"
EMERGENT_LLM_KEY=sk-emergent-128D2900526054b383
```

### API Keys Summary
| Service | Key/Config | Status |
|---------|-----------|--------|
| **MongoDB** | `mongodb://localhost:27017` | Active (Local) |
| **Google Maps** | `AIzaSyDphHUTttoWlK2hqX-LsHSPGhxnF6xbqyw` | Active |
| **OpenAI (GPT-4o)** | Via Emergent LLM Key | Active |
| **Razorpay** | Not configured (placeholder in code) | Inactive |
| **Firebase** | Not configured | Not used |
| **SMS/OTP** | Mock implementation (OTP shown on screen) | Test Mode |

---

## 🗄️ 3. DATABASE DETAILS

### MongoDB Configuration
- **Host:** `localhost:27017`
- **Database Name:** `test_database`
- **Connection String:** `mongodb://localhost:27017`

### Collections & Schema

#### `users`
```json
{
  "id": "uuid",
  "phone": "string (10 digits)",
  "role": "retailer | delivery_agent | admin | super_admin",
  "name": "string (optional)",
  "email": "string (optional)",
  "shop_name": "string (optional)",
  "gst": "string (optional)",
  "business_type": "retail | wholesale | distributor | manufacturer",
  "is_active": true,
  "token": "jwt_token",
  "created_at": "datetime"
}
```

#### `products`
```json
{
  "id": "prod_xxx",
  "name": "string",
  "description": "string",
  "category_id": "cat_xxx",
  "mrp": "float",
  "retailer_price": "float",
  "customer_price": "float",
  "margin_percent": "float",
  "stock_quantity": "int",
  "images": ["url_array"],
  "is_active": true
}
```

#### `categories`
```json
{
  "id": "cat_xxx",
  "name": "string",
  "description": "string",
  "image": "url",
  "is_active": true
}
```

#### `orders`
```json
{
  "id": "uuid",
  "order_number": "ORD-XXXXXX",
  "user_id": "uuid",
  "items": [
    {
      "product_id": "string",
      "product_name": "string",
      "quantity": "int",
      "price": "float",
      "total": "float"
    }
  ],
  "subtotal": "float",
  "gst_amount": "float",
  "delivery_charges": "float",
  "total_amount": "float",
  "order_status": "placed | confirmed | packed | out_for_delivery | delivered | cancelled",
  "delivery_address": "object",
  "assigned_delivery_agent": "uuid (optional)",
  "created_at": "datetime"
}
```

#### `addresses`
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "type": "shop | warehouse | home",
  "name": "string",
  "address": "string",
  "pincode": "string",
  "city": "string",
  "state": "string",
  "lat": "float",
  "lng": "float",
  "is_default": true
}
```

### Current Data
| Collection | Count |
|------------|-------|
| users | 14 |
| products | 10 |
| categories | 4 |
| orders | 5 |
| addresses | 2 |

---

## 👤 4. TEST CREDENTIALS

### User Access
| Role | Phone | Password/OTP |
|------|-------|--------------|
| Retailer | 9999999999 | OTP shown on screen |
| Admin | 9999999998 | OTP shown on screen |
| Delivery | Any number | OTP shown on screen |

### Admin Portal Access
**Employee Codes (stored in localStorage):**
- `SOVEH001` - Super Admin
- `SOVEH002` - Admin User
- `ADMIN123` - Operations Admin
- `SUPER001` - CEO Access

---

## 🚀 5. DEPLOYMENT & HOSTING

### Current Deployment
- **Platform:** Emergent Preview Environment
- **URL:** `https://repo-bridge-38.preview.emergentagent.com`
- **Backend Port:** 8001 (internal), routed via `/api` prefix
- **Frontend Port:** 3000

### Running Locally

#### Frontend
```bash
cd /app/frontend
npm install
npm start
# Runs on http://localhost:3000
```

#### Backend
```bash
cd /app/backend
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
# Runs on http://localhost:8001
```

#### Mobile App
```bash
cd /app/mobile/soveh-mobile
npm install
npx expo start
# Scan QR with Expo Go app
```

### Docker Deployment (Recommended for Production)
```dockerfile
# Frontend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build
CMD ["npx", "serve", "-s", "build", "-l", "3000"]

# Backend Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY backend/requirements.txt ./
RUN pip install -r requirements.txt
COPY backend/ ./
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]
```

---

## 📱 6. MOBILE APP BUILD (Android)

### Build APK using EAS Build
```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo account
eas login

# Navigate to mobile project
cd /app/mobile/soveh-mobile

# Build Preview APK
eas build -p android --profile preview

# Build Production APK
eas build -p android --profile production
```

### Android Keystore
⚠️ **IMPORTANT:** When you build with EAS for the first time:
1. EAS will generate a keystore automatically
2. **Download and backup the keystore** from Expo dashboard
3. Store it securely - you'll need it for future updates

### To Get Existing Keystore
```bash
eas credentials
# Select Android > Download keystore
```

### Manual Keystore Generation (if needed)
```bash
keytool -genkeypair -v -storetype PKCS12 \
  -keystore soveh-release.keystore \
  -alias soveh-key \
  -keyalg RSA -keysize 2048 \
  -validity 10000 \
  -storepass YOUR_PASSWORD \
  -keypass YOUR_PASSWORD
```

---

## 🍎 7. iOS BUILD (Future)

### Requirements
1. Apple Developer Account ($99/year)
2. Mac computer with Xcode
3. App Store Connect access

### EAS Build for iOS
```bash
eas build -p ios --profile production
```

### Required Certificates
- Distribution Certificate
- Provisioning Profile
- Push Notification Certificate

---

## 📋 8. API ENDPOINTS REFERENCE

### Authentication
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/send-otp` | POST | Send OTP `{phone}` |
| `/api/auth/verify-otp` | POST | Verify `{phone, otp, role}` |

### Products
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/products` | GET | List products |
| `/api/products` | POST | Create (admin) |
| `/api/products/{id}` | PUT | Update (admin) |
| `/api/products/{id}` | DELETE | Delete (admin) |

### Orders
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/orders` | GET | List user orders |
| `/api/orders` | POST | Create order |
| `/api/orders/{id}/status` | PATCH | Update status |

### Profile
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/profile` | GET | Get profile |
| `/api/profile` | PUT | Update profile |
| `/api/addresses` | GET/POST/PUT/DELETE | Address CRUD |

### AI
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ai/recommendations` | POST | Get AI recommendations |
| `/api/ai/chat` | POST | AI chatbot |

---

## 📦 9. DEPENDENCIES

### Frontend (package.json)
- react: ^18.x
- react-router-dom: ^6.x
- axios: ^1.8.x
- zustand: ^5.x
- framer-motion: ^12.x
- tailwindcss: ^3.x
- @react-google-maps/api: ^2.x
- recharts: ^2.x

### Backend (requirements.txt)
- fastapi
- uvicorn
- motor (MongoDB async driver)
- pydantic
- python-jose (JWT)
- emergentintegrations (AI)

### Mobile (package.json)
- expo: ~50.x
- react-native
- @react-navigation/native
- expo-local-authentication
- expo-notifications
- zustand

---

## 🔧 10. COMMON OPERATIONS

### Add New Product (via API)
```bash
curl -X POST "$API_URL/api/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Product",
    "category_id": "cat_1",
    "mrp": 100,
    "retailer_price": 90,
    "customer_price": 95,
    "stock_quantity": 100
  }'
```

### Add New Category
```bash
curl -X POST "$API_URL/api/categories" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "New Category", "description": "Description"}'
```

### MongoDB Direct Access
```bash
# Connect to MongoDB
mongosh

# Select database
use test_database

# View users
db.users.find().pretty()

# View products
db.products.find().pretty()
```

---

## ⚠️ 11. IMPORTANT NOTES

### Test Mode Features
1. **OTP is shown on screen** - In production, integrate real SMS provider (MSG91, Twilio)
2. **Employee codes stored in localStorage** - Move to database in production
3. **WebSocket delivery tracking is simulated** - Need real delivery app for GPS

### Production Checklist
- [ ] Configure real SMS provider for OTP
- [ ] Set up production MongoDB (Atlas/self-hosted)
- [ ] Secure all API keys in environment variables
- [ ] Enable HTTPS
- [ ] Set up proper CORS origins
- [ ] Configure push notification service (Firebase)
- [ ] Generate and backup Android keystore
- [ ] Set up CI/CD pipeline

---

## 📞 SUPPORT

For any questions regarding this handover, please contact the development team.

**Preview URL:** https://repo-bridge-38.preview.emergentagent.com  
**Repository Location:** `/app/` (frontend, backend, mobile)
