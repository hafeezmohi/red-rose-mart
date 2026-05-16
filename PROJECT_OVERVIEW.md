# 🏪 Red Rose Mart - Complete Project Overview

**Last Updated**: 2026-05-16  
**Maintained By**: Muzzu8421

---

## 📋 Table of Contents

1. [Project Summary](#project-summary)
2. [Project Tree](#project-tree)
3. [Architecture & Flow](#architecture--flow)
4. [Technology Stack](#technology-stack)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)
7. [Key Features](#key-features)
8. [Running the Project](#running-the-project)
9. [Environment Setup](#environment-setup)
10. [Deployment & Security](#deployment--security)

---

## 📖 Project Summary

**Red Rose Mart** is a full-stack e-commerce platform with three main components:

- **Backend**: Express.js REST API with MongoDB and Google OAuth
- **User App**: React Native mobile application (Expo)
- **Admin Panel**: Next.js dashboard for admin management

The platform focuses on user authentication via Google OAuth, profile management, and a marketplace with role-based access control.

**Current Status**: 
- ✅ Backend authentication & core infrastructure complete
- 🟡 Product, Cart, Order routes scaffolded (logic pending)
- 🟡 Admin panel UI built (backend integration pending)

---

## 🗂️ Project Tree

```
red-rose-mart/
│
├── backend/                         # Express.js REST API (Port: 5000)
│   ├── src/
│   │   ├── config/
│   │   │   └── connectdb.js              # MongoDB connection setup
│   │   │
│   │   ├── controllers/
│   │   │   └── auth.controller.js        # Google OAuth & profile logic
│   │   │
│   │   ├── middleware/
│   │   │   └── auth.middleware.js        # JWT verification & role checks
│   │   │
│   │   ├── models/
│   │   │   ├── User.js                   # User schema (Google OAuth)
│   │   │   ├── Product.js                # Scaffolded (empty)
│   │   │   └── Order.js                  # Scaffolded (empty)
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.routes.js            # POST /api/auth/google, GET /me, PATCH /profile
│   │   │   ├── product.routes.js         # Product CRUD endpoints
│   │   │   ├── cart.routes.js            # Shopping cart endpoints
│   │   │   └── order.routes.js           # Order management endpoints
│   │   │
│   │   └── utils/
│   │       └── response.js               # Consistent JSON response helpers
│   │
│   ├── server.js                         # Express app entry point
│   ├── package.json                      # Dependencies & npm scripts
│   ├── CLAUDE.md                         # Detailed architecture documentation
│   └── .env.local                        # Environment variables (gitignored)
│
├── user-app/                            # React Native Mobile App (Expo)
│   ├── src/
│   │   ├── components/
│   │   │   └── BottomNav.jsx            # Navigation tabs
│   │   │
│   │   ├── context/
│   │   │   ├── CartContext.js           # Shopping cart state
│   │   │   ├── AddressContext.js        # Delivery address state
│   │   │   ├── FavoritesContext.js      # Wishlist state
│   │   │   └── OrdersContext.js         # Orders history state
│   │   │
│   │   ├── screens/
│   │   │   ├── SplashScreen.jsx         # App startup
│   │   │   ├── WelcomeScreen.jsx        # Onboarding
│   │   │   ├── LoginScreen.jsx          # Google OAuth login
│   │   │   ├── OTPScreen.jsx            # Phone verification (optional)
│   │   │   ├── HomeScreen.jsx           # Product listing
│   │   │   ├── ProductScreen.jsx        # Product details
│   │   │   ├── CartScreen.jsx           # Shopping cart
│   │   │   ├── WishlistScreen.jsx       # Favorites/Wishlist
│   │   │   ├── AddressScreen.jsx        # Delivery address
│   │   │   ├── ProfileScreen.jsx        # User profile
│   │   │   ├── EditProfileScreen.jsx    # Profile editing
│   │   │   ├── OrdersScreen.jsx         # Order history
│   │   │   └── SuccessScreen.jsx        # Order confirmation
│   │   │
│   │   ├── navigation/
│   │   │   └── AppNavigator.jsx         # React Navigation setup
│   │   │
│   │   ├── data/
│   │   │   └── products.js              # Mock product data
│   │   │
│   │   └── assets/images/               # App icons & images
│   │
│   ├── App.js                            # App entry point
│   ├── app.json                          # Expo configuration
│   ├── package.json                      # Expo & React Native dependencies
│   └── tsconfig.json                     # TypeScript config
│
├── admin-panel/                         # Next.js Admin Dashboard
│   ├── src/app/
│   │   ├── page.js                      # Dashboard home
│   │   ├── layout.js                    # Root layout & navigation
│   │   │
│   │   ├── components/
│   │   │   ├── Navbar.js                # Top navigation bar
│   │   │   └── Sidebar.js               # Side navigation menu
│   │   │
│   │   ├── login/
│   │   │   └── page.js                  # Admin login page
│   │   │
│   │   ├── products/
│   │   │   └── page.js                  # Product management (CRUD)
│   │   │
│   │   ├── orders/
│   │   │   └── page.js                  # Order management & tracking
│   │   │
│   │   ├── users/
│   │   │   └── page.js                  # User management
│   │   │
│   │   ├── analytics/
│   │   │   └── page.js                  # Charts & insights (Recharts)
│   │   │
│   │   ├── settings/
│   │   │   └── page.js                  # Admin settings
│   │   │
│   │   └── middleware.js                # Route protection middleware
│   │
│   ├── public/                           # Static assets
│   ├── package.json                      # Next.js & UI dependencies
│   └── README.md                         # Admin panel setup
│
└── frontend1/                           # Legacy frontend (deleted)
```

---

## 🏗️ Architecture & Flow

### **1. User Authentication Flow**

```
┌─────────────────┐
│  User (Mobile)  │
└────────┬────────┘
         │
         ▼
    [Google OAuth]
         │
         ▼
POST /api/auth/google
{idToken: "..."}
         │
         ▼
Backend Processing:
├─ Verify token with Google
├─ Extract: email, name, picture
├─ Find or Create user in MongoDB
└─ Generate JWT token
         │
         ▼
Response:
{
  "token": "jwt_token...",
  "user": {...},
  "isProfileComplete": false
}
         │
         ▼
Store token in AsyncStorage
         │
         ▼
✅ Authenticated User
```

### **2. User Profile Completion Flow**

```
GET /api/auth/me
(Bearer token)
         │
         ▼
protect middleware
├─ Extract Bearer token
├─ Verify JWT signature
├─ Fetch user from DB
└─ Attach to req.user
         │
         ▼
Return user data
         │
         ▼
PATCH /api/auth/profile
{phone: "+91..."}
         │
         ▼
Backend:
├─ Validate phone format
├─ Update user.phone
└─ Mark profile complete
         │
         ▼
✅ Profile Updated
```

### **3. Shopping & Ordering Flow**

```
User App (React Context)
         │
    ┌────┼────┬────┐
    │    │    │    │
    ▼    ▼    ▼    ▼
Browse Product Cart Wishlist
Products Search  Items  Items
    │    │    │    │
    └────┼────┴────┘
         │
    Store in Context
    (CartContext, etc)
         │
         ▼
Checkout:
├─ Select Address
├─ Review Cart
└─ Submit Order
         │
         ▼
POST /api/orders
{
  items: [...],
  address: {...},
  total: ...
}
         │
         ▼
Backend Processing:
├─ Verify user (JWT)
├─ Validate inventory
├─ Create Order in MongoDB
└─ Generate confirmation
         │
         ▼
✅ Order Created
   Order ID + Tracking
```

### **4. Admin Dashboard Flow**

```
┌─────────────────┐
│  Admin (Web)    │
└────────┬────────┘
         │
         ▼
/admin/login
(Email + Password)
         │
         ▼
Backend Auth
├─ Verify credentials
└─ Generate JWT
         │
         ▼
Next.js Dashboard
         │
    ┌────┼────┬────┬──────┐
    │    │    │    │      │
    ▼    ▼    ▼    ▼      ▼
Products Orders Users Analytics Settings
  CRUD   Track   Manage  Charts   Config
    │    │    │    │      │
    └────┼────┴────┴──────┘
         │
Backend API Calls:
├─ protect middleware (verify JWT)
├─ restrictTo('admin') (role check)
└─ MongoDB queries
         │
         ▼
✅ Admin Operations Complete
```

---

## 🛠️ Technology Stack

### **Backend**

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Express.js** | 5.2.1 | Web framework & REST API |
| **Mongoose** | 9.6.1 | MongoDB ODM & data modeling |
| **jsonwebtoken** | 9.0.3 | JWT generation & verification |
| **google-auth-library** | 10.6.2 | Google OAuth 2.0 verification |
| **dotenv** | 17.4.2 | Environment variable management |
| **Node.js** | 16+ | JavaScript runtime |
| **nodemon** | - | Development hot-reload |

### **Mobile App (User)**

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React Native** | 0.81.5 | Cross-platform mobile framework |
| **Expo** | ~54.0.33 | Managed React Native platform |
| **React** | 19.1.0 | UI library |
| **React Navigation** | 6.1.9 | App navigation & routing |
| **AsyncStorage** | 2.2.0 | Local data persistence |
| **React Native Web** | 0.21.0 | Web support |

### **Admin Panel**

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Next.js** | 16.2.6 | React framework & SSR |
| **React** | 19.2.4 | UI library |
| **React DOM** | 19.2.4 | DOM rendering |
| **Tailwind CSS** | 4 | Utility-first CSS framework |
| **Lucide React** | 1.16.0 | Icon library |
| **Recharts** | 3.8.1 | Chart & graph library |
| **React Hot Toast** | 2.6.0 | Toast notifications |
| **Next Themes** | 0.4.6 | Dark mode support |

### **Database**

| Technology | Purpose |
|-----------|---------|
| **MongoDB** | NoSQL database (cloud or local) |
| **MongoDB Atlas** | Cloud database hosting |

---

## 📊 Database Schema

### **User Model**

```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  googleId: String,
  avatar: String (URL),
  authProvider: String (enum: ['google']),
  role: String (enum: ['user', 'admin'], default: 'user'),
  phone: String,
  address: {
    street: String,
    city: String,
    pincode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

**Key Fields**:
- `email` - Unique user identifier
- `googleId` - Google account ID from OAuth
- `phone` - Indicates if profile is complete
- `address.coordinates` - For geolocation-based features
- `role` - For admin/user access control

### **Product Model** (Scaffolded)

```javascript
// To be implemented
{
  _id: ObjectId,
  name: String,
  description: String,
  price: Number,
  image: String,
  category: String,
  inventory: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### **Order Model** (Scaffolded)

```javascript
// To be implemented
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  items: [{
    productId: ObjectId,
    quantity: Number,
    price: Number
  }],
  address: Object,
  total: Number,
  status: String (enum: ['pending', 'shipped', 'delivered']),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔌 API Endpoints

### **Authentication Routes** (`/api/auth`)

#### `POST /api/auth/google`
**Purpose**: Google OAuth login  
**Access**: Public  
**Request Body**:
```json
{
  "idToken": "google_id_token_from_frontend"
}
```
**Response** (200):
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "avatar": "image_url",
    "role": "user"
  },
  "isProfileComplete": false
}
```
**Error** (400/401): Invalid or missing idToken

---

#### `GET /api/auth/me`
**Purpose**: Fetch current user profile  
**Access**: Private (requires Bearer token)  
**Headers**: `Authorization: Bearer <jwt_token>`  
**Response** (200): User object with profile completion status  
**Error** (401): Invalid/missing token

---

#### `PATCH /api/auth/profile`
**Purpose**: Update user profile  
**Access**: Private  
**Headers**: `Authorization: Bearer <jwt_token>`  
**Request Body**:
```json
{
  "phone": "+91 98765 43210"
}
```
**Response** (200): Updated user object  
**Error** (400): Invalid phone format

**Phone Validation**: `/^\+?[\d\s\-]{10,15}$/` (10-15 characters)

---

#### `POST /api/auth/dev-login`
**Purpose**: Development-only quick login  
**Access**: Public (only in development mode)  
**Response** (200): Test user with JWT token  
**Use Case**: Quick testing without Google OAuth setup

---

### **Product Routes** (`/api/products`)

- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (admin)
- `PATCH /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

*(Routes scaffolded, logic to be implemented)*

---

### **Cart Routes** (`/api/cart`)

- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add to cart
- `PATCH /api/cart/:id` - Update cart item
- `DELETE /api/cart/:id` - Remove from cart
- `DELETE /api/cart` - Clear cart

*(Routes scaffolded, logic to be implemented)*

---

### **Order Routes** (`/api/orders`)

- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get order details
- `POST /api/orders` - Create new order
- `PATCH /api/orders/:id` - Update order status (admin)

*(Routes scaffolded, logic to be implemented)*

---

## 🎯 Key Features

| Feature | Status | Details |
|---------|--------|---------|
| **Google OAuth** | ✅ Complete | idToken verification, auto user creation |
| **JWT Authentication** | ✅ Complete | Stateless token-based auth (7-day expiry) |
| **User Profiles** | ✅ Complete | Name, email, phone, address with coordinates |
| **Role-Based Access** | ✅ Ready | `restrictTo('admin')` middleware implemented |
| **Development Login** | ✅ Complete | Quick testing without OAuth |
| **Product Catalog** | 🟡 Scaffolded | Routes created, model & logic pending |
| **Shopping Cart** | 🟡 Scaffolded | Routes created, context state ready |
| **Orders** | 🟡 Scaffolded | Routes created, model & logic pending |
| **Admin Dashboard** | 🟡 Scaffolded | Next.js UI built, backend integration pending |
| **Analytics** | 🟡 Planned | Dashboard built, data aggregation pending |
| **Wishlist** | ✅ Ready | Context state prepared |
| **Address Management** | ✅ Ready | With geolocation support |

---

## 🚀 Running the Project

### **Prerequisites**

- Node.js 16+ installed
- npm/pnpm package manager
- MongoDB cluster (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- Google OAuth credentials ([Google Cloud Console](https://console.cloud.google.com/))

---

### **Backend Setup & Execution**

#### Installation
```bash
cd backend
npm install
```

#### Configuration
Create `.env.local` in the backend root:
```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/red-rose-mart
JWT_SECRET=your_secret_key_here_min_32_chars
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
NODE_ENV=development
```

#### Development
```bash
npm run dev
# Server runs on http://localhost:5000
# Auto-reload on file changes via nodemon
```

#### Production
```bash
npm start
# Single instance, no watch mode
```

#### Testing Endpoints
```bash
# Development login (quick test)
curl -X POST http://localhost:5000/api/auth/dev-login

# Check server status
curl http://localhost:5000/

# Console output should show:
# ✅ MongoDB connected
# ✅ Server running on port 5000
# ✅ Auth routes initialized
```

---

### **User App (Mobile) Setup & Execution**

#### Installation
```bash
cd user-app
npm install
```

#### Development
```bash
npm start
# Starts Expo dev server
```

#### Run on Specific Platform
```bash
npm run android      # Android emulator
npm run ios          # iOS simulator
npm run web          # Web browser preview
```

#### Testing
- Open Expo Go app on mobile device
- Scan QR code from terminal
- Test Google OAuth login
- Navigate through screens

---

### **Admin Panel Setup & Execution**

#### Installation
```bash
cd admin-panel
npm install
```

#### Development
```bash
npm run dev
# Runs on http://localhost:3000
# Hot-reload enabled
```

#### Production Build
```bash
npm run build
npm start
```

#### Access
```
Development: http://localhost:3000
Login: http://localhost:3000/login
```

---

## 🔐 Environment Setup

### **Backend .env.local**

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/red-rose-mart?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=super_secret_key_must_be_at_least_32_characters_long_for_HS256
JWT_EXPIRES_IN=7d

# Google OAuth Configuration
GOOGLE_CLIENT_ID=1234567890-abcdefghijklmnop.apps.googleusercontent.com

# Environment
NODE_ENV=development
```

### **Important Notes**

- `.env.local` is **gitignored** (never committed)
- Each environment needs its own `.env.local`
- `MONGODB_URI` must include database name
- `GOOGLE_CLIENT_ID` must match frontend configuration
- `JWT_EXPIRES_IN` can be: `7d`, `24h`, `1h`, etc.

---

## 🔒 Middleware & Authentication

### **protect Middleware**

Validates JWT token and attaches user to request:

```javascript
// Usage
router.get('/protected-route', protect, handler);

// Process
1. Extract Bearer token from Authorization header
2. Verify token signature using JWT_SECRET
3. Fetch user from MongoDB
4. Attach user object to req.user
5. Pass control to route handler
```

**Errors**:
- 401: No token provided
- 401: Token expired or invalid
- 401: User not found

---

### **restrictTo Middleware**

Role-based access control for admin routes:

```javascript
// Usage
router.delete('/admin/users/:id', protect, restrictTo('admin'), handler);

// Process
1. Check if user.role === 'admin'
2. Grant access if true
3. Return 403 Forbidden if false
```

---

## 📱 Frontend Integration Points

### **User App - API Calls**

```javascript
// Google OAuth
const response = await fetch('http://localhost:5000/api/auth/google', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ idToken })
});

// Get Profile
const profile = await fetch('http://localhost:5000/api/auth/me', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Update Profile
const updated = await fetch('http://localhost:5000/api/auth/profile', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ phone: '+91...' })
});
```

### **Admin Panel - API Calls**

```javascript
// Admin Dashboard - Fetch Orders
const orders = await fetch('http://localhost:5000/api/orders', {
  headers: { 'Authorization': `Bearer ${adminToken}` }
});

// Update Product
const updated = await fetch('http://localhost:5000/api/products/123', {
  method: 'PATCH',
  headers: { 'Authorization': `Bearer ${adminToken}` },
  body: JSON.stringify({ price: 499, stock: 50 })
});
```

---

## 🚨 Error Handling

### **Error Response Format**

```json
{
  "success": false,
  "message": "Error description"
}
```

### **HTTP Status Codes**

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | User profile fetched |
| 201 | Created | New order created |
| 400 | Bad Request | Missing/invalid fields |
| 401 | Unauthorized | Invalid/missing token |
| 403 | Forbidden | Insufficient permissions (not admin) |
| 404 | Not Found | Product doesn't exist |
| 500 | Server Error | Unhandled exception |

### **Common Error Scenarios**

**Missing Google idToken**
```json
{
  "success": false,
  "message": "idToken is required"
}
```

**Invalid Phone Format**
```json
{
  "success": false,
  "message": "Invalid phone format"
}
```

**Expired JWT Token**
```json
{
  "success": false,
  "message": "Token expired"
}
```

---

## 📈 Deployment & Security

### **Security Best Practices**

✅ **Use strong JWT_SECRET**
- Minimum 32 characters
- Use random alphanumeric + special characters
- Different secret per environment
- Never commit .env files

✅ **MongoDB Security**
- Use connection string authentication
- Enable IP whitelisting in MongoDB Atlas
- Use strong database passwords
- Enable MongoDB encryption at rest

✅ **Google OAuth Security**
- Restrict Client ID to specific origins
- Never expose Client ID in backend code
- Verify idToken server-side (not just frontend)
- Use HTTPS in production

✅ **API Security**
- Implement rate limiting (prevent brute force)
- Add request validation (express-validator)
- Use CORS with specific origins
- Add security headers (helmet.js)

✅ **Frontend Security**
- Store JWT in httpOnly cookies (not localStorage if possible)
- Use HTTPS for all communications
- Validate all user inputs
- Never expose API keys in frontend code

---

### **Scalability Considerations**

- **Stateless Design**: JWT allows horizontal scaling
- **Connection Pooling**: Mongoose default 10 connections
- **Database Indexing**: Add indexes on frequently queried fields (email, googleId)
- **Caching**: Consider Redis for session/cart data
- **Load Balancing**: Deploy multiple backend instances behind load balancer

---

### **Monitoring & Logging**

**Add to Production**:
- Logging service (Winston, Pino)
- Error tracking (Sentry, DataDog)
- Performance monitoring (New Relic, APM)
- Database monitoring (MongoDB Atlas alerts)
- API rate limiting

---

## 📝 Next Steps for Development

### **Phase 1: Complete Product System**
- [ ] Define Product model schema
- [ ] Implement Product CRUD endpoints
- [ ] Add product search & filtering
- [ ] Add product images/media support

### **Phase 2: Shopping Cart & Orders**
- [ ] Implement Cart endpoints
- [ ] Implement Order creation & tracking
- [ ] Add Order status management
- [ ] Implement order notifications

### **Phase 3: Payment Integration**
- [ ] Integrate Stripe or Razorpay
- [ ] Implement payment verification
- [ ] Add payment status tracking
- [ ] Handle refunds

### **Phase 4: Admin Features**
- [ ] Connect admin dashboard to backend
- [ ] Implement product management UI
- [ ] Add order management & tracking
- [ ] Build analytics dashboard
- [ ] Implement user management

### **Phase 5: Enhancement & Polish**
- [ ] Add input validation (express-validator)
- [ ] Implement rate limiting
- [ ] Add comprehensive error handling
- [ ] Write unit & integration tests
- [ ] Setup CI/CD pipeline
- [ ] Add push notifications
- [ ] Implement email notifications

### **Phase 6: Performance & Security**
- [ ] Add database indexing
- [ ] Implement caching strategy
- [ ] Setup monitoring & logging
- [ ] Security audit & penetration testing
- [ ] Load testing & optimization

---

## 📞 Support & Troubleshooting

### **Backend Won't Start**

**Error**: `Cannot find module 'express'`
```bash
# Solution
cd backend
npm install
```

**Error**: `MongoDB connection failed`
```bash
# Check:
1. MONGODB_URI is correct in .env.local
2. IP address is whitelisted in MongoDB Atlas
3. Database user has correct permissions
4. Credentials are URL-encoded if needed
```

**Error**: `JWT verification failed`
```bash
# Check:
1. JWT_SECRET matches between generation & verification
2. Token hasn't expired (check JWT_EXPIRES_IN)
3. Authorization header format: Bearer <token>
```

### **Mobile App Won't Connect**

**Issue**: Cannot reach backend from mobile
```bash
# Solution:
1. Ensure backend is running: npm run dev
2. Update API URL to your machine's IP (not localhost)
3. Check firewall allows port 5000
4. Verify same network connection
```

### **Admin Panel Issues**

**Error**: `Port 3000 already in use`
```bash
# Solution
npm run dev -- -p 3001  # Run on different port
```

---

## 📄 File Structure Summary

```
Essential Files:

Backend:
- server.js → Express app entry
- src/config/connectdb.js → DB connection
- src/controllers/auth.controller.js → Auth logic
- src/routes/auth.routes.js → Auth endpoints
- src/middleware/auth.middleware.js → JWT verification

User App:
- App.js → React Native entry
- src/navigation/AppNavigator.jsx → Navigation setup
- src/context/* → Global state management
- src/screens/* → App pages

Admin:
- src/app/page.js → Dashboard home
- src/app/layout.js → Root layout
- src/app/components/* → UI components
```

---

## 📚 Documentation References

- Backend Details: `backend/CLAUDE.md`
- Admin Panel: `admin-panel/README.md`
- Express.js: https://expressjs.com/
- Mongoose: https://mongoosejs.com/
- React Native: https://reactnative.dev/
- Next.js: https://nextjs.org/
- Google OAuth: https://developers.google.com/identity/protocols/oauth2

---

**🎉 Red Rose Mart is ready for development!**

For questions or updates, refer to the CLAUDE.md files in each module.
