# Red Rose Mart - Backend Documentation

## Project Overview
Red Rose Mart is an e-commerce backend API built with Express.js and MongoDB. The project is focused on user authentication (Google OAuth), profile management, and foundational models for products and orders. The backend is designed to support a marketplace application with role-based access control.

**Current Status**: Initial project structure with authentication system implemented. Product and Order models are scaffolded but not yet implemented.

**Live Port**: 5000

## Technology Stack

### Core Dependencies
- **Express.js** (^5.2.1) - Web framework for REST API
- **Mongoose** (^9.6.1) - MongoDB ODM for data modeling and queries
- **jsonwebtoken** (^9.0.3) - JWT token generation and verification
- **google-auth-library** (^10.6.2) - Google OAuth 2.0 authentication
- **dotenv** (^17.4.2) - Environment variable management

### Development
- **Node.js** with **nodemon** for hot-reloading (scripts: `npm run dev`)
- **pnpm** - Package manager (seen in pnpm-lock.yaml)
- **ES modules** (type: "module" in package.json)

## Project Structure
```
backend/
├── src/
│   ├── config/
│   │   └── connectdb.js          # MongoDB connection logic
│   ├── controllers/
│   │   └── auth.controller.js    # Authentication logic (Google OAuth, profile)
│   ├── middleware/
│   │   └── auth.middleware.js    # JWT verification & role-based access
│   ├── models/
│   │   ├── User.js               # User schema with Google auth fields
│   │   ├── Product.js            # Scaffolded (empty)
│   │   └── Order.js              # Scaffolded (empty)
│   ├── routes/
│   │   └── auth.routes.js        # Auth endpoints + dev login
│   └── utils/
│       └── response.js           # Helper functions for JSON responses
├── server.js                     # Express app entry point
├── .env.local                    # Environment variables (gitignored)
└── package.json                  # Dependencies & scripts
```

## Database Schema

### User Model
**Collection**: `users`
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  googleId: String,
  avatar: String (profile picture URL),
  authProvider: String (enum: ['google'], default: 'google'),
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
- `email` - Unique identifier for users
- `googleId` - Google account ID from OAuth
- `role` - For future admin/user distinction
- `phone` - Profile completion indicator (used in `isProfileComplete`)
- `address` - Full address with coordinates for location-based features

### Product Model
**Status**: Scaffolded (empty file)
**Collection**: `products` (planned)

### Order Model
**Status**: Scaffolded (empty file)
**Collection**: `orders` (planned)

## API Endpoints

### Authentication Routes (`/api/auth`)

#### 1. Google OAuth Login
- **Route**: `POST /api/auth/google`
- **Access**: Public
- **Request Body**:
  ```json
  { "idToken": "google_id_token_from_frontend" }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "token": "jwt_token",
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
- **Logic**:
  1. Verify idToken with Google OAuth2 client
  2. Extract email, name, picture from Google payload
  3. Create user if doesn't exist, update if exists
  4. Generate and return JWT token
- **Error Handling**: Returns 400 for missing idToken, 401 for invalid/expired tokens

#### 2. Get Current User Profile
- **Route**: `GET /api/auth/me`
- **Access**: Private (requires Bearer token)
- **Request Headers**: `Authorization: Bearer <jwt_token>`
- **Response**: Returns user object with profile completion status
- **Middleware**: `protect` - Validates JWT and attaches user to req.user

#### 3. Update User Profile
- **Route**: `PATCH /api/auth/profile`
- **Access**: Private (requires Bearer token)
- **Request Body**:
  ```json
  { "phone": "+91 98765 43210" }
  ```
- **Response**: Updated user object
- **Validation**:
  - Phone format: `/^\+?[\d\s\-]{10,15}$/` (10-15 alphanumeric with optional +)
  - Returns 400 if phone invalid or missing

#### 4. Development Login (Development Only)
- **Route**: `POST /api/auth/dev-login`
- **Access**: Public (only when `NODE_ENV === "development"`)
- **Response**: Creates or fetches test user and returns JWT token
- **Purpose**: Quick testing without Google OAuth setup

## Middleware

### `protect` (auth.middleware.js)
- **Purpose**: Verify JWT token and attach user to request
- **Process**:
  1. Extract Bearer token from `Authorization` header
  2. Verify token signature using JWT_SECRET
  3. Fetch user from database by decoded user ID
  4. Attach user object to `req.user` for route handlers
- **Errors**:
  - 401 if no token provided
  - 401 if token expired
  - 401 if token invalid or user doesn't exist

### `restrictTo(...roles)` (auth.middleware.js)
- **Purpose**: Role-based access control for admin routes
- **Usage**: `router.get('/admin-route', protect, restrictTo('admin'), handler)`
- **Status**: Implemented but not yet used in routes

## Environment Variables

**File**: `.env.local` (root of backend directory)

Required variables:
```
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/database
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
NODE_ENV=development|production
```

**Notes**:
- `.env.local` is gitignored (never committed)
- JWT_EXPIRES_IN should match token generation expiry
- GOOGLE_CLIENT_ID must match frontend configuration

## Running the Project

### Prerequisites
- Node.js 16+ installed
- pnpm package manager
- MongoDB cluster (local or Atlas)

### Installation
```bash
pnpm install
```

### Development Mode
```bash
npm run dev
# Runs with nodemon for auto-reload on file changes
```

### Production Mode
```bash
npm start
# Runs single instance without watch mode
```

### Server Output
- Console logs route initialization (auth routes registered)
- MongoDB connection status printed on startup
- Listens on `http://localhost:5000`

