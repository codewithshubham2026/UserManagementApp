# 🎥 Complete Video-Style Project Explanation
## MERN Stack User Management System - Full Walkthrough

---

## 📹 Introduction: What We're Building

Welcome! Today we're going to understand a complete MERN stack application - a User Management System. This is a production-ready application with authentication, authorization, and role-based access control.

**What this app does:**
- Users can register and login
- Users have roles: Admin or Regular User
- Admins can manage users (view, change roles, delete)
- Admins can use an AI chat feature
- Protected routes ensure only logged-in users access certain pages
- Admin-only features are secured on both frontend and backend

**The MERN Stack:**
- **M**ongoDB - Our database
- **E**xpress - Backend framework
- **R**eact - Frontend library
- **N**ode.js - JavaScript runtime

Let's dive in!

---

## 🎬 Part 1: Backend Architecture Overview

The backend is organized in a clean, professional structure:

```
backend/src/
├── server.js          # Entry point - starts the server
├── config/            # Configuration files
├── models/            # Database schemas
├── routes/            # API endpoints
├── controllers/       # Request handlers
├── services/          # Business logic
├── middlewares/       # Reusable functions
├── validators/        # Input validation
└── utils/             # Helper functions
```

This structure follows the **MVC (Model-View-Controller)** pattern with an added **Service Layer** for business logic.

---

## 🎬 Part 2: Backend Entry Point - server.js

Let's start with the heart of our backend - `server.js`. This is where everything begins.

### **Line 1-8: Imports**

```javascript
const express = require('express');
const cors = require('cors');
const connectDb = require('./config/db');
const env = require('./config/env');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const aiRoutes = require('./routes/aiRoutes');
const errorHandler = require('./middlewares/errorHandler');
```

**Explanation:**
- `express` - The web framework. Think of it as the foundation of our server.
- `cors` - Cross-Origin Resource Sharing. Allows our frontend (running on port 5173) to communicate with our backend (port 5000).
- `connectDb` - Function to connect to MongoDB database
- `env` - Environment variables (secrets, configuration)
- `authRoutes`, `userRoutes`, `aiRoutes` - Our route definitions
- `errorHandler` - Centralized error handling

### **Line 10: Create Express App**

```javascript
const app = express();
```

**What this does:**
- Creates an Express application instance
- `app` is our server - it will handle all HTTP requests
- Think of it as a restaurant that's ready to serve customers

### **Line 13: CORS Middleware**

```javascript
app.use(cors({ origin: env.clientOrigin }));
```

**Why we need this:**
- Browsers have a security feature called "Same-Origin Policy"
- It blocks requests from `http://localhost:5173` (frontend) to `http://localhost:5000` (backend)
- CORS tells the browser: "It's okay, allow this request"
- `env.clientOrigin` is `http://localhost:5173` (from .env file)

**Without CORS:** Browser blocks the request ❌
**With CORS:** Request goes through ✅

### **Line 14: JSON Parser Middleware**

```javascript
app.use(express.json());
```

**What this does:**
- When frontend sends JSON data like `{ email: "user@example.com" }`
- This middleware parses it and makes it available as `req.body`
- Without this, `req.body` would be undefined

**Example:**
```javascript
// Frontend sends:
POST /api/auth/login
Body: { "email": "user@example.com", "password": "123456" }

// After express.json() middleware:
req.body = { email: "user@example.com", password: "123456" }
```

### **Lines 16-18: Health Check Endpoint**

```javascript
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API is healthy' });
});
```

**Purpose:**
- Simple endpoint to check if server is running
- Useful for monitoring and testing
- `req` = request object (incoming data)
- `res` = response object (outgoing data)
- `res.json()` sends JSON response

**Test it:** Open `http://localhost:5000/api/health` in browser

### **Lines 20-22: Route Mounting**

```javascript
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);
```

**What this means:**
- All routes in `authRoutes` are prefixed with `/api/auth`
- Example: `authRoutes` has `/register` → becomes `/api/auth/register`
- This keeps our code organized

**Route structure:**
- `/api/auth/*` - Authentication (register, login, me)
- `/api/users/*` - User management (admin only)
- `/api/ai/*` - AI features (admin only)

### **Lines 25-27: 404 Handler**

```javascript
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});
```

**Purpose:**
- Catches any request to a route that doesn't exist
- Returns a clear error message
- Must be placed BEFORE error handler

**Example:**
- User requests `/api/unknown` → Returns 404 with message

### **Line 29: Error Handler**

```javascript
app.use(errorHandler);
```

**Purpose:**
- Catches all errors from routes
- Must be LAST middleware
- Formats error responses consistently

### **Lines 32-41: Start Server**

```javascript
connectDb()
  .then(() => {
    app.listen(env.port, () => {
      console.log(`🚀 Server running on port ${env.port}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  });
```

**What happens:**
1. First, connect to MongoDB database
2. If connection succeeds → Start the server
3. If connection fails → Exit the process (don't start server without database)

**Why this order?**
- We need database connection before handling requests
- If database is down, there's no point running the server
- `process.exit(1)` stops the Node.js process

---

## 🎬 Part 3: Configuration Files

### **config/env.js - Environment Variables**

```javascript
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const env = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/user_management',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  chatGptApiKey: process.env.CHATGPT_API_KEY || '',
  chatGptModel: process.env.CHATGPT_MODEL || 'gpt-3.5-turbo'
};

module.exports = env;
```

**Line-by-line explanation:**

**Lines 1-4: Load Environment Variables**
- `dotenv` - Package that loads variables from `.env` file
- `dotenv.config()` - Reads `.env` file and loads variables into `process.env`
- Why? Keeps secrets (API keys, passwords) out of code

**Lines 6-14: Environment Configuration**
- `process.env.PORT` - Reads from `.env` file
- `|| 5000` - Default value if not set (fallback)
- This pattern: "Use .env value, or use default"

**Why environment variables?**
- Security: Never commit secrets to git
- Flexibility: Different values for development/production
- Best practice: Industry standard

**Example .env file:**
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/user_management
JWT_SECRET=my-super-secret-key-change-in-production
CLIENT_ORIGIN=http://localhost:5173
```

