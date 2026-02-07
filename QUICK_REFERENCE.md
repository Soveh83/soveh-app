# SOVEH Project - Quick Reference Card

## 🔗 Important URLs
- **Live Preview:** https://soveh-retail-1.preview.emergentagent.com
- **API Base:** https://soveh-retail-1.preview.emergentagent.com/api

---

## 🔑 All Credentials At A Glance

### Test Login
| Role | Phone | OTP |
|------|-------|-----|
| Retailer | 9999999999 | Shown on screen |
| Admin | 9999999998 | Shown on screen |

### Admin Portal Codes
```
SOVEH001, SOVEH002, ADMIN123, SUPER001
```

### API Keys (Current)
```
Google Maps: AIzaSyDphHUTttoWlK2hqX-LsHSPGhxnF6xbqyw
Emergent LLM: sk-emergent-128D2900526054b383
MongoDB: mongodb://localhost:27017/test_database
```

---

## 📂 Project Locations

| Component | Path |
|-----------|------|
| Frontend (React) | `/app/frontend/` |
| Backend (FastAPI) | `/app/backend/` |
| Mobile (React Native) | `/app/mobile/soveh-mobile/` |
| Database Exports | `/app/exports/database/` |
| Docker Config | `/app/docker-compose.yml` |
| Setup Script | `/app/setup.sh` |
| Full Documentation | `/app/HANDOVER_DOCUMENT.md` |

---

## 🚀 Quick Commands

### Run Locally
```bash
# Frontend
cd /app/frontend && npm install && npm start

# Backend  
cd /app/backend && pip install -r requirements.txt && uvicorn server:app --port 8001

# Mobile
cd /app/mobile/soveh-mobile && npm install && npx expo start
```

### Docker Deploy
```bash
cd /app
docker-compose build
docker-compose up -d
```

### Build Android APK
```bash
cd /app/mobile/soveh-mobile
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

---

## 📊 Database Collections
- users (14 docs)
- products (10 docs)
- categories (4 docs)
- orders (5 docs)
- addresses (2 docs)

---

## ⚠️ Production Checklist
- [ ] Replace test OTP with real SMS provider
- [ ] Set up production MongoDB
- [ ] Configure real domain & SSL
- [ ] Backup Android keystore after first build
- [ ] Set up Firebase for push notifications
