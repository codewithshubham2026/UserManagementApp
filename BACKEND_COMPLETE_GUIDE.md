# Backend Project Complete Flow & Testing Guide

## Table of Contents
1. [Project Architecture Overview](#project-architecture-overview)
2. [File Structure & Logic Flow](#file-structure--logic-flow)
3. [Complete API Endpoints](#complete-api-endpoints)
4. [Postman Testing Guide](#postman-testing-guide)
5. [Error Scenarios & Success Responses](#error-scenarios--success-responses)

---

## Project Architecture Overview

### Technology Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **AI Integration**: Google Gemini AI / OpenAI ChatGPT

### Architecture Pattern
- **MVC-like Pattern**: Controllers → Services → Models
- **Middleware Chain**: Request → Validation → Authentication → Authorization → Controller → Service → Response
- **Error Handling**: Centralized error handler middleware

---

## File Structure & Logic Flow

### 1. Entry Point: `src/server.js`
**Purpose**: Application bootstrap and route mounting

**Logic Flow**:
```
1. Load environment variables
2. Connect to MongoDB database
3. Setup Express app with middleware:
   - CORS configuration
   - JSON body parser
4. Mount route handlers:
   - /api/auth → Authentication routes
   - /api/users → User management routes (admin only)
   - /api/ai → AI chat routes (admin only)
5. Setup error handler middleware
6. Start server on configured port
```

**Key Dependencies**:
- `config/db.js` - Database connection
- `config/env.js` - Environment configuration
- `routes/*` - Route definitions
- `middlewares/errorHandler.js` - Error handling

---

### 2. Configuration Files

#### `src/config/env.js`
**Purpose**: Centralized environment variable management

**Logic**:
- Loads `.env` file using dotenv
- Provides default values for development
- Validates critical environment variables
- Exports configuration object

**Environment Variables**:
- `PORT` - Server port (default: 5000)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `CLIENT_ORIGIN` - Frontend URL for CORS
- `GEMINI_API_KEY` - Google Gemini API key (optional)
- `CHATGPT_API_KEY` - OpenAI API key (optional)
- `ADMIN_EMAIL` - Default admin email
- `ADMIN_PASSWORD` - Default admin password

#### `src/config/db.js`
**Purpose**: MongoDB connection and admin seeding

**Logic Flow**:
```
1. Connect to MongoDB using Mongoose
2. Handle connection errors (IP whitelist, network issues)
3. Seed default admin user if not exists
4. Return connection promise
```

**Dependencies**:
- `utils/seedAdmin.js` - Creates default admin user

---

### 3. Database Models

#### `src/models/User.js`
**Purpose**: User schema definition

**Schema Structure**:
```javascript
{
  name: String (required, trimmed)
  email: String (required, unique, lowercase, trimmed)
  password: String (required, hashed)
  role: String (enum: ['admin', 'user'], default: 'user')
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Logic**:
- Defines user data structure
- Enforces email uniqueness
- Default role is 'user'
- Automatic timestamps

---

### 4. Authentication Routes: `src/routes/authRoutes.js`

**Base Path**: `/api/auth`

**Endpoints**:
1. `POST /api/auth/register` - User registration
2. `POST /api/auth/login` - User login
3. `GET /api/auth/me` - Get current user profile

**Middleware Chain**:
- Register: `registerValidator` → `validateRequest` → `register` controller
- Login: `loginValidator` → `validateRequest` → `login` controller
- Me: `authenticate` → `me` controller

---

### 5. Authentication Controllers: `src/controllers/authController.js`

#### `register(req, res, next)`
**Logic Flow**:
```
1. Extract { name, email, password } from req.body
2. Call authService.registerUser()
3. Return 201 status with user data and token
4. Handle errors via next(error)
```

#### `login(req, res, next)`
**Logic Flow**:
```
1. Extract { email, password } from req.body
2. Call authService.loginUser()
3. Return 200 status with user data and token
4. Handle errors via next(error)
```

#### `me(req, res)`
**Logic Flow**:
```
1. Extract user from req.user (set by auth middleware)
2. Sanitize user (remove password)
3. Return 200 status with user data
```

---

### 6. Authentication Services: `src/services/authService.js`

#### `registerUser({ name, email, password })`
**Logic Flow**:
```
1. Check if email already exists in database
   → If exists: throw error (400)
2. Hash password using bcrypt (10 rounds)
3. Create user with role='user'
4. Generate JWT token
5. Sanitize user (remove password)
6. Return { user, token }
```

#### `loginUser({ email, password })`
**Logic Flow**:
```
1. Find user by email
   → If not found: throw error (401)
2. Compare provided password with hashed password
   → If mismatch: throw error (401)
3. Generate JWT token
4. Sanitize user (remove password)
5. Return { user, token }
```

#### `sanitizeUser(user)`
**Logic Flow**:
```
1. Extract only safe fields: id, name, email, role, createdAt, updatedAt
2. Convert _id to string
3. Return sanitized user object
```

---

### 7. User Management Routes: `src/routes/userRoutes.js`

**Base Path**: `/api/users`

**Endpoints**:
1. `GET /api/users` - Get all users (admin only)
2. `PATCH /api/users/:id/role` - Update user role (admin only)
3. `DELETE /api/users/:id` - Delete user (admin only)

**Middleware Chain**:
- All routes: `authenticate` → `authorizeRole('admin')` → validators → `validateRequest` → controllers

---

### 8. User Management Controllers: `src/controllers/userController.js`

#### `getAllUsers(req, res, next)`
**Logic Flow**:
```
1. Call userService.listUsers()
2. Return 200 status with users array
3. Handle errors via next(error)
```

#### `changeRole(req, res, next)`
**Logic Flow**:
```
1. Extract { id } from req.params
2. Extract { role } from req.body
3. Extract actingUserId from req.user
4. Call userService.updateUserRole(id, role, actingUserId)
5. Return 200 status with updated user
6. Handle errors via next(error)
```

#### `removeUser(req, res, next)`
**Logic Flow**:
```
1. Extract { id } from req.params
2. Extract actingUserId from req.user
3. Call userService.deleteUser(id, actingUserId)
4. Return 200 status with deletedId
5. Handle errors via next(error)
```

---

### 9. User Management Services: `src/services/userService.js`

#### `listUsers()`
**Logic Flow**:
```
1. Find all users excluding password field
2. Sort by createdAt (newest first)
3. Sanitize each user
4. Return array of sanitized users
```

#### `updateUserRole(userId, role, actingUserId)`
**Logic Flow**:
```
1. Check if userId === actingUserId
   → If same: throw error (400) - cannot change own role
2. Find user by userId
   → If not found: throw error (404)
3. Update user.role = role
4. Save user
5. Return sanitized user
```

#### `deleteUser(userId, actingUserId)`
**Logic Flow**:
```
1. Check if userId === actingUserId
   → If same: throw error (400) - cannot delete own account
2. Find user by userId
   → If not found: throw error (404)
3. Delete user from database
4. Return userId
```

---

### 10. AI Routes: `src/routes/aiRoutes.js`

**Base Path**: `/api/ai`

**Endpoints**:
1. `POST /api/ai/ask` - Ask AI question (admin only)

**Middleware Chain**:
- `authenticate` → `authorizeRole('admin')` → `askValidator` → `validateRequest` → `ask` controller

---

### 11. AI Controllers: `src/controllers/aiController.js`

#### `ask(req, res, next)`
**Logic Flow**:
```
1. Extract { prompt } from req.body
2. Validate prompt is not empty
   → If empty: return 400 error
3. Call aiService.askAi(prompt)
4. Return 200 status with answer
5. Handle errors via next(error)
```

---

### 12. AI Services: `src/services/aiService.js`

#### `askAi(prompt)`
**Logic Flow**:
```
1. Trim prompt
2. Check if GEMINI_API_KEY exists
   → If yes: Use Google Gemini API
   → If no: Check CHATGPT_API_KEY
     → If yes: Use OpenAI ChatGPT API
     → If no: Return demo response
3. Return AI response text
```

**AI Integration Priority**:
1. Google Gemini (if GEMINI_API_KEY is set)
2. OpenAI ChatGPT (if CHATGPT_API_KEY is set)
3. Demo response (if no API keys)

---

### 13. Middleware Files

#### `src/middlewares/authMiddleware.js`

**`authenticate(req, res, next)`**
**Logic Flow**:
```
1. Extract Authorization header
   → If missing or not "Bearer <token>": return 401
2. Extract token from "Bearer <token>"
3. Verify JWT token using JWT_SECRET
   → If invalid/expired: return 401
4. Find user by decoded.id
   → If not found: return 401
5. Attach user to req.user (without password)
6. Call next()
```

**`authorizeRole(role)`**
**Logic Flow**:
```
1. Returns middleware function
2. Check if req.user exists and req.user.role === role
   → If not: return 403 Forbidden
3. Call next()
```

#### `src/middlewares/validateRequest.js`
**Logic Flow**:
```
1. Collect validation errors from express-validator
2. If errors exist:
   - Log errors to console
   - Return 400 with first error message
3. If no errors: call next()
```

#### `src/middlewares/errorHandler.js`
**Logic Flow**:
```
1. Log error message and stack trace
2. Log request URL and method
3. Extract status code from error.status or default to 500
4. Return JSON response with success: false and error message
```

---

### 14. Validators

#### `src/validators/authValidators.js`

**`registerValidator`**:
- `name`: Required, trimmed, not empty
- `email`: Valid email format
- `password`: Minimum 6 characters

**`loginValidator`**:
- `email`: Valid email format
- `password`: Required, not empty

#### `src/validators/userValidators.js`

**`updateRoleValidator`**:
- `id` (param): Valid MongoDB ObjectId
- `role` (body): Must be 'admin' or 'user'

**`userIdParamValidator`**:
- `id` (param): Valid MongoDB ObjectId

#### `src/validators/aiValidators.js`

**`askValidator`**:
- `prompt`: Required, trimmed, not empty

---

### 15. Utility Files

#### `src/utils/generateToken.js`
**Logic Flow**:
```
1. Sign JWT token with:
   - Payload: { id: userId }
   - Secret: JWT_SECRET from env
   - Expiry: 2 hours
2. Return token string
```

#### `src/utils/seedAdmin.js`
**Logic Flow**:
```
1. Get admin credentials from env (or use defaults)
2. Check if admin user exists
   → If exists and role is admin: log and return
   → If exists but role is not admin: promote to admin
3. If not exists:
   - Hash password
   - Create admin user with role='admin'
4. Log admin credentials
```

---

## Complete API Endpoints

### Base URL
```
http://localhost:5000/api
```

### Health Check
- **Endpoint**: `GET /api/health`
- **Auth**: Not required
- **Response**: `{ success: true, message: 'API is healthy' }`

---

### Authentication Endpoints

#### 1. Register User
- **Method**: `POST`
- **Path**: `/api/auth/register`
- **Auth**: Not required
- **Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Success Response** (201):
  ```json
  {
    "success": true,
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

#### 2. Login User
- **Method**: `POST`
- **Path**: `/api/auth/login`
- **Auth**: Not required
- **Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Success Response** (200):
  ```json
  {
    "success": true,
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

#### 3. Get Current User (Me)
- **Method**: `GET`
- **Path**: `/api/auth/me`
- **Auth**: Required (Bearer token)
- **Headers**:
  ```
  Authorization: Bearer <token>
  ```
- **Success Response** (200):
  ```json
  {
    "success": true,
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

---

### User Management Endpoints (Admin Only)

#### 4. Get All Users
- **Method**: `GET`
- **Path**: `/api/users`
- **Auth**: Required (Admin only)
- **Headers**:
  ```
  Authorization: Bearer <admin_token>
  ```
- **Success Response** (200):
  ```json
  {
    "success": true,
    "users": [
      {
        "id": "507f1f77bcf86cd799439011",
        "name": "Admin User",
        "email": "admin@example.com",
        "role": "admin",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      },
      {
        "id": "507f1f77bcf86cd799439012",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "user",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
  ```

#### 5. Update User Role
- **Method**: `PATCH`
- **Path**: `/api/users/:id/role`
- **Auth**: Required (Admin only)
- **Headers**:
  ```
  Authorization: Bearer <admin_token>
  ```
- **Params**: `id` (MongoDB ObjectId)
- **Body**:
  ```json
  {
    "role": "admin"
  }
  ```
- **Success Response** (200):
  ```json
  {
    "success": true,
    "user": {
      "id": "507f1f77bcf86cd799439012",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "admin",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

#### 6. Delete User
- **Method**: `DELETE`
- **Path**: `/api/users/:id`
- **Auth**: Required (Admin only)
- **Headers**:
  ```
  Authorization: Bearer <admin_token>
  ```
- **Params**: `id` (MongoDB ObjectId)
- **Success Response** (200):
  ```json
  {
    "success": true,
    "deletedId": "507f1f77bcf86cd799439012"
  }
  ```

---

### AI Endpoints (Admin Only)

#### 7. Ask AI Question
- **Method**: `POST`
- **Path**: `/api/ai/ask`
- **Auth**: Required (Admin only)
- **Headers**:
  ```
  Authorization: Bearer <admin_token>
  ```
- **Body**:
  ```json
  {
    "prompt": "What is Node.js?"
  }
  ```
- **Success Response** (200):
  ```json
  {
    "success": true,
    "answer": "Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine..."
  }
  ```

---

## Postman Testing Guide

### Setup Instructions

1. **Import Environment Variables**:
   - Create a new environment in Postman
   - Add variables:
     - `base_url`: `http://localhost:5000/api`
     - `admin_token`: (will be set after login)
     - `user_token`: (will be set after login)
     - `user_id`: (will be set after registration)

2. **Create Collection**: "User Management API"

---

### Test Cases

#### Test 1: Health Check
- **Method**: `GET`
- **URL**: `{{base_url}}/health`
- **Expected**: 200 OK
- **Response**: `{ "success": true, "message": "API is healthy" }`

---

#### Test 2: Register User (Success)
- **Method**: `POST`
- **URL**: `{{base_url}}/auth/register`
- **Body** (raw JSON):
  ```json
  {
    "name": "Test User",
    "email": "testuser@example.com",
    "password": "password123"
  }
  ```
- **Expected**: 201 Created
- **Response**: User object with token
- **Action**: Save `token` to `user_token` variable
- **Action**: Save `user.id` to `user_id` variable

---

#### Test 3: Register User (Error - Duplicate Email)
- **Method**: `POST`
- **URL**: `{{base_url}}/auth/register`
- **Body** (raw JSON):
  ```json
  {
    "name": "Test User",
    "email": "testuser@example.com",
    "password": "password123"
  }
  ```
- **Expected**: 400 Bad Request
- **Response**:
  ```json
  {
    "success": false,
    "message": "Email already registered"
  }
  ```

---

#### Test 4: Register User (Error - Invalid Email)
- **Method**: `POST`
- **URL**: `{{base_url}}/auth/register`
- **Body** (raw JSON):
  ```json
  {
    "name": "Test User",
    "email": "invalid-email",
    "password": "password123"
  }
  ```
- **Expected**: 400 Bad Request
- **Response**:
  ```json
  {
    "success": false,
    "message": "Valid email is required",
    "errors": [...]
  }
  ```

---

#### Test 5: Register User (Error - Short Password)
- **Method**: `POST`
- **URL**: `{{base_url}}/auth/register`
- **Body** (raw JSON):
  ```json
  {
    "name": "Test User",
    "email": "test@example.com",
    "password": "12345"
  }
  ```
- **Expected**: 400 Bad Request
- **Response**:
  ```json
  {
    "success": false,
    "message": "Password should be at least 6 characters long",
    "errors": [...]
  }
  ```

---

#### Test 6: Login User (Success)
- **Method**: `POST`
- **URL**: `{{base_url}}/auth/login`
- **Body** (raw JSON):
  ```json
  {
    "email": "admin@example.com",
    "password": "admin123"
  }
  ```
- **Expected**: 200 OK
- **Response**: User object with token
- **Action**: Save `token` to `admin_token` variable (if admin)

---

#### Test 7: Login User (Error - Invalid Email)
- **Method**: `POST`
- **URL**: `{{base_url}}/auth/login`
- **Body** (raw JSON):
  ```json
  {
    "email": "nonexistent@example.com",
    "password": "password123"
  }
  ```
- **Expected**: 401 Unauthorized
- **Response**:
  ```json
  {
    "success": false,
    "message": "Invalid credentials"
  }
  ```

---

#### Test 8: Login User (Error - Wrong Password)
- **Method**: `POST`
- **URL**: `{{base_url}}/auth/login`
- **Body** (raw JSON):
  ```json
  {
    "email": "admin@example.com",
    "password": "wrongpassword"
  }
  ```
- **Expected**: 401 Unauthorized
- **Response**:
  ```json
  {
    "success": false,
    "message": "Invalid credentials"
  }
  ```

---

#### Test 9: Get Current User - Me (Success)
- **Method**: `GET`
- **URL**: `{{base_url}}/auth/me`
- **Headers**:
  ```
  Authorization: Bearer {{user_token}}
  ```
- **Expected**: 200 OK
- **Response**: Current user object

---

#### Test 10: Get Current User - Me (Error - No Token)
- **Method**: `GET`
- **URL**: `{{base_url}}/auth/me`
- **Headers**: (none)
- **Expected**: 401 Unauthorized
- **Response**:
  ```json
  {
    "success": false,
    "message": "Missing token"
  }
  ```

---

#### Test 11: Get Current User - Me (Error - Invalid Token)
- **Method**: `GET`
- **URL**: `{{base_url}}/auth/me`
- **Headers**:
  ```
  Authorization: Bearer invalid_token_here
  ```
- **Expected**: 401 Unauthorized
- **Response**:
  ```json
  {
    "success": false,
    "message": "Invalid or expired token"
  }
  ```

---

#### Test 12: Get All Users (Success - Admin)
- **Method**: `GET`
- **URL**: `{{base_url}}/users`
- **Headers**:
  ```
  Authorization: Bearer {{admin_token}}
  ```
- **Expected**: 200 OK
- **Response**: Array of all users

---

#### Test 13: Get All Users (Error - Not Admin)
- **Method**: `GET`
- **URL**: `{{base_url}}/users`
- **Headers**:
  ```
  Authorization: Bearer {{user_token}}
  ```
- **Expected**: 403 Forbidden
- **Response**:
  ```json
  {
    "success": false,
    "message": "Forbidden: insufficient role"
  }
  ```

---

#### Test 14: Get All Users (Error - No Token)
- **Method**: `GET`
- **URL**: `{{base_url}}/users`
- **Headers**: (none)
- **Expected**: 401 Unauthorized
- **Response**:
  ```json
  {
    "success": false,
    "message": "Missing token"
  }
  ```

---

#### Test 15: Update User Role (Success)
- **Method**: `PATCH`
- **URL**: `{{base_url}}/users/{{user_id}}/role`
- **Headers**:
  ```
  Authorization: Bearer {{admin_token}}
  ```
- **Body** (raw JSON):
  ```json
  {
    "role": "admin"
  }
  ```
- **Expected**: 200 OK
- **Response**: Updated user object

---

#### Test 16: Update User Role (Error - Invalid User ID)
- **Method**: `PATCH`
- **URL**: `{{base_url}}/users/invalid_id/role`
- **Headers**:
  ```
  Authorization: Bearer {{admin_token}}
  ```
- **Body** (raw JSON):
  ```json
  {
    "role": "admin"
  }
  ```
- **Expected**: 400 Bad Request
- **Response**:
  ```json
  {
    "success": false,
    "message": "Valid user id is required",
    "errors": [...]
  }
  ```

---

#### Test 17: Update User Role (Error - Invalid Role)
- **Method**: `PATCH`
- **URL**: `{{base_url}}/users/{{user_id}}/role`
- **Headers**:
  ```
  Authorization: Bearer {{admin_token}}
  ```
- **Body** (raw JSON):
  ```json
  {
    "role": "superadmin"
  }
  ```
- **Expected**: 400 Bad Request
- **Response**:
  ```json
  {
    "success": false,
    "message": "Role must be admin or user",
    "errors": [...]
  }
  ```

---

#### Test 18: Update User Role (Error - Change Own Role)
- **Method**: `PATCH`
- **URL**: `{{base_url}}/users/{{admin_user_id}}/role`
- **Headers**:
  ```
  Authorization: Bearer {{admin_token}}
  ```
- **Body** (raw JSON):
  ```json
  {
    "role": "user"
  }
  ```
- **Note**: Use the admin's own user ID
- **Expected**: 400 Bad Request
- **Response**:
  ```json
  {
    "success": false,
    "message": "Admins cannot change their own role here to avoid lockout."
  }
  ```

---

#### Test 19: Update User Role (Error - User Not Found)
- **Method**: `PATCH`
- **URL**: `{{base_url}}/users/507f1f77bcf86cd799439999/role`
- **Headers**:
  ```
  Authorization: Bearer {{admin_token}}
  ```
- **Body** (raw JSON):
  ```json
  {
    "role": "admin"
  }
  ```
- **Expected**: 404 Not Found
- **Response**:
  ```json
  {
    "success": false,
    "message": "User not found"
  }
  ```

---

#### Test 20: Delete User (Success)
- **Method**: `DELETE`
- **URL**: `{{base_url}}/users/{{user_id}}`
- **Headers**:
  ```
  Authorization: Bearer {{admin_token}}
  ```
- **Expected**: 200 OK
- **Response**:
  ```json
  {
    "success": true,
    "deletedId": "507f1f77bcf86cd799439012"
  }
  ```

---

#### Test 21: Delete User (Error - Delete Own Account)
- **Method**: `DELETE`
- **URL**: `{{base_url}}/users/{{admin_user_id}}`
- **Headers**:
  ```
  Authorization: Bearer {{admin_token}}
  ```
- **Note**: Use the admin's own user ID
- **Expected**: 400 Bad Request
- **Response**:
  ```json
  {
    "success": false,
    "message": "You cannot delete your own admin account."
  }
  ```

---

#### Test 22: Delete User (Error - User Not Found)
- **Method**: `DELETE`
- **URL**: `{{base_url}}/users/507f1f77bcf86cd799439999`
- **Headers**:
  ```
  Authorization: Bearer {{admin_token}}
  ```
- **Expected**: 404 Not Found
- **Response**:
  ```json
  {
    "success": false,
    "message": "User not found"
  }
  ```

---

#### Test 23: Delete User (Error - Not Admin)
- **Method**: `DELETE`
- **URL**: `{{base_url}}/users/{{user_id}}`
- **Headers**:
  ```
  Authorization: Bearer {{user_token}}
  ```
- **Expected**: 403 Forbidden
- **Response**:
  ```json
  {
    "success": false,
    "message": "Forbidden: insufficient role"
  }
  ```

---

#### Test 24: Ask AI Question (Success - Admin)
- **Method**: `POST`
- **URL**: `{{base_url}}/ai/ask`
- **Headers**:
  ```
  Authorization: Bearer {{admin_token}}
  ```
- **Body** (raw JSON):
  ```json
  {
    "prompt": "What is Node.js?"
  }
  ```
- **Expected**: 200 OK
- **Response**:
  ```json
  {
    "success": true,
    "answer": "Node.js is a JavaScript runtime..."
  }
  ```
- **Note**: If no API keys are set, returns demo response

---

#### Test 25: Ask AI Question (Error - Empty Prompt)
- **Method**: `POST`
- **URL**: `{{base_url}}/ai/ask`
- **Headers**:
  ```
  Authorization: Bearer {{admin_token}}
  ```
- **Body** (raw JSON):
  ```json
  {
    "prompt": ""
  }
  ```
- **Expected**: 400 Bad Request
- **Response**:
  ```json
  {
    "success": false,
    "message": "Prompt is required",
    "errors": [...]
  }
  ```

---

#### Test 26: Ask AI Question (Error - Not Admin)
- **Method**: `POST`
- **URL**: `{{base_url}}/ai/ask`
- **Headers**:
  ```
  Authorization: Bearer {{user_token}}
  ```
- **Body** (raw JSON):
  ```json
  {
    "prompt": "What is Node.js?"
  }
  ```
- **Expected**: 403 Forbidden
- **Response**:
  ```json
  {
    "success": false,
    "message": "Forbidden: insufficient role"
  }
  ```

---

#### Test 27: Ask AI Question (Error - No Token)
- **Method**: `POST`
- **URL**: `{{base_url}}/ai/ask`
- **Headers**: (none)
- **Body** (raw JSON):
  ```json
  {
    "prompt": "What is Node.js?"
  }
  ```
- **Expected**: 401 Unauthorized
- **Response**:
  ```json
  {
    "success": false,
    "message": "Missing token"
  }
  ```

---

## Error Scenarios & Success Responses

### HTTP Status Codes

| Status Code | Meaning | When Used |
|------------|---------|-----------|
| 200 | OK | Successful GET, PATCH, DELETE requests |
| 201 | Created | Successful POST (register) |
| 400 | Bad Request | Validation errors, business logic errors |
| 401 | Unauthorized | Missing/invalid token, wrong credentials |
| 403 | Forbidden | Insufficient role permissions |
| 404 | Not Found | Resource not found (user, route) |
| 500 | Internal Server Error | Server-side errors |

---

### Common Error Response Format

```json
{
  "success": false,
  "message": "Error message here"
}
```

**With Validation Errors**:
```json
{
  "success": false,
  "message": "First error message",
  "errors": [
    {
      "msg": "Error message",
      "param": "fieldName",
      "location": "body"
    }
  ]
}
```

---

### Success Response Format

```json
{
  "success": true,
  "data": { ... }
}
```

---

### Authentication Flow Diagram

```
1. Register/Login
   ↓
2. Receive JWT Token
   ↓
3. Include Token in Authorization Header
   ↓
4. Middleware Validates Token
   ↓
5. Middleware Checks Role (if required)
   ↓
6. Controller Processes Request
   ↓
7. Service Performs Business Logic
   ↓
8. Response Sent to Client
```

---

### Security Features

1. **Password Hashing**: bcryptjs with 10 salt rounds
2. **JWT Tokens**: 2-hour expiry, signed with secret
3. **Role-Based Access Control**: Admin vs User roles
4. **Input Validation**: express-validator on all inputs
5. **CORS Protection**: Configured for specific origin
6. **Error Sanitization**: No sensitive data in error messages

---

### Testing Checklist

- [ ] Health check endpoint
- [ ] User registration (success)
- [ ] User registration (duplicate email)
- [ ] User registration (validation errors)
- [ ] User login (success)
- [ ] User login (invalid credentials)
- [ ] Get current user (success)
- [ ] Get current user (no token)
- [ ] Get current user (invalid token)
- [ ] Get all users (admin success)
- [ ] Get all users (user forbidden)
- [ ] Update user role (success)
- [ ] Update user role (validation errors)
- [ ] Update user role (change own role error)
- [ ] Update user role (user not found)
- [ ] Delete user (success)
- [ ] Delete user (delete own account error)
- [ ] Delete user (user not found)
- [ ] Delete user (not admin)
- [ ] Ask AI (success)
- [ ] Ask AI (empty prompt)
- [ ] Ask AI (not admin)

---

## Quick Reference

### Default Admin Credentials
- **Email**: `admin@example.com`
- **Password**: `admin123`

### Base URL
```
http://localhost:5000/api
```

### Token Format
```
Authorization: Bearer <token>
```

### Common Headers
```
Content-Type: application/json
Authorization: Bearer <token>
```

---

## Notes

1. **Token Expiry**: JWT tokens expire after 2 hours. Re-login to get a new token.
2. **Admin Seeding**: Default admin is created automatically on server start.
3. **AI Integration**: Requires API keys in `.env` file for live responses.
4. **Database**: Uses MongoDB. Ensure MongoDB is running before starting server.
5. **Environment**: Copy `env.example` to `.env` and configure variables.

---

## File Creation Order (Development)

1. `config/env.js` - Environment configuration
2. `config/db.js` - Database connection
3. `models/User.js` - User schema
4. `utils/generateToken.js` - JWT token generation
5. `utils/seedAdmin.js` - Admin seeding
6. `validators/*.js` - Input validators
7. `middlewares/validateRequest.js` - Validation middleware
8. `middlewares/authMiddleware.js` - Authentication middleware
9. `middlewares/errorHandler.js` - Error handling
10. `services/authService.js` - Authentication business logic
11. `services/userService.js` - User management business logic
12. `services/aiService.js` - AI integration logic
13. `controllers/authController.js` - Authentication controllers
14. `controllers/userController.js` - User management controllers
15. `controllers/aiController.js` - AI controller
16. `routes/authRoutes.js` - Authentication routes
17. `routes/userRoutes.js` - User management routes
18. `routes/aiRoutes.js` - AI routes
19. `server.js` - Application entry point

---

## Deployment Guide: Render (Backend) + Vercel (Frontend)

This section provides step-by-step instructions to deploy your backend on Render and frontend on Vercel.

---

### Prerequisites

1. **GitHub Account**: Your code should be pushed to a GitHub repository
2. **MongoDB Atlas Account**: Free tier available at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
3. **Render Account**: Sign up at [render.com](https://render.com) (free tier available)
4. **Vercel Account**: Sign up at [vercel.com](https://vercel.com) (free tier available)

---

## Part 1: MongoDB Atlas Setup (Database)

### Step 1: Create MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or log in
3. Click **"Create"** or **"Build a Database"**
4. Choose **FREE (M0)** tier
5. Select a cloud provider and region (choose closest to your deployment)
6. Click **"Create Cluster"** (takes 3-5 minutes)

### Step 2: Create Database User

1. Go to **Database Access** (left sidebar)
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Enter username and password (save these!)
5. Set privileges to **"Atlas Admin"** or **"Read and write to any database"**
6. Click **"Add User"**

### Step 3: Whitelist IP Addresses

1. Go to **Network Access** (left sidebar)
2. Click **"Add IP Address"**
3. For development: Click **"Allow Access from Anywhere"** (adds `0.0.0.0/0`)
   - ⚠️ **Note**: For production, use specific IPs only
4. Click **"Confirm"**

### Step 4: Get Connection String

1. Go to **Database** (left sidebar)
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Copy the connection string
   - Format: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
5. Replace `<username>` and `<password>` with your database user credentials
6. Add database name at the end: `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/user_management?retryWrites=true&w=majority`
7. **Save this connection string** - you'll need it for Render

---

## Part 2: Deploy Backend on Render

### Step 1: Prepare Your Repository

1. Ensure your code is pushed to GitHub
2. Make sure `backend/` folder contains all necessary files
3. Verify `package.json` has a `start` script: `"start": "node src/server.js"`

### Step 2: Create New Web Service on Render

1. Log in to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account if not already connected
4. Select your repository
5. Configure the service:
   - **Name**: `user-management-backend` (or your preferred name)
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `backend` ⚠️ **Important!**
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid if you prefer)

### Step 3: Configure Environment Variables on Render

Click **"Environment"** tab and add these variables:

| Variable Name | Value | Description |
|--------------|-------|-------------|
| `PORT` | `10000` | Render assigns port automatically, but you can set this |
| `MONGO_URI` | `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/user_management?retryWrites=true&w=majority` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | `your-super-secret-jwt-key-change-this-in-production` | Strong random string (use a password generator) |
| `CLIENT_ORIGIN` | `https://your-frontend-app.vercel.app` | ⚠️ **Update after deploying frontend** |
| `ADMIN_EMAIL` | `admin@example.com` | Default admin email (optional) |
| `ADMIN_PASSWORD` | `admin123` | Default admin password (optional, change in production) |
| `ADMIN_NAME` | `Admin User` | Default admin name (optional) |
| `GEMINI_API_KEY` | `your-gemini-key` | Optional - for AI features |
| `CHATGPT_API_KEY` | `your-chatgpt-key` | Optional - for AI features |
| `NODE_ENV` | `production` | Set to production |

**Important Notes**:
- ⚠️ **CLIENT_ORIGIN**: Initially set to a placeholder. After deploying frontend on Vercel, come back and update this with your Vercel URL.
- 🔒 **JWT_SECRET**: Generate a strong random string (at least 32 characters). You can use: `openssl rand -base64 32` or an online generator.

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Render will start building and deploying
3. Wait for deployment to complete (usually 2-5 minutes)
4. Once deployed, you'll see a URL like: `https://user-management-backend.onrender.com`
5. **Copy this URL** - you'll need it for frontend configuration

### Step 5: Test Backend Deployment

1. Open: `https://your-backend-url.onrender.com/api/health`
2. You should see: `{ "success": true, "message": "API is healthy" }`
3. If you see an error, check Render logs for issues

### Step 6: Update CLIENT_ORIGIN (After Frontend Deployment)

1. Go back to Render dashboard
2. Navigate to your service → **Environment** tab
3. Update `CLIENT_ORIGIN` with your Vercel frontend URL:
   ```
   https://your-frontend-app.vercel.app
   ```
4. Click **"Save Changes"**
5. Render will automatically redeploy with new environment variable

---

## Part 3: Deploy Frontend on Vercel

### Step 1: Prepare Frontend

1. Ensure your code is pushed to GitHub
2. Make sure `frontend/` folder contains all necessary files
3. Verify `package.json` has a `build` script: `"build": "vite build"`

### Step 2: Create New Project on Vercel

1. Log in to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend` ⚠️ **Important!**
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
   - **Install Command**: `npm install`

### Step 3: Configure Environment Variables on Vercel

Before deploying, add environment variable:

1. In project settings, go to **"Environment Variables"**
2. Add:
   - **Name**: `VITE_API_BASE`
   - **Value**: `https://your-backend-url.onrender.com`
     - Replace `your-backend-url.onrender.com` with your actual Render backend URL
   - **Environment**: Select all (Production, Preview, Development)

**Example**:
```
VITE_API_BASE=https://user-management-backend.onrender.com
```

**Important**: 
- ⚠️ **No trailing slash** in the URL
- ⚠️ **Use HTTPS** (Render provides HTTPS by default)
- ⚠️ **Don't include `/api`** - the frontend code adds that automatically

### Step 4: Deploy

1. Click **"Deploy"**
2. Vercel will build and deploy your frontend
3. Wait for deployment to complete (usually 1-3 minutes)
4. Once deployed, you'll see a URL like: `https://your-frontend-app.vercel.app`
5. **Copy this URL**

### Step 5: Update Backend CLIENT_ORIGIN

1. Go back to Render dashboard
2. Navigate to your backend service → **Environment** tab
3. Update `CLIENT_ORIGIN` with your Vercel frontend URL:
   ```
   https://your-frontend-app.vercel.app
   ```
4. Click **"Save Changes"**
5. Wait for Render to redeploy (automatic)

### Step 6: Test Full Application

1. Open your Vercel frontend URL
2. Try registering a new user
3. Try logging in
4. If you're admin, test admin features
5. Check browser console for any errors

---

## Environment Variables Summary

### Backend (Render) Environment Variables

```env
PORT=10000
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/user_management?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
CLIENT_ORIGIN=https://your-frontend-app.vercel.app
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
ADMIN_NAME=Admin User
GEMINI_API_KEY=your-gemini-api-key-here
CHATGPT_API_KEY=your-chatgpt-api-key-here
NODE_ENV=production
```

### Frontend (Vercel) Environment Variables

```env
VITE_API_BASE=https://your-backend-url.onrender.com
```

**Important**: 
- Frontend variables must start with `VITE_` to be accessible in the code
- After adding variables, Vercel will automatically rebuild

---

## Common Deployment Issues & Solutions

### Issue 1: CORS Errors

**Symptoms**: Frontend can't connect to backend, CORS errors in console

**Solution**:
1. Check `CLIENT_ORIGIN` in Render matches your Vercel URL exactly
2. Ensure no trailing slash: `https://app.vercel.app` (not `https://app.vercel.app/`)
3. Ensure using HTTPS (not HTTP)
4. Redeploy backend after updating `CLIENT_ORIGIN`

### Issue 2: Backend Not Starting

**Symptoms**: Render shows "Deploy failed" or service won't start

**Solution**:
1. Check Render logs for error messages
2. Verify `MONGO_URI` is correct and includes database name
3. Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0` (or Render's IPs)
4. Check `package.json` has correct `start` script
5. Verify root directory is set to `backend` in Render settings

### Issue 3: Frontend Can't Connect to Backend

**Symptoms**: Network errors, "Cannot connect to server"

**Solution**:
1. Verify `VITE_API_BASE` in Vercel matches your Render backend URL
2. Test backend health endpoint: `https://your-backend.onrender.com/api/health`
3. Check backend is running (not sleeping - free tier sleeps after inactivity)
4. Ensure no trailing slash in `VITE_API_BASE`
5. Rebuild frontend after updating environment variables

### Issue 4: MongoDB Connection Failed

**Symptoms**: Backend logs show MongoDB connection errors

**Solution**:
1. Verify `MONGO_URI` format is correct
2. Check username and password are URL-encoded (replace special characters)
3. Verify database user has correct permissions
4. Check IP whitelist in MongoDB Atlas includes all IPs (`0.0.0.0/0`)
5. Ensure database name is included in connection string

### Issue 5: Environment Variables Not Working

**Symptoms**: Frontend still using localhost, backend using wrong values

**Solution**:
1. **Frontend**: Variables must start with `VITE_` prefix
2. **Backend**: Ensure variables are set in Render Environment tab
3. After updating variables, services need to rebuild:
   - **Vercel**: Automatic rebuild on variable change
   - **Render**: Click "Manual Deploy" → "Clear build cache & deploy"
4. Clear browser cache and hard refresh (Ctrl+Shift+R)

### Issue 6: Free Tier Limitations

**Render Free Tier**:
- Services sleep after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds (cold start)
- Solution: Use a paid plan or set up a ping service to keep it awake

**Vercel Free Tier**:
- Generous limits, usually no issues
- Automatic HTTPS
- Global CDN

---

## Step-by-Step Checklist

### Pre-Deployment
- [ ] Code pushed to GitHub
- [ ] MongoDB Atlas cluster created
- [ ] MongoDB database user created
- [ ] MongoDB IP whitelist configured
- [ ] MongoDB connection string ready
- [ ] Strong JWT_SECRET generated

### Backend Deployment (Render)
- [ ] Render account created
- [ ] New Web Service created
- [ ] Root directory set to `backend`
- [ ] Build command: `npm install`
- [ ] Start command: `npm start`
- [ ] All environment variables added
- [ ] Deployment successful
- [ ] Health check endpoint working
- [ ] Backend URL copied

### Frontend Deployment (Vercel)
- [ ] Vercel account created
- [ ] New project created
- [ ] Root directory set to `frontend`
- [ ] `VITE_API_BASE` environment variable added
- [ ] Deployment successful
- [ ] Frontend URL copied

### Post-Deployment
- [ ] Backend `CLIENT_ORIGIN` updated with Vercel URL
- [ ] Backend redeployed with new `CLIENT_ORIGIN`
- [ ] Frontend tested - registration works
- [ ] Frontend tested - login works
- [ ] Admin features tested (if applicable)
- [ ] No CORS errors in browser console
- [ ] All API calls working

---

## URL Configuration Flow

```
1. Deploy Backend on Render
   ↓
   Get: https://backend-name.onrender.com
   ↓
2. Deploy Frontend on Vercel
   ↓
   Get: https://frontend-name.vercel.app
   ↓
3. Update Backend CLIENT_ORIGIN
   CLIENT_ORIGIN=https://frontend-name.vercel.app
   ↓
4. Update Frontend VITE_API_BASE
   VITE_API_BASE=https://backend-name.onrender.com
   ↓
5. Test Application
```

---

## Production Best Practices

### Security
1. **JWT_SECRET**: Use a strong, random string (32+ characters)
2. **MongoDB Password**: Use a strong password
3. **Admin Password**: Change default admin password after first login
4. **IP Whitelist**: For production, restrict MongoDB Atlas to specific IPs
5. **HTTPS**: Always use HTTPS (both Render and Vercel provide this)

### Performance
1. **Database Indexing**: Add indexes for frequently queried fields
2. **Caching**: Consider adding Redis for session management
3. **CDN**: Vercel automatically provides CDN for frontend
4. **Monitoring**: Set up error tracking (e.g., Sentry)

### Monitoring
1. **Render Logs**: Monitor backend logs in Render dashboard
2. **Vercel Analytics**: Enable Vercel Analytics for frontend
3. **Health Checks**: Set up uptime monitoring for your API
4. **Error Tracking**: Integrate error tracking service

---

## Quick Reference: Environment Variables

### Backend (Render)
```bash
# Required
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
JWT_SECRET=your-secret-key-here
CLIENT_ORIGIN=https://your-frontend.vercel.app

# Optional
PORT=10000
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
GEMINI_API_KEY=your-key
CHATGPT_API_KEY=your-key
NODE_ENV=production
```

### Frontend (Vercel)
```bash
# Required
VITE_API_BASE=https://your-backend.onrender.com
```

---

## Testing After Deployment

### 1. Backend Health Check
```
GET https://your-backend.onrender.com/api/health
Expected: { "success": true, "message": "API is healthy" }
```

### 2. Frontend Connection Test
1. Open browser console
2. Navigate to your Vercel frontend URL
3. Check for any CORS or network errors
4. Try registering a new user

### 3. Full Flow Test
1. Register new user → Should work
2. Login → Should work
3. Access protected routes → Should work
4. Admin features (if admin) → Should work

---

## Troubleshooting Commands

### Check Backend Logs (Render)
1. Go to Render dashboard
2. Click on your service
3. Click "Logs" tab
4. Check for errors

### Check Frontend Logs (Vercel)
1. Go to Vercel dashboard
2. Click on your project
3. Click on deployment
4. Check "Build Logs" or "Function Logs"

### Test Backend Manually
```bash
# Health check
curl https://your-backend.onrender.com/api/health

# Test with Postman
# Use the deployed URL instead of localhost:5000
```

---

## Additional Resources

- **Render Documentation**: [render.com/docs](https://render.com/docs)
- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **MongoDB Atlas Documentation**: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- **Vite Environment Variables**: [vitejs.dev/guide/env-and-mode.html](https://vitejs.dev/guide/env-and-mode.html)

---

**End of Document**