### **config/db.js - Database Connection**

```javascript
const mongoose = require('mongoose');
const env = require('./env');

async function connectDb() {
  try {
    await mongoose.connect(env.mongoUri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ Mongo connection error:', error.message);
    throw error;
  }
}

module.exports = connectDb;
```

**Explanation:**

**Line 5: Async Function**
- `async function` - Allows us to use `await` keyword
- `await` - Waits for async operation to complete

**Line 7: Connect to MongoDB**
- `mongoose.connect()` - Connects to MongoDB database
- `env.mongoUri` - Connection string (from env.js)
- This is an async operation (takes time)

**Lines 8-12: Error Handling**
- `try/catch` - Handles errors gracefully
- If connection fails → Log error and throw it
- The error is caught in `server.js` and server doesn't start

**Why async/await?**
- Database operations take time
- We don't want to block the server
- Modern, clean way to handle async code

---

## 🎬 Part 4: Database Model - User.js

```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
```

**What is a Schema?**
- Schema = Blueprint for database documents
- Like a template that defines structure
- Think of it as a form that users must fill out

**Field-by-field explanation:**

**Line 5: name**
```javascript
name: { type: String, required: true, trim: true }
```
- `type: String` - Text data
- `required: true` - Must be provided (can't be empty)
- `trim: true` - Removes whitespace from start/end
- Example: "  John  " becomes "John"

**Line 6: email**
```javascript
email: { type: String, required: true, unique: true, lowercase: true, trim: true }
```
- `required: true` - Must be provided
- `unique: true` - No duplicate emails allowed (database creates index)
- `lowercase: true` - Converts to lowercase automatically
- Example: "User@Email.com" → "user@email.com"
- `trim: true` - Removes whitespace

**Line 7: password**
```javascript
password: { type: String, required: true }
```
- `required: true` - Must be provided
- Note: We'll hash this before saving (never store plain passwords!)

**Line 8: role**
```javascript
role: { type: String, enum: ['admin', 'user'], default: 'user' }
```
- `enum` - Only these values allowed: 'admin' or 'user'
- `default: 'user'` - New users are regular users by default
- If you try to save 'moderator' → Error (not in enum)

**Line 10: timestamps**
```javascript
{ timestamps: true }
```
- Automatically adds two fields:
  - `createdAt` - When document was created
  - `updatedAt` - When document was last updated
- Mongoose handles this automatically

**Line 13: Create Model**
```javascript
module.exports = mongoose.model('User', userSchema);
```
- Creates a model named 'User'
- Use this to create, read, update, delete users
- Example: `User.create()`, `User.findOne()`, `User.findById()`

**Example Usage:**
```javascript
// Create a user
const user = await User.create({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'hashedPassword123',
  role: 'user'  // Optional, defaults to 'user'
});

// Result:
{
  _id: ObjectId('...'),
  name: 'John Doe',
  email: 'john@example.com',
  password: 'hashedPassword123',
  role: 'user',
  createdAt: 2024-01-15T10:30:00.000Z,
  updatedAt: 2024-01-15T10:30:00.000Z
}
```

---

## 🎬 Part 5: Routes - API Endpoints

Routes define what URLs our API responds to. Let's examine each route file.

### **routes/authRoutes.js - Authentication Routes**

```javascript
const express = require('express');
const { register, login, me } = require('../controllers/authController');
const { registerValidator, loginValidator } = require('../validators/authValidators');
const validateRequest = require('../middlewares/validateRequest');
const { authenticate } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', registerValidator, validateRequest, register);
router.post('/login', loginValidator, validateRequest, login);
router.get('/me', authenticate, me);

module.exports = router;
```

**Line 7: Create Router**
```javascript
const router = express.Router();
```
- Creates a router instance
- Instead of `app.post()`, we use `router.post()`
- Then mount it: `app.use('/api/auth', router)`

**Line 9: Register Route**
```javascript
router.post('/register', registerValidator, validateRequest, register);
```

**Breakdown:**
- `router.post()` - Handles POST requests
- `/register` - Endpoint path (becomes `/api/auth/register` when mounted)
- `registerValidator` - Validates input (email format, password length)
- `validateRequest` - Middleware that checks validation results
- `register` - Controller function that handles the logic

**Request Flow:**
1. Request arrives at `/api/auth/register`
2. `registerValidator` checks if email/password are valid
3. `validateRequest` stops request if validation fails
4. `register` function creates the user

**Line 10: Login Route**
```javascript
router.post('/login', loginValidator, validateRequest, login);
```
- Similar to register, but for logging in
- Validates email and password
- Calls `login` controller

**Line 11: Me Route (Get Current User)**
```javascript
router.get('/me', authenticate, me);
```
- `GET` request (no body needed)
- `authenticate` - Middleware that verifies JWT token
- `me` - Returns current user info
- **Protected route:** Only works if user is logged in

### **routes/userRoutes.js - User Management (Admin Only)**

```javascript
const express = require('express');
const { getAllUsers, changeRole, removeUser } = require('../controllers/userController');
const { authenticate, authorizeRole } = require('../middlewares/authMiddleware');
const { updateRoleValidator, userIdParamValidator } = require('../validators/userValidators');
const validateRequest = require('../middlewares/validateRequest');

const router = express.Router();

router.get('/', authenticate, authorizeRole('admin'), getAllUsers);
router.patch('/:id/role', authenticate, authorizeRole('admin'), updateRoleValidator, validateRequest, changeRole);
router.delete('/:id', authenticate, authorizeRole('admin'), userIdParamValidator, validateRequest, removeUser);

module.exports = router;
```

**Line 9: Get All Users**
```javascript
router.get('/', authenticate, authorizeRole('admin'), getAllUsers);
```
- `GET /api/users` - Get list of all users
- `authenticate` - Must be logged in
- `authorizeRole('admin')` - Must be admin
- `getAllUsers` - Controller function

**Line 10: Change User Role**
```javascript
router.patch('/:id/role', authenticate, authorizeRole('admin'), updateRoleValidator, validateRequest, changeRole);
```
- `PATCH /api/users/:id/role` - Update user role
- `:id` - URL parameter (e.g., `/api/users/123/role`)
- `authenticate` + `authorizeRole('admin')` - Admin only
- `updateRoleValidator` - Validates the role value
- `changeRole` - Controller

**Line 11: Delete User**
```javascript
router.delete('/:id', authenticate, authorizeRole('admin'), userIdParamValidator, validateRequest, removeUser);
```
- `DELETE /api/users/:id` - Delete a user
- Admin only
- Validates user ID
- `removeUser` - Controller

### **routes/aiRoutes.js - AI Features (Admin Only)**

```javascript
const express = require('express');
const { ask } = require('../controllers/aiController');
const { askValidator } = require('../validators/aiValidators');
const validateRequest = require('../middlewares/validateRequest');
const { authenticate, authorizeRole } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/ask', authenticate, authorizeRole('admin'), askValidator, validateRequest, ask);

module.exports = router;
```

**Line 9: Ask AI**
```javascript
router.post('/ask', authenticate, authorizeRole('admin'), askValidator, validateRequest, ask);
```
- `POST /api/ai/ask` - Send prompt to AI
- Admin only
- Validates prompt
- `ask` - Controller that calls AI service

---

## 🎬 Part 6: Controllers - Request Handlers

Controllers handle HTTP requests and responses. They're thin - business logic goes in services.

### **controllers/authController.js**

```javascript
const { registerUser, loginUser, sanitizeUser } = require('../services/authService');

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const result = await registerUser({ name, email, password });
    res.status(201).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await loginUser({ email, password });
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

async function me(req, res) {
  const safeUser = sanitizeUser(req.user);
  res.json({ success: true, user: safeUser });
}

module.exports = { register, login, me };
```

**register Function (Lines 3-11):**

**Line 5: Extract Data**
```javascript
const { name, email, password } = req.body;
```
- Destructuring: Extracts fields from request body
- `req.body` - Contains JSON data from frontend
- Example: `{ name: "John", email: "john@example.com", password: "123456" }`

**Line 6: Call Service**
```javascript
const result = await registerUser({ name, email, password });
```
- Calls service function (business logic)
- `await` - Waits for async operation
- Service returns: `{ user, token }`

**Line 7: Send Response**
```javascript
res.status(201).json({ success: true, ...result });
```
- `201` - HTTP status code (Created)
- `...result` - Spreads `{ user, token }` into response
- Final response: `{ success: true, user: {...}, token: "..." }`

**Line 9: Error Handling**
```javascript
next(error);
```
- Passes error to error handler middleware
- Centralized error handling

**login Function (Lines 13-21):**
- Similar pattern to register
- Extracts email/password
- Calls `loginUser` service
- Returns user and token

**me Function (Lines 23-27):**
```javascript
async function me(req, res) {
  const safeUser = sanitizeUser(req.user);
  res.json({ success: true, user: safeUser });
}
```
- `req.user` - Set by `authenticate` middleware (contains logged-in user)
- `sanitizeUser()` - Removes password from response
- Returns current user info

### **controllers/userController.js**

```javascript
const { listUsers, updateUserRole, deleteUser } = require('../services/userService');

async function getAllUsers(req, res, next) {
  try {
    const users = await listUsers();
    res.json({ success: true, users });
  } catch (error) {
    next(error);
  }
}

async function changeRole(req, res, next) {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const user = await updateUserRole(id, role, req.user.id);
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
}

async function removeUser(req, res, next) {
  try {
    const { id } = req.params;
    await deleteUser(id, req.user.id);
    res.json({ success: true, deletedId: id });
  } catch (error) {
    next(error);
  }
}

module.exports = { getAllUsers, changeRole, removeUser };
```

**getAllUsers (Lines 3-10):**
- Calls `listUsers()` service
- Returns array of users

**changeRole (Lines 12-21):**
- `req.params.id` - Gets ID from URL (`/api/users/:id/role`)
- `req.body.role` - Gets new role from request body
- `req.user.id` - Current user's ID (from auth middleware)
- Calls service to update role

**removeUser (Lines 23-31):**
- Gets user ID from URL params
- Gets current user ID (to prevent self-deletion)
- Calls service to delete user

### **controllers/aiController.js**

```javascript
const { askAi } = require('../services/aiService');

async function ask(req, res, next) {
  try {
    const { prompt } = req.body;
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ success: false, message: 'Prompt is required' });
    }

    const answer = await askAi(prompt);
    res.json({ success: true, answer });
  } catch (error) {
    next(error);
  }
}

module.exports = { ask };
```

**ask Function:**
- Gets `prompt` from request body
- Validates prompt is not empty
- Calls `askAi()` service
- Returns AI response

---

## 🎬 Part 7: Services - Business Logic

Services contain the actual business logic. They're reusable and testable.

### **services/authService.js**

```javascript
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

async function registerUser({ name, email, password }) {
  const existing = await User.findOne({ email });
  if (existing) {
    const error = new Error('Email already registered');
    error.status = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: 'user'
  });

  const token = generateToken(user._id);
  return { user: sanitizeUser(user), token };
}

async function loginUser({ email, password }) {
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }

  const token = generateToken(user._id);
  return { user: sanitizeUser(user), token };
}

function sanitizeUser(user) {
  const { _id, name, email, role, createdAt, updatedAt } = user;
  return { id: _id, name, email, role, createdAt, updatedAt };
}

module.exports = { registerUser, loginUser, sanitizeUser };
```

**registerUser Function (Lines 6-25):**

**Line 7: Check for Duplicate Email**
```javascript
const existing = await User.findOne({ email });
```
- Queries database for user with this email
- `findOne()` - Returns first match or null

**Lines 8-12: Handle Duplicate**
```javascript
if (existing) {
  const error = new Error('Email already registered');
  error.status = 400;
  throw error;
}
```
- If user exists → Throw error
- `error.status = 400` - Bad Request
- Error is caught by controller and sent to error handler

**Line 14: Hash Password**
```javascript
const hashedPassword = await bcrypt.hash(password, 10);
```
- **CRITICAL:** Never store plain passwords!
- `bcrypt.hash()` - Creates secure hash
- `10` - Salt rounds (higher = more secure but slower)
- Example: `"password123"` → `"$2a$10$N9qo8uLOickgx2ZMRZoMye..."`

**Why hash passwords?**
- If database is hacked, attackers can't see passwords
- Hash is one-way (can't reverse it)
- Industry standard security practice

**Lines 16-21: Create User**
```javascript
const user = await User.create({
  name,
  email,
  password: hashedPassword,
  role: 'user'
});
```
- Saves user to database
- `User.create()` - Mongoose method
- `role: 'user'` - Default role (not admin)

**Lines 23-24: Generate Token and Return**
```javascript
const token = generateToken(user._id);
return { user: sanitizeUser(user), token };
```
- Creates JWT token with user ID
- `sanitizeUser()` - Removes password from response
- Returns user (without password) and token

**loginUser Function (Lines 28-45):**

**Line 29: Find User**
```javascript
const user = await User.findOne({ email });
```
- Finds user by email

**Lines 30-34: User Not Found**
```javascript
if (!user) {
  const error = new Error('Invalid credentials');
  error.status = 401;
  throw error;
}
```
- If user doesn't exist → Error
- **Security:** Same error message for "wrong email" and "wrong password"
- Prevents attackers from knowing if email exists

**Line 36: Compare Password**
```javascript
const passwordMatch = await bcrypt.compare(password, user.password);
```
- `bcrypt.compare()` - Compares plain password with hash
- Returns `true` if match, `false` if not

**Lines 37-41: Wrong Password**
```javascript
if (!passwordMatch) {
  const error = new Error('Invalid credentials');
  error.status = 401;
  throw error;
}
```
- Same error message (security best practice)

**Lines 43-44: Success**
```javascript
const token = generateToken(user._id);
return { user: sanitizeUser(user), token };
```
- Password matches → Generate token
- Return user and token

**sanitizeUser Function (Lines 47-50):**
```javascript
function sanitizeUser(user) {
  const { _id, name, email, role, createdAt, updatedAt } = user;
  return { id: _id, name, email, role, createdAt, updatedAt };
}
```
- **Purpose:** Remove password from response
- Destructures only safe fields
- Converts `_id` to `id` (cleaner for frontend)
- **Security:** Never send password to frontend!

### **services/userService.js**

```javascript
const User = require('../models/User');
const { sanitizeUser } = require('./authService');

async function listUsers() {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  return users.map((u) => sanitizeUser(u));
}

async function updateUserRole(userId, role, actingUserId) {
  if (userId === String(actingUserId)) {
    const error = new Error('Admins cannot change their own role here to avoid lockout.');
    error.status = 400;
    throw error;
  }

  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  user.role = role;
  await user.save();
  return sanitizeUser(user);
}

async function deleteUser(userId, actingUserId) {
  if (userId === String(actingUserId)) {
    const error = new Error('You cannot delete your own admin account.');
    error.status = 400;
    throw error;
  }

  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  await user.deleteOne();
  return userId;
}

module.exports = { listUsers, updateUserRole, deleteUser };
```

**listUsers (Lines 5-8):**
- `User.find()` - Gets all users
- `.select('-password')` - Excludes password field
- `.sort({ createdAt: -1 })` - Newest first
- Maps each user through `sanitizeUser()`

**updateUserRole (Lines 10-27):**
- **Line 11-15:** Prevents self-role-change (security)
- **Line 17:** Finds user by ID
- **Line 18-22:** User not found error
- **Line 24:** Updates role
- **Line 25:** Saves to database
- **Line 26:** Returns sanitized user

**deleteUser (Lines 29-45):**
- **Line 30-34:** Prevents self-deletion (security)
- **Line 36:** Finds user
- **Line 37-41:** User not found error
- **Line 43:** Deletes user
- **Line 44:** Returns deleted user ID

### **services/aiService.js**

```javascript
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const env = require('../config/env');

const geminiClient = env.geminiApiKey ? new GoogleGenerativeAI(env.geminiApiKey) : null;

async function askAi(prompt) {
  const cleanPrompt = prompt.trim();

  if (geminiClient) {
    const model = geminiClient.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(cleanPrompt);
    const text = result.response?.text?.() || 'No response';
    return text.trim();
  }

  if (env.chatGptApiKey) {
    return askChatGpt(cleanPrompt);
  }

  return 'Demo response: add GEMINI_API_KEY or CHATGPT_API_KEY in backend/.env to get live AI answers.';
}

async function askChatGpt(prompt) {
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: env.chatGptModel,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 300
    },
    {
      headers: {
        Authorization: `Bearer ${env.chatGptApiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    }
  );

  const answer = response.data.choices?.[0]?.message?.content || 'No response';
  return answer.trim();
}