## Key Architectural Decisions

### 1. Google OAuth Only
- Currently only Google OAuth is implemented (authProvider enum: ['google'])
- Future: Add support for other providers (Facebook, GitHub, etc.)
- Reasoning: Social auth simplifies onboarding and profile management

### 2. Token-Based Authentication
- JWT tokens used for stateless authentication
- No session storage required
- Frontend stores token in localStorage/cookies

### 3. Role-Based Access Control
- Users have roles: 'user' or 'admin'
- `restrictTo` middleware enables future route protection
- Admin routes not yet implemented but infrastructure ready

### 4. Unified Response Format
- All responses follow consistent structure: `{ success, message, data }`
- Standardized error handling via `sendError`/`sendSuccess` utilities

### 5. Profile Completion Flag
- `isProfileComplete` derived from phone field presence
- Indicates if user has completed onboarding flow
- No mandatory fields post-registration except phone

### 6. Address with Coordinates
- Address structure includes lat/lng for location-based features
- Prepared for geospatial queries (distance calculations, maps integration)

## Future Features (Scaffolded)

### Products
- Model structure: Not yet defined
- Endpoints: To be implemented
- Features: Catalog, search, filtering, inventory

### Orders
- Model structure: Not yet defined
- Endpoints: To be implemented
- Features: Order creation, tracking, payment integration

### Admin Routes
- Infrastructure ready (restrictTo middleware exists)
- Endpoints: To be implemented
- Features: User management, product management, order analytics

## Error Handling

### Error Response Format
```json
{
  "success": false,
  "message": "Error description"
}
```

### HTTP Status Codes
- **200** - Success
- **400** - Bad request (missing fields, validation failed)
- **401** - Unauthorized (invalid/missing token, expired token)
- **403** - Forbidden (insufficient permissions)
- **500** - Server error (caught and passed to error handler)

### Error Handling Flow
- Try-catch in controllers catches errors
- Pass errors to `next(err)` for centralized handling
- Specific errors return early with `sendError`

## Testing

### Current Status
- No test suite configured (scripts.test: "Error: no test specified")
- Manual testing via API client (Postman, Insomnia, cURL)

### Testing Endpoints
1. Dev Login: `POST http://localhost:5000/api/auth/dev-login`
2. Get Profile: `GET http://localhost:5000/api/auth/me` (needs token)
3. Update Profile: `PATCH http://localhost:5000/api/auth/profile` (needs token)

## Deployment Considerations

### Security
- JWT_SECRET must be strong and unique per environment
- Google Client ID must be restricted to specific origins
- Always use HTTPS in production
- Sanitize user input (currently basic phone validation)

### Scalability
- Mongoose connection pooling (default 10 connections)
- Stateless design allows horizontal scaling
- Consider indexing on email, googleId for faster lookups

### Monitoring
- Add logging service (Winston, Pino) for production
- Monitor MongoDB connection health
- Track JWT validation errors
- Set up error tracking (Sentry, DataDog)

## Common Issues & Solutions

### MongoDB Connection Fails
- Check MONGODB_URI is correct and network access enabled
- Verify IP address whitelisted in MongoDB Atlas
- Check NODE_ENV and .env.local loading

### Token Validation Fails
- Verify JWT_SECRET matches between generation and verification
- Check token expiry time
- Ensure Authorization header format: `Bearer <token>`

### Google OAuth Fails
- Verify GOOGLE_CLIENT_ID matches frontend configuration
- Ensure idToken is sent from frontend (not access_token)
- Check Google Console for API enablement

## Code Patterns & Conventions

- **Async/Await**: Used throughout for cleaner error handling
- **ES Modules**: Using import/export syntax
- **Route Controllers**: Business logic separated in controllers directory
- **Middleware Chain**: Route protection via middleware stacking
- **Error Passing**: Errors passed to next() for centralized handling
- **Response Utilities**: Consistent response formatting via helper functions

## Next Steps for Development

1. Implement Product model and routes (CRUD operations)
2. Implement Order model and routes (Order creation, tracking)
3. Add admin routes with restrictTo middleware
4. Implement payment integration (Stripe, Razorpay)
5. Add input validation middleware (express-validator)
6. Add comprehensive error handling middleware
7. Set up logging system for debugging
8. Write unit and integration tests
9. Add rate limiting for auth endpoints
10. Implement refresh token rotation

---

**Last Updated**: 2026-05-13
**Version**: 1.0.0 (Initial Structure)
**Maintained By**: Muzzu8421
