# SOVEH Mobile App - React Native

## Project Structure
```
soveh-mobile/
├── App.js                    # Main entry point
├── app.json                  # Expo configuration
├── eas.json                  # EAS Build configuration
├── src/
│   ├── screens/
│   │   ├── auth/
│   │   │   └── AuthScreen.js      # Login with OTP & Biometric
│   │   └── retailer/
│   │       ├── HomeScreen.js      # Dashboard with AI recommendations
│   │       ├── ShopScreen.js      # Product browsing
│   │       ├── CartScreen.js      # Shopping cart
│   │       ├── OrdersScreen.js    # Order history
│   │       └── ProfileScreen.js   # User profile & settings
│   ├── navigation/
│   │   └── index.js              # React Navigation setup
│   ├── store/
│   │   └── index.js              # Zustand state management
│   └── lib/
│       ├── config.js             # App configuration & colors
│       └── api.js                # API client (Axios)
```

## Features Implemented
- ✅ OTP-based authentication
- ✅ Biometric login (Fingerprint/Face ID)
- ✅ Push notifications
- ✅ Product browsing with categories
- ✅ Shopping cart
- ✅ Order management
- ✅ AI-powered recommendations
- ✅ Profile management
- ✅ Address management
- ✅ Auto location detection

## Build Instructions

### Prerequisites
1. Install EAS CLI: `npm install -g eas-cli`
2. Login to Expo: `eas login`

### Build Android APK
```bash
cd soveh-mobile
eas build -p android --profile preview
```

### Build for Production
```bash
eas build -p android --profile production
```

### Local Development
```bash
npx expo start
```

## API Configuration
The app connects to: `https://repo-bridge-38.preview.emergentagent.com/api`

## Test Credentials
- Phone: 9999999999
- OTP: Displayed on screen after sending

## Dependencies
- expo ~50.0.0
- react-navigation/native
- react-navigation/bottom-tabs
- expo-local-authentication (Biometric)
- expo-notifications (Push)
- expo-location
- expo-camera
- zustand (State management)
- axios (HTTP client)