module.exports = { askAi };
```

**askAi Function:**
- Tries Gemini first (if API key exists)
- Falls back to ChatGPT (if API key exists)
- Falls back to demo message (if no keys)

**Priority:**
1. Gemini (if `GEMINI_API_KEY` exists)
2. ChatGPT (if `CHATGPT_API_KEY` exists)
3. Demo message (if neither exists)

---

## 🎬 Part 8: Middleware - The Request Pipeline

Middleware functions run between request and response. They can modify requests, check authentication, validate data, etc.

### **middlewares/authMiddleware.js**

```javascript
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Missing token' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.jwtSecret);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

function authorizeRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ success: false, message: 'Forbidden: insufficient role' });
    }
    next();
  };
}

module.exports = { authenticate, authorizeRole };
```

**authenticate Function (Lines 6-26):**

**Line 8: Get Authorization Header**
```javascript
const authHeader = req.headers.authorization;
```
- Gets token from request header
- Format: `"Bearer <token>"`

**Lines 9-11: Check Token Exists**
```javascript
if (!authHeader || !authHeader.startsWith('Bearer ')) {
  return res.status(401).json({ success: false, message: 'Missing token' });
}
```
- If no token → Return 401 Unauthorized
- Must start with "Bearer "

**Line 13: Extract Token**
```javascript
const token = authHeader.split(' ')[1];
```
- Splits "Bearer <token>" and gets token part
- Example: `"Bearer abc123"` → `"abc123"`

**Line 14: Verify Token**
```javascript
const decoded = jwt.verify(token, env.jwtSecret);
```
- Verifies token is valid and not expired
- Decodes token to get user ID
- If invalid/expired → Throws error (caught in catch block)

**Line 16: Find User**
```javascript
const user = await User.findById(decoded.id).select('-password');
```
- Gets user from database using ID from token
- `.select('-password')` - Excludes password

**Lines 17-19: User Not Found**
```javascript
if (!user) {
  return res.status(401).json({ success: false, message: 'User not found' });
}
```
- If user doesn't exist → Error

**Line 21: Attach User to Request**
```javascript
req.user = user;
```
- **Important:** Makes user available to controllers
- Controllers can access `req.user`

**Line 22: Continue**
```javascript
next();
```
- Calls next middleware/controller
- Request continues

**Line 24: Error Handling**
```javascript
catch (error) {
  return res.status(401).json({ success: false, message: 'Invalid or expired token' });
}
```
- Catches token verification errors
- Returns 401 Unauthorized

**authorizeRole Function (Lines 28-36):**

**What is this?**
- Higher-order function (returns a function)
- Checks if user has required role

**Line 30: Return Middleware Function**
```javascript
return (req, res, next) => {
```
- Returns a middleware function

**Lines 31-33: Check Role**
```javascript
if (!req.user || req.user.role !== role) {
  return res.status(403).json({ success: false, message: 'Forbidden: insufficient role' });
}
```
- If no user or wrong role → 403 Forbidden
- `403` = Authenticated but not authorized

**Usage:**
```javascript
router.get('/admin-only', authenticate, authorizeRole('admin'), controller);
```
- First: `authenticate` verifies token
- Then: `authorizeRole('admin')` checks role
- Then: Controller runs

### **middlewares/errorHandler.js**

```javascript
function errorHandler(err, req, res, next) {
  console.error('Error handler caught:', err.message);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal server error'
  });
}

