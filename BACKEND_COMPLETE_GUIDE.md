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

**End of Document**