module.exports = errorHandler;
```

**Purpose:**
- Centralized error handling
- All errors from controllers/services end up here
- Formats error responses consistently

**Line 3: Get Status Code**
```javascript
const status = err.status || 500;
```
- Uses error's status code, or defaults to 500 (Server Error)

**Line 4-7: Send Error Response**
```javascript
res.status(status).json({
  success: false,
  message: err.message || 'Internal server error'
});
```
- Sends JSON error response
- Consistent format across all errors

### **middlewares/validateRequest.js**

```javascript
const { validationResult } = require('express-validator');

function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
}

module.exports = validateRequest;
```

**Purpose:**
- Checks validation results from express-validator
- If errors exist → Returns 400 Bad Request
- If no errors → Continues to controller

**Line 5: Get Validation Errors**
```javascript
const errors = validationResult(req);
```
- Gets validation errors from request
- Set by validators (registerValidator, etc.)

**Lines 6-8: Handle Errors**
```javascript
if (!errors.isEmpty()) {
  return res.status(400).json({ success: false, errors: errors.array() });
}
```
- If errors exist → Return 400 with error array
- Stops request from continuing

**Line 9: Continue**
```javascript
next();
```
- No errors → Continue to controller

---

## 🎬 Part 9: Validators - Input Validation

Validators check if incoming data is correct before processing.

### **validators/authValidators.js**

```javascript
const { body } = require('express-validator');

const registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password should be at least 6 characters long')
];

const loginValidator = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

module.exports = { registerValidator, loginValidator };
```

**registerValidator (Lines 3-9):**

**Line 4: Name Validation**
```javascript
body('name').trim().notEmpty().withMessage('Name is required')
```
- `body('name')` - Validates `req.body.name`
- `.trim()` - Removes whitespace
- `.notEmpty()` - Must not be empty
- `.withMessage()` - Custom error message

**Line 5: Email Validation**
```javascript
body('email').isEmail().withMessage('Valid email is required')
```
- `.isEmail()` - Checks if it's a valid email format
- Example: "user@example.com" ✅, "notanemail" ❌

**Lines 6-8: Password Validation**
```javascript
body('password')
  .isLength({ min: 6 })
  .withMessage('Password should be at least 6 characters long')
```
- `.isLength({ min: 6 })` - Must be at least 6 characters
- Example: "123456" ✅, "12345" ❌

**loginValidator (Lines 11-14):**
- Similar to register, but simpler
- Just checks email format and password exists

**How it works:**
1. Validator runs first
2. Results stored in request
3. `validateRequest` middleware checks results
4. If errors → Return 400
5. If no errors → Continue

---

## 🎬 Part 10: Utils - Helper Functions

### **utils/generateToken.js**

```javascript
const jwt = require('jsonwebtoken');
const env = require('../config/env');

function generateToken(userId) {
  return jwt.sign({ id: userId }, env.jwtSecret, { expiresIn: '2h' });
}

module.exports = generateToken;
```

**What is JWT?**
- JSON Web Token
- Contains user ID (and optionally other data)
- Signed with secret key (only server can create/verify)
- Expires after set time

**Line 5: Generate Token**
```javascript
return jwt.sign({ id: userId }, env.jwtSecret, { expiresIn: '2h' });
```
- `jwt.sign()` - Creates token
- `{ id: userId }` - Payload (data in token)
- `env.jwtSecret` - Secret key (from .env)
- `{ expiresIn: '2h' }` - Expires in 2 hours

**Token Structure:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1MTIzNDU2Nzg5MCIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoxNzAwMDA3MjAwfQ.signature
```
- Three parts separated by dots
- Can be decoded (but not modified without secret)

**Why JWT?**
- Stateless: Server doesn't need to store sessions
- Scalable: Works across multiple servers
- Secure: Can't be modified without secret key

---

## 🎬 Part 11: Frontend Architecture Overview

Now let's move to the frontend! The frontend is built with React and uses modern patterns.

```
frontend/src/
├── main.jsx           # Entry point
├── App.jsx            # Main app, routes
├── api.js             # API client setup
├── components/         # Reusable components
├── context/            # Global state (AuthContext)
├── hooks/              # Custom hooks
└── pages/              # Page components
```

---

## 🎬 Part 12: Frontend Entry Point - main.jsx

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**Line 1-3: Imports**
- `React` - React library
- `ReactDOM` - React DOM renderer
- `App` - Main app component

**Line 5: Create Root**
```javascript
ReactDOM.createRoot(document.getElementById('root'))
```
- Creates React root (React 18 way)
- Finds `<div id="root">` in HTML
- This is where React app will be rendered

**Line 6-8: Render App**
```javascript
.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```
- Renders `<App />` component
- `<React.StrictMode>` - Development tool (finds potential problems)
- App component takes over from here

**What happens:**
1. Browser loads `index.html`
2. HTML has `<div id="root"></div>`
3. `main.jsx` runs
4. React renders `<App />` into that div
5. App component renders routes, pages, etc.

---

## 🎬 Part 13: App Component - Routes & Structure

```javascript
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import NavBar from './components/NavBar';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import './styles.css';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <NavBar />
        <main className="container">
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireRole="admin">
                  <Admin />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}
```

**Line 14: AuthProvider Wrapper**
```javascript
<AuthProvider>
```
- Wraps entire app
- Provides authentication state to all components
- Any component can access: `const { user, login, logout } = useAuth()`

**Line 15: BrowserRouter**
```javascript
<BrowserRouter>
```
- Enables client-side routing
- Allows navigation without page refresh
- React Router feature

**Line 16: NavBar**
```javascript
<NavBar />
```
- Navigation bar (always visible)
- Shows login/logout, admin link, etc.

**Lines 19-26: Protected Dashboard Route**
```javascript
<Route
  path="/"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```
- `path="/"` - Home page
- `<ProtectedRoute>` - Wrapper that checks if user is logged in
- If not logged in → Redirects to `/login`
- If logged in → Shows `<Dashboard />`

**Line 27: Public Login Route**
```javascript
<Route path="/login" element={<Login />} />
```
- Public route (anyone can access)
- Shows login form

**Line 28: Public Register Route**
```javascript
<Route path="/register" element={<Register />} />
```
- Public route
- Shows registration form

**Lines 29-36: Admin Route**
```javascript
<Route
  path="/admin"
  element={
    <ProtectedRoute requireRole="admin">
      <Admin />
    </ProtectedRoute>
  }
/>
```
- `requireRole="admin"` - Requires admin role
- If not admin → Redirects to home
- If admin → Shows `<Admin />` page

---

## 🎬 Part 14: API Client Setup - api.js

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

**Lines 3-8: Create Axios Instance**
```javascript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json'
  }
});
```
- Creates configured axios instance
- `baseURL` - Prefix for all requests
- `import.meta.env.VITE_API_BASE` - Vite environment variable
- All requests automatically use this base URL

**Example:**
```javascript
api.get('/api/users')
// Becomes: GET http://localhost:5000/api/users
```

**Lines 11-17: Request Interceptor**
```javascript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**What this does:**
- Runs before EVERY API request
- Gets token from `localStorage`
- Adds `Authorization: Bearer <token>` header
- Backend uses this to authenticate user

**Why interceptors?**
- Don't need to add token manually to every request
- Centralized: Change in one place, affects all requests

**Example:**
```javascript
// Without interceptor:
api.get('/api/users', {
  headers: { Authorization: `Bearer ${token}` }
});

// With interceptor:
api.get('/api/users'); // Token automatically added!
```

---

## 🎬 Part 15: Authentication Context - AuthContext.jsx

```javascript
import React, { createContext, useEffect, useState } from 'react';
import api from '../api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMe() {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get('/api/auth/me');
        setUser(data.user);
      } catch (error) {
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    }
    fetchMe();
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
```

**Line 4: Create Context**
```javascript
export const AuthContext = createContext(null);
```
- Creates React Context
- `null` - Default value

**Line 7: AuthProvider Component**
```javascript
export function AuthProvider({ children }) {
```
- Component that provides context
- `children` - Child components (entire app)

**Lines 8-9: State**
```javascript
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);
```
- `user` - Current logged-in user (null if not logged in)
- `loading` - true while checking if user is logged in

**Lines 11-30: Check Authentication on Load**
```javascript
useEffect(() => {
  async function fetchMe() {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get('/api/auth/me');
      setUser(data.user);
    } catch (error) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }
  fetchMe();
}, []);
```

**What happens:**
1. `useEffect` runs when component mounts (app starts)
2. Checks if token exists in `localStorage`
3. If no token → Set loading to false, return
4. If token exists → Call `/api/auth/me` to get user info
5. If token invalid → Remove token from localStorage
6. Set loading to false

**`[]` dependency array:**
- Empty array = runs once on mount
- Not `[user]` = doesn't run when user changes

**Lines 32-35: Login Function**
```javascript
const login = (token, userData) => {
  localStorage.setItem('token', token);
  setUser(userData);
};
```
- Stores token in localStorage
- Sets user in state
- Called after successful login/register

**Lines 37-40: Logout Function**
```javascript
const logout = () => {
  localStorage.removeItem('token');
  setUser(null);
};
```
- Removes token from localStorage
- Clears user from state

**Lines 42-46: Provide Context**
```javascript
return (
  <AuthContext.Provider value={{ user, login, logout, loading }}>
    {children}
  </AuthContext.Provider>
);
```
- Provides context value to all children
- Any component can access: `const { user, login, logout } = useAuth()`

---

## 🎬 Part 16: Login Page - Login.jsx

```javascript
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import useAuth from '../hooks/useAuth';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/login', form);
      login(data.token, data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className="form">
        <label>Email</label>
        <input name="email" type="email" value={form.email} onChange={handleChange} required />

        <label>Password</label>
        <input name="password" type="password" value={form.password} onChange={handleChange} required />

        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Login'}</button>
      </form>
      <p>New here? <Link to="/register">Create an account</Link></p>
    </div>
  );
}
```

**Lines 7-11: Hooks and State**
```javascript
const navigate = useNavigate();
const { login } = useAuth();
const [form, setForm] = useState({ email: '', password: '' });
const [error, setError] = useState('');
const [loading, setLoading] = useState(false);
```
- `navigate` - React Router hook for navigation
- `login` - From AuthContext
- `form` - Form data state
- `error` - Error message state
- `loading` - Loading state

**Lines 13-15: Handle Input Change**
```javascript
const handleChange = (e) => {
  setForm({ ...form, [e.target.name]: e.target.value });
};
```

**How this works:**
- `e.target.name` - Input name ("email" or "password")
- `e.target.value` - Input value
- `[e.target.name]` - Dynamic property name
- Updates only that field in form state

**Example:**
- User types "john@example.com" in email field
- `e.target.name = "email"`, `e.target.value = "john@example.com"`
- `setForm({ ...form, email: "john@example.com" })`
- `form.email` now = "john@example.com"

**Lines 17-30: Handle Form Submit**
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);
  try {
    const { data } = await api.post('/api/auth/login', form);
    login(data.token, data.user);
    navigate('/');
  } catch (err) {
    setError(err.response?.data?.message || 'Login failed');
  } finally {
    setLoading(false);
  }
};
```

**Line 18: Prevent Default**
```javascript
e.preventDefault();
```
- Prevents form's default submit (page refresh)
- We handle submission with JavaScript

**Line 19-20: Reset State**
```javascript
setError('');
setLoading(true);
```
- Clear previous errors
- Show loading state

**Line 22: API Call**
```javascript
const { data } = await api.post('/api/auth/login', form);
```
- Sends POST request to backend
- `form` = `{ email: "...", password: "..." }`
- `await` - Waits for response
- `data` = Response from backend

**Line 23: Store Token and User**
```javascript
login(data.token, data.user);
```
- Calls `login` function from context
- Stores token in localStorage
- Sets user in context

**Line 24: Navigate to Dashboard**
```javascript
navigate('/');
```
- Redirects to home page (Dashboard)
- Client-side navigation (no page refresh)

**Lines 25-27: Error Handling**
```javascript
catch (err) {
  setError(err.response?.data?.message || 'Login failed');
}
```
- If request fails → Show error message
- `err.response?.data?.message` - Error message from backend
- `|| 'Login failed'` - Fallback message

**Lines 28-30: Finally Block**
```javascript
finally {
  setLoading(false);
}
```
- Always runs (success or error)
- Stops loading state

**Lines 37-40: Controlled Inputs**
```javascript
<input name="email" type="email" value={form.email} onChange={handleChange} required />
```
- `value={form.email}` - Controlled input (React controls value)
- `onChange={handleChange}` - Updates state on every keystroke
- `required` - HTML5 validation

**Line 42: Conditional Error Display**
```javascript
{error && <p className="error">{error}</p>}
```
- Only shows if error exists
- Conditional rendering

**Line 43: Submit Button**
```javascript
<button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Login'}</button>
```
- `disabled={loading}` - Disabled while submitting
- Shows "Signing in..." while loading

---

## 🎬 Part 17: Protected Route Component

```javascript
import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function ProtectedRoute({ children, requireRole }) {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading session...</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (requireRole && user.role !== requireRole) return <Navigate to="/" replace />;

  return children;
}
```

**Line 6: Component Props**
```javascript
export default function ProtectedRoute({ children, requireRole }) {
```
- `children` - Content to show if authorized
- `requireRole` - Optional role requirement (e.g., "admin")

**Line 7: Get Auth State**
```javascript
const { user, loading } = useAuth();
```
- Gets user and loading from context

**Line 9: Loading State**
```javascript
if (loading) return <p>Loading session...</p>;
```
- While checking authentication → Show loading

**Line 10: Not Logged In**
```javascript
if (!user) return <Navigate to="/login" replace />;
```
- If no user → Redirect to login
- `<Navigate>` - React Router component
- `replace` - Replaces history (can't go back)

**Line 11: Wrong Role**
```javascript
if (requireRole && user.role !== requireRole) return <Navigate to="/" replace />;
```
- If requires role and user doesn't have it → Redirect to home
- Example: Requires "admin" but user is "user"

**Line 13: Authorized**
```javascript
return children;
```
- All checks passed → Show protected content

**Usage:**
```javascript
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>

<ProtectedRoute requireRole="admin">
  <Admin />
</ProtectedRoute>
```

---

## 🎬 Part 18: Complete Request Flow - User Logs In

Let's trace what happens when a user logs in, from frontend to backend and back:

### **Step 1: User Fills Form and Clicks "Login"**
- User types email and password
- Clicks "Login" button

### **Step 2: Frontend - handleSubmit Runs**
```javascript
// Login.jsx
const { data } = await api.post('/api/auth/login', form);
```
- `form` = `{ email: "user@example.com", password: "password123" }`

### **Step 3: Axios Interceptor Adds Token (if exists)**
```javascript
// api.js - interceptor runs
const token = localStorage.getItem('token');
if (token) {
  config.headers.Authorization = `Bearer ${token}`;
}
```
- Gets token from localStorage (might not exist on first login)
- Adds Authorization header

### **Step 4: HTTP Request Sent**
```
POST http://localhost:5000/api/auth/login
Headers: 
  Content-Type: application/json
Body: 
  { "email": "user@example.com", "password": "password123" }
```

### **Step 5: Backend - server.js Receives Request**
```javascript
// server.js
app.use(express.json()); // Parses JSON body
// Routes to /api/auth/login
```

### **Step 6: Backend - authRoutes.js Routes Request**
```javascript
// authRoutes.js
router.post('/login', loginValidator, validateRequest, login);
```

### **Step 7: Validation Middleware**
```javascript
// authValidators.js
loginValidator checks:
  - email is valid format
  - password exists

// validateRequest.js
If validation fails → return 400 error
If passes → continue
```

### **Step 8: Controller - authController.js**
```javascript
// authController.js - login()
const { email, password } = req.body;
const result = await loginUser({ email, password });
```

### **Step 9: Service - authService.js**
```javascript
// authService.js - loginUser()
1. User.findOne({ email }) → finds user in database
2. If not found → throw error
3. bcrypt.compare(password, user.password) → checks password
4. If wrong → throw error
5. generateToken(user._id) → creates JWT
6. sanitizeUser(user) → removes password
7. Returns { user, token }
```

### **Step 10: Controller Sends Response**
```javascript
// authController.js
res.json({ success: true, user, token });
```

### **Step 11: Frontend Receives Response**
```javascript
// Login.jsx - handleSubmit
const { data } = await api.post('/api/auth/login', form);
// data = { success: true, user: {...}, token: "..." }

login(data.token, data.user);
// Stores token in localStorage
// Sets user in context

navigate('/');
// Redirects to dashboard
```

### **Step 12: Dashboard Loads**
```javascript
// App.jsx
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>

// ProtectedRoute checks if user exists
// If yes → shows Dashboard

// Dashboard.jsx
const { user } = useAuth();
// Displays: "Welcome back, {user.name}!"
```

---

## 🎬 Part 19: Complete Protected API Request Flow

What happens when user clicks a button that calls a protected API:

### **Example: Admin clicks "Get All Users"**

### **Step 1: Component Calls API**
```javascript
// Admin.jsx
const { data } = await api.get('/api/users');
```

### **Step 2: Axios Interceptor Adds Token**
```javascript
// api.js
const token = localStorage.getItem('token');
config.headers.Authorization = `Bearer ${token}`;
```

### **Step 3: Request Sent**
```
GET http://localhost:5000/api/users
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### **Step 4: Backend Routes Request**
```javascript
// server.js → userRoutes.js
router.get('/', authenticate, authorizeRole('admin'), getAllUsers);
```

### **Step 5: Authentication Middleware**
```javascript
// authMiddleware.js - authenticate()
1. Gets token from Authorization header
2. jwt.verify(token) → decodes token
3. User.findById(decoded.id) → finds user
4. Sets req.user = user
5. Calls next()
```

### **Step 6: Authorization Middleware**
```javascript
// authMiddleware.js - authorizeRole('admin')
1. Checks if req.user.role === 'admin'
2. If not → return 403 Forbidden
3. If yes → calls next()
```

### **Step 7: Controller**
```javascript
// userController.js - getAllUsers()
const users = await listUsers();
res.json({ success: true, users });
```

### **Step 8: Service**
```javascript
// userService.js - listUsers()
const users = await User.find().select('-password');
return users.map((u) => sanitizeUser(u));
```

### **Step 9: Response Sent**
```json
{
  "success": true,
  "users": [
    { "id": "...", "name": "John", "email": "...", "role": "user" },
    { "id": "...", "name": "Admin", "email": "...", "role": "admin" }
  ]
}
```

### **Step 10: Frontend Updates State**
```javascript
// Admin.jsx
setUsers(data.users);
// UI re-renders with user list
```

---

## 🎬 Part 20: Key Concepts Summary

### **1. Authentication vs Authorization**

**Authentication:** "Who are you?"
- Verifies user identity (login)
- Checks if user is logged in
- Uses JWT tokens

**Authorization:** "What can you do?"
- Checks user permissions
- Role-based access (admin vs user)
- Uses `authorizeRole()` middleware

### **2. JWT Token Flow**

1. User logs in → Server creates token
2. Token sent to frontend → Stored in localStorage
3. Frontend sends token with every request
4. Backend verifies token → Extracts user ID
5. Request proceeds with user info

### **3. Password Security**

- **Never store plain passwords!**
- Hash passwords with bcrypt
- Compare hashes, not plain text
- One-way function (can't reverse)

### **4. Middleware Chain**

Request flows through middleware in order:
```
Request
  ↓
CORS middleware
  ↓
express.json() (parses JSON)
  ↓
Route handler
  ↓
Validation middleware
  ↓
Authentication middleware
  ↓
Authorization middleware
  ↓
Controller
  ↓
Response
```

### **5. React State Management**

- **useState:** Component-level state
- **Context:** Global state (authentication)
- **Props:** Pass data between components

### **6. Protected Routes**

- Frontend: `<ProtectedRoute>` checks if user exists
- Backend: `authenticate` middleware verifies token
- Both must pass for access

---

## 🎬 Conclusion

Congratulations! You now understand a complete MERN stack application:

✅ **Backend:**
- Express server setup
- MongoDB connection
- Routes, controllers, services
- Authentication & authorization
- Middleware pipeline
- Input validation
- Error handling

✅ **Frontend:**
- React component structure
- Routing with React Router
- Context API for global state
- API integration with Axios
- Protected routes
- Form handling

✅ **Security:**
- Password hashing
- JWT tokens
- Role-based access control
- Input validation

✅ **Architecture:**
- Separation of concerns
- MVC pattern
- Service layer
- Clean code organization

This is a production-ready application structure that you can use as a foundation for your own projects!

---

**Next Steps:**
1. Run the project and test it
2. Add new features
3. Deploy to production
4. Build more projects using this knowledge

Happy coding! 🚀
