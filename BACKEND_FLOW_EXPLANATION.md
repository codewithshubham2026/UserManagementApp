# Backend Flow Explanation (in Hindi, but text is in English)

Ye document backend ka complete flow explain karta hai – file by file, code by code (sab cheezen samjhayega, lekin likha English alphabets me hi hai).

---

## 📋 Table of Contents
1. [Server Startup Flow](#1-server-startup-flow)
2. [Environment Configuration](#2-environment-configuration)
3. [Register Flow (Complete)](#3-register-flow-complete)
4. [Login Flow (Complete)](#4-login-flow-complete)
5. [AI Flow (Complete)](#5-ai-flow-complete)
6. [User Management Flows](#6-user-management-flows)
7. [Admin Seeding Flow](#7-admin-seeding-flow)

---

## 1. Server Startup Flow

### File: `backend/src/server.js`

**Kya hota hai (What happens):**
1. Server shuru hota hai aur sabse pehle database connect karta hai
2. Middleware setup hota hai (jaise CORS, JSON parser etc.)
3. Api routes register hote hain
4. Error handler lagta hai sabse end me

**Step-by-step:**

```javascript
// Line 1-8: Dependencies import karti hai
const express = require('express');
const cors = require('cors');
const connectDb = require('./config/db');        // Database connection ka function
const env = require('./config/env');             // Env vars loader
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const aiRoutes = require('./routes/aiRoutes');
const errorHandler = require('./middlewares/errorHandler');
```

**Line 12:** Environment variables ko check kiya jata hai
```javascript
env.ensureEnv();  // Agar .env file me zaruri values nahi, to error dega
```

**Line 15-22:** CORS setup - frontend se requests allow karne ke liye
```javascript
app.use(cors({
  origin: env.clientOrigin,  // Frontend ka URL
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

**Line 22:** JSON parser lagta hai taki body parse ho sake
```javascript
app.use(express.json());
```

**Line 28-30:** Routes mount kiye jaate hain
```javascript
app.use('/api/auth', authRoutes);   // Auth ke routes
app.use('/api/users', userRoutes);  // User manage ke routes
app.use('/api/ai', aiRoutes);       // AI ke routes
```

**Line 37:** Error handler sabse last me lagaya jata hai
```javascript
app.use(errorHandler);
```

**Line 40-52:** Database ko connect karke server start hota hai
```javascript
connectDb()
  .then(() => {
    app.listen(env.port, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${env.port}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  });
```

### Testing (Console/Response)
**Console expected (example):**
```
✅ Connected to MongoDB
✅ Default admin user created
   Email: admin@example.com
   Password: admin123
🚀 Server running on port 5000
```

---

## 2. Environment Configuration

### File: `backend/src/config/env.js`

**Kya hota hai:**
- .env file se environment variables load karta hai
- Agar value missing hai .env me, to kuch default values use karta hai
- Production ke liye extra security checks bhi lagata hai

**Step-by-step:**

```javascript
// Line 1-4: .env load karta hai
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
```

**Kya hota hai:**
- .env file ko read karta hai
- process.cwd() means current working dir (generally "backend")

**Line 6-14: Environment Variables Object**
```javascript
const env = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/user_management',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  chatGptApiKey: process.env.CHATGPT_API_KEY || '',
  chatGptModel: process.env.CHATGPT_MODEL || 'gpt-3.5-turbo'
};
```

**Kya hota hai:**
- Har variable ke liye, pehle try karta hai .env se, na mile to:
- Default value use karta hai
- "||" means left falsy to right use hoga

**Variables Explanation:**
- `port`: Server kis port par chalega (default 5000)
- `mongoUri`: MongoDB ki connection string
- `jwtSecret`: JWT sign karne ke liye secret
- `clientOrigin`: Aapke frontend ka URL, CORS ke liye
- `geminiApiKey`: Google Gemini API key
- `chatGptApiKey`: OpenAI ChatGPT API key
- `chatGptModel`: ChatGPT ka model ka naam

**Line 16-35: Environment Validation**
```javascript
function ensureEnv() {
  const usingDefaultSecret = env.jwtSecret === 'dev-secret-change-me';
  const usingLocalDb = env.mongoUri.includes('127.0.0.1') || env.mongoUri.includes('localhost');

  // Production me default secret forbidden hai
  if (usingDefaultSecret && process.env.NODE_ENV === 'production') {
    throw new Error('Set JWT_SECRET to a strong value in production.');
  }

  // Production me local database forbidden hai
  if (usingLocalDb && process.env.NODE_ENV === 'production') {
    throw new Error('Set MONGO_URI to your production database connection string.');
  }

  // Client origin must hai
  if (!env.clientOrigin) {
    throw new Error('CLIENT_ORIGIN is required.');
  }

  // Warning (dev mode) jab default secret hai
  if (usingDefaultSecret) {
    console.warn('Warning: using default JWT secret. Set JWT_SECRET in backend/.env.');
  }
}
```

**Kya hota hai:**
- Security checks hain
- Production deploy par default JWT_SECRET ya local db ki value error throw karegi
- CLIENT_ORIGIN must hai
- Dev mode me warning show karega agar secret default hai

**Line 37: Export**
```javascript
module.exports = { ...env, ensureEnv };
```

**Kya hota hai:**
- `env` object aur `ensureEnv` function dono export hota hai
- Server.js me inhe use kiya ja sakta hai

### Testing (Console/Response)
**Console expected (dev mode, default secret):**
```
Warning: using default JWT secret. Set JWT_SECRET in backend/.env.
```
**Console expected (missing CLIENT_ORIGIN):**
```
Error: CLIENT_ORIGIN is required.
```

---

## 3. Register Flow (Complete)

### Request Path: `POST /api/auth/register`

**Complete Flow:**
```
Frontend Request
  → authRoutes.js (route handler)
  → registerValidator (validation karta hai)
  → validateRequest (middleware)
  → authController.register
  → authService.registerUser
  → User Model (database save)
  → Token generate hota hai
  → Response milta hai
```

### Step 1: Route Definition
**File: `backend/src/routes/authRoutes.js`**

```javascript
// Line 9
router.post('/register', registerValidator, validateRequest, register);
```

**Kya hota hai:**
- Register api par request aati hai
- Pehle validation lagta hai (name, email, password)
- Validation errors, agar hain to yahin roka jata hai middleware se
- Sab sahi hai to register controller aage chalta hai

---

### Step 2: Validation
**File: `backend/src/validators/authValidators.js`**

```javascript
// Line 3-9
const registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password should be at least 6 characters long')
];
```

**Kya check hota hai:**
- name khali nahi hona chahiye
- email valid hona chahiye
- password min 6 chars hona chahiye

---

### Step 3: Validation Middleware
**File: `backend/src/middlewares/validateRequest.js`**

```javascript
// Line 4-16
function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0]?.msg || 'Validation failed',
      errors: errors.array()
    });
  }
  next();  // Agar validation sahi, to aage jao
}
```

**Kya hota hai:**
- Agar validation galat, to 400 error milta hai
- Sahi hai to next function par chala jata hai

---

### Step 4: Controller
**File: `backend/src/controllers/authController.js`**

```javascript
// Line 3-11
async function register(req, res, next) {
  try {
    const { name, email, password } = req.body; // Request data lete hain
    const result = await registerUser({ name, email, password }); // Service ko call karte hain
    res.status(201).json({ success: true, ...result }); // Response bhejte hain
  } catch (error) {
    next(error); // Error ko next (error handler) me bhej dete hain
  }
}
```

**Kya hota hai:**
- Request body se name, email, password extract karte hain
- Service function ko call karte hain
- Success par 201 status
- Error par error handler

---

### Step 5: Service Layer
**File: `backend/src/services/authService.js`**

```javascript
// Line 6-25
async function registerUser({ name, email, password }) {
  // Step 5.1: Check if user already exists
  const existing = await User.findOne({ email });
  if (existing) {
    const error = new Error('Email already registered');
    error.status = 400;
    throw error;
  }

  // Step 5.2: Hash password (security)
  const hashedPassword = await bcrypt.hash(password, 10);

  // Step 5.3: Create user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: 'user'  // Default role hai 'user'
  });

  // Step 5.4: Generate JWT token
  const token = generateToken(user._id);

  // Step 5.5: Return user (without password) and token
  return { user: sanitizeUser(user), token };
}
```

**Detailed Explanation:**

**Step 5.1 - Email Check:**
```javascript
const existing = await User.findOne({ email });
```
- Database me check hota hai user hai ya nahi. Hai to error.

**Step 5.2 - Password Hashing:**
```javascript
const hashedPassword = await bcrypt.hash(password, 10);
```
- Plain password ko hash karta hai (secure hai). 10 rounds lagte hain.

**Step 5.3 - User Creation:**
```javascript
const user = await User.create({ ... });
```
- Naya user create hota hai db me (role default user).

**Step 5.4 - Token Generation:**
```javascript
const token = generateToken(user._id);
```
- User id se JWT generate hota hai.

**Step 5.5 - Sanitize User:**
```javascript
function sanitizeUser(user) {
  const { _id, name, email, role, createdAt, updatedAt } = user;
  return { id: String(_id), name, email, role, createdAt, updatedAt };
}
```
- Password ko hata kar safe fields only return hoti hain

---

### Step 6: Token Generation
**File: `backend/src/utils/generateToken.js`**

```javascript
// Line 5-7
function generateToken(userId) {
  return jwt.sign({ id: userId }, env.jwtSecret, { expiresIn: '2h' });
}
```

**Kya hota hai:**
- JWT create hota hai with userId
- 2 ghante me expire hota hai
- env.jwtSecret use hota hai

---

### Step 7: User Model
**File: `backend/src/models/User.js`**

```javascript
// Line 3-11
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' }
  },
  { timestamps: true }  // createdAt, updatedAt automatic hai
);
```

**Kya hota hai:**
- User schema set hota hai
- email unique, required
- role sirf 'admin' ya 'user'
- timestamps: true se createdAt, updatedAt aata hai

---

### Final Response
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

### Testing (Console/Response)
**Request (register):**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"secret123"}'
```
**Response (201):**
```json
{ "success": true, "user": { "id": "...", "email": "john@example.com", "role": "user" }, "token": "..." }
```
**Validation error (example):**
```json
{ "success": false, "message": "Name is required" }
```

---

## 4. Login Flow (Complete)

### Request Path: `POST /api/auth/login`

**Complete Flow:**
```
Frontend Request
  → authRoutes.js (handler)
  → loginValidator (validation)
  → validateRequest (middleware)
  → authController.login
  → authService.loginUser
  → User Model se dhundna
  → Password compare (bcrypt)
  → Token generate
  → Response back
```

### Step 1: Route Definition
**File: `backend/src/routes/authRoutes.js`**

```javascript
// Line 10
router.post('/login', loginValidator, validateRequest, login);
```

---

### Step 2: Validation
**File: `backend/src/validators/authValidators.js`**

```javascript
// Line 11-14
const loginValidator = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];
```

**Kya check hota hai:**
- Email format valid ho
- Password khali nahi hona chahiye

---

### Step 3: Controller
**File: `backend/src/controllers/authController.js`**

```javascript
// Line 13-21
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await loginUser({ email, password });
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}
```

---

### Step 4: Service Layer
**File: `backend/src/services/authService.js`**

```javascript
// Line 28-45
async function loginUser({ email, password }) {
  // Step 4.1: Email dhundho
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }

  // Step 4.2: Password compare karo (hash ke saath)
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }

  // Step 4.3: Token generate karo
  const token = generateToken(user._id);

  // Step 4.4: Safe user + token return karo
  return { user: sanitizeUser(user), token };
}
```

**Detailed Explanation:**

**Step 4.1 - Find User:**
```javascript
const user = await User.findOne({ email });
```
- Database me email se dhundta hai. Nahi mila to error.

**Step 4.2 - Password Check:**
```javascript
const passwordMatch = await bcrypt.compare(password, user.password);
```
- Password match karta hai (bcrypt se). Nahin match to error.

**Step 4.3 & 4.4:**
- Token generate karke safe user return karta hai

---

### Final Response
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Testing (Console/Response)
**Request (login):**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"secret123"}'
```
**Response (200):**
```json
{ "success": true, "user": { "id": "...", "email": "john@example.com", "role": "user" }, "token": "..." }
```
**Invalid credentials (401):**
```json
{ "success": false, "message": "Invalid credentials" }
```

---

## 5. AI Flow (Complete)

### Request Path: `POST /api/ai/ask`

**Complete Flow:**
```
Frontend Request (with token)
  → aiRoutes.js (route handler)
  → authenticate (token verify)
  → authorizeRole('admin') (role check)
  → askValidator (validation)
  → validateRequest (middleware)
  → aiController.ask
  → aiService.askAi
  → Gemini API / ChatGPT API
  → Response back
```

### Step 1: Route Definition
**File: `backend/src/routes/aiRoutes.js`**

```javascript
// Line 9
router.post('/ask', authenticate, authorizeRole('admin'), askValidator, validateRequest, ask);
```

**Kya hota hai:**
- authenticate: Pehle token verify
- authorizeRole('admin'): Admin role check
- askValidator: Prompt validation
- validateRequest: Validation error handling
- ask: Controller function

---

### Step 2: Authentication Middleware
**File: `backend/src/middlewares/authMiddleware.js`**

```javascript
// Line 6-26
async function authenticate(req, res, next) {
  try {
    // Step 2.1: Header se token nikalo
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Missing token' });
    }

    // Step 2.2: Token extract karo
    const token = authHeader.split(' ')[1];

    // Step 2.3: Token verify karo
    const decoded = jwt.verify(token, env.jwtSecret);

    // Step 2.4: User db se lo
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    // Step 2.5: User attach to request
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}
```

**Detailed Explanation:**

**Step 2.1 - Get Token:**
```javascript
const authHeader = req.headers.authorization;
```
- Header me token aata hai ("Bearer ...")

**Step 2.2 - Extract Token:**
```javascript
const token = authHeader.split(' ')[1];
```
- "Bearer" ke baad ka token lete hai

**Step 2.3 - Verify Token:**
```javascript
const decoded = jwt.verify(token, env.jwtSecret);
```
- JWT ko verify karte hai

**Step 2.4 - Find User:**
```javascript
const user = await User.findById(decoded.id).select('-password');
```
- Token me id se user db se uthate hai

**Step 2.5 - Attach User:**
```javascript
req.user = user;
```
- User object ko req me attach kar dete hai

---

### Step 3: Role Authorization
**File: `backend/src/middlewares/authMiddleware.js`**

```javascript
// Line 29-36
function authorizeRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ success: false, message: 'Forbidden: insufficient role' });
    }
    next();
  };
}
```

**Kya hota hai:**
- req.user ka role check hota hai (admin chahiye)
- Nahi hai to 403 (forbidden)
- Sahi hai to next()

---

### Step 4: Validation
**File: `backend/src/validators/aiValidators.js`**

```javascript
// Line 3-5
const askValidator = [
  body('prompt').trim().notEmpty().withMessage('Prompt is required')
];
```

---

### Step 5: Controller
**File: `backend/src/controllers/aiController.js`**

```javascript
// Line 3-15
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
```

---

### Step 6: Service Layer
**File: `backend/src/services/aiService.js`**

```javascript
// Line 9-24
async function askAi(prompt) {
  const cleanPrompt = prompt.trim();

  // Step 6.1: Gemini try karo (agar api key hai)
  if (geminiClient) {
    const model = geminiClient.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(cleanPrompt);
    const text = result.response?.text?.() || 'No response';
    return text.trim();
  }

  // Step 6.2: ChatGPT fallback (agar api key hai)
  if (env.chatGptApiKey) {
    return askChatGpt(cleanPrompt);
  }

  // Step 6.3: Demo response (agar koi bhi api key nahi)
  return 'Demo response: add GEMINI_API_KEY or CHATGPT_API_KEY in backend/.env to get live AI answers.';
}
```

**Detailed Explanation:**

**Step 6.1 - Gemini API:**
```javascript
if (geminiClient) {
  const model = geminiClient.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const result = await model.generateContent(cleanPrompt);
  return result.response?.text?.() || 'No response';
}
```
- Gemini use karo agar hai

**Step 6.2 - ChatGPT Fallback:**
```javascript
if (env.chatGptApiKey) {
  return askChatGpt(cleanPrompt);
}
```
- Gemini not available to ChatGPT use ho jayega

**Step 6.3 - Demo Mode:**
- API key hi nahi to demo message aega

---

### ChatGPT Function
**File: `backend/src/services/aiService.js`**

```javascript
// Line 27-47
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
```

**Kya hota hai:**
- OpenAI ko POST request
- Prompt bhejte hain, response se answer nikalte hain

---

### Final Response
```json
{
  "success": true,
  "answer": "AI generated response here..."
}
```

### Testing (Console/Response)
**Request (ask AI):**
```bash
curl -X POST http://localhost:5000/api/ai/ask \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{"prompt":"Explain JWT in one line"}'
```
**Response (200):**
```json
{ "success": true, "answer": "..." }
```
**Missing/invalid token (401):**
```json
{ "success": false, "message": "Missing token" }
```

---

## 6. User Management Flows

### 5.1 Get All Users Flow
**Request Path: `GET /api/users`**

**Flow:**
```
Request (with token)
  → userRoutes.js
  → authenticate (token check)
  → authorizeRole('admin') (admin role)
  → userController.getAllUsers
  → userService.listUsers
  → User Model (sabhi find)
  → Response
```

**File: `backend/src/routes/userRoutes.js`**
```javascript
// Line 9
router.get('/', authenticate, authorizeRole('admin'), getAllUsers);
```

**File: `backend/src/controllers/userController.js`**
```javascript
// Line 3-10
async function getAllUsers(req, res, next) {
  try {
    const users = await listUsers();
    res.json({ success: true, users });
  } catch (error) {
    next(error);
  }
}
```

**File: `backend/src/services/userService.js`**
```javascript
// Line 5-8
async function listUsers() {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  return users.map((u) => sanitizeUser(u));
}
```

**Kya hota hai:**
- Sabhi users db se uthata hai
- Password hata ke return karta hai
- Latest users pehle (newest first)

---

### 5.2 Change Role Flow
**Request Path: `PATCH /api/users/:id/role`**

**Flow:**
```
Request (with token, body: { role: 'admin' })
  → userRoutes.js
  → authenticate
  → authorizeRole('admin')
  → updateRoleValidator (validation)
  → validateRequest
  → userController.changeRole
  → userService.updateUserRole
  → User Model (update)
  → Response
```

**File: `backend/src/routes/userRoutes.js`**
```javascript
// Line 10
router.patch('/:id/role', authenticate, authorizeRole('admin'), updateRoleValidator, validateRequest, changeRole);
```

**File: `backend/src/validators/userValidators.js`**
```javascript
// Line 3-6
const updateRoleValidator = [
  param('id').isMongoId().withMessage('Valid user id is required'),
  body('role').isIn(['admin', 'user']).withMessage('Role must be admin or user')
];
```

**File: `backend/src/controllers/userController.js`**
```javascript
// Line 12-31
async function changeRole(req, res, next) {
  try {
    const { id } = req.params;            // URL ka user id
    const { role } = req.body;            // Body se naya role
    const actingUserId = req.user._id || req.user.id;

    const user = await updateUserRole(id, role, actingUserId);
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
}
```

**File: `backend/src/services/userService.js`**
```javascript
// Line 10-27
async function updateUserRole(userId, role, actingUserId) {
  // Admin apna khud ka role change nahi kar sakta (lockout se bachne ke liye)
  if (userId === String(actingUserId)) {
    const error = new Error('Admins cannot change their own role here to avoid lockout.');
    error.status = 400;
    throw error;
  }

  // User ko dhundho
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  // Role update karo
  user.role = role;
  await user.save();

  return sanitizeUser(user);
}
```

**Kya hota hai:**
- Admin kisi ka role change kar sakta hai par apna nahi
- User ki id se find aur role update karta hai

---

### 5.3 Delete User Flow
**Request Path: `DELETE /api/users/:id`**

**Flow:**
```
Request (with token)
  → userRoutes.js
  → authenticate
  → authorizeRole('admin')
  → userIdParamValidator (validation)
  → validateRequest
  → userController.removeUser
  → userService.deleteUser
  → User Model (delete)
  → Response
```

**File: `backend/src/routes/userRoutes.js`**
```javascript
// Line 11
router.delete('/:id', authenticate, authorizeRole('admin'), userIdParamValidator, validateRequest, removeUser);
```

**File: `backend/src/controllers/userController.js`**
```javascript
// Line 33-42
async function removeUser(req, res, next) {
  try {
    const { id } = req.params;
    const actingUserId = req.user._id || req.user.id;
    await deleteUser(id, actingUserId);
    res.json({ success: true, deletedId: id });
  } catch (error) {
    next(error);
  }
}
```

**File: `backend/src/services/userService.js`**
```javascript
// Line 29-45
async function deleteUser(userId, actingUserId) {
  // Admin apna khud ka account delete nahi kar sakta
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
```

**Kya hota hai:**
- Admin user ko delete kar sakta hai par khud ko nahi
- User ko find karke delete karta hai

---

### 5.4 Get Current User (Me) Flow
**Request Path: `GET /api/auth/me`**

**Flow:**
```
Request (with token)
  → authRoutes.js
  → authenticate (token check, user attach)
  → authController.me
  → Response (req.user)
```

**File: `backend/src/routes/authRoutes.js`**
```javascript
// Line 11
router.get('/me', authenticate, me);
```

**File: `backend/src/controllers/authController.js`**
```javascript
// Line 23-27
async function me(req, res) {
  // req.user auth middleware set karta hai
  const safeUser = sanitizeUser(req.user);
  res.json({ success: true, user: safeUser });
}
```

**Kya hota hai:**
- Token check hoke user mil jata hai
- Password nahi bhejte, only safe fields

### Testing (Console/Response)
**Request (list users):**
```bash
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```
**Response (200):**
```json
{ "success": true, "users": [ { "id": "...", "email": "...", "role": "user" } ] }
```
**Request (change role):**
```bash
curl -X PATCH http://localhost:5000/api/users/<USER_ID>/role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{"role":"admin"}'
```
**Response (200):**
```json
{ "success": true, "user": { "id": "...", "role": "admin" } }
```
**Request (delete user):**
```bash
curl -X DELETE http://localhost:5000/api/users/<USER_ID> \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```
**Response (200):**
```json
{ "success": true, "deletedId": "<USER_ID>" }
```
**Request (me):**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <TOKEN>"
```
**Response (200):**
```json
{ "success": true, "user": { "id": "...", "email": "...", "role": "user" } }
```

---

## 7. Admin Seeding Flow

### File: `backend/src/utils/seedAdmin.js`

**Kya hota hai:**
- Server start par default admin user automatically create hota hai (agar absent ho)
- Agar already hai, kuch nahi karega
- Dev/test ke liye useful hai

**Complete Flow:**
```
Server Start
  → Database Connect
  → seedAdmin() called
  → Admin check hota hai
  → Absent ho to naya banata hai
  → Hai but role galat ho to correct karta hai
```

**Step-by-step:**

```javascript
// Line 1-3: Dependencies
const bcrypt = require('bcryptjs');
const User = require('../models/User');
```

**Line 4-40: Main Function**
```javascript
async function seedAdmin() {
  try {
    // Step 1: .env se credentials ya default use karo
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const adminName = process.env.ADMIN_NAME || 'Admin User';

    // Step 2: Pehle check karo admin hai ya nahi
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      // Step 3a: Admin hai but role nahi hai to update karo
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log(`✅ User ${adminEmail} promoted to admin`);
      } else {
        // Step 3b: Already admin to sirf log
        console.log(`ℹ️  Admin user ${adminEmail} already exists`);
      }
      return;
    }

    // Step 4: Admin nahi hai to naya bana lo
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const admin = await User.create({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: 'admin'
    });

    // Step 5: Console me admin credentials log kar do
    console.log('✅ Default admin user created');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('   ⚠️  Change password after first login!');
  } catch (error) {
    console.error('❌ Error seeding admin:', error.message);
  }
}
```

**Detailed Explanation:**

**Step 1 - Get Credentials:**
```javascript
const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
const adminName = process.env.ADMIN_NAME || 'Admin User';
```
- .env se, ya default values
- Dev/test me convenient

**Step 2 - Check Existing Admin:**
```javascript
const existingAdmin = await User.findOne({ email: adminEmail });
```
- DB me dekhta hai pehle se hai ya nahi

**Step 3a - Update Role:**
```javascript
if (existingAdmin.role !== 'admin') {
  existingAdmin.role = 'admin';
  await existingAdmin.save();
}
```
- Hai but role galat to update kar do

**Step 3b - Already Admin:**
```javascript
else {
  console.log(`ℹ️  Admin user ${adminEmail} already exists`);
}
```
- Admin user hai to kuch nahi

**Step 4 - Create New Admin:**
```javascript
const hashedPassword = await bcrypt.hash(adminPassword, 10);
const admin = await User.create({
  name: adminName,
  email: adminEmail,
  password: hashedPassword,
  role: 'admin'
});
```
- Password hash karke naya admin

**Step 5 - Log Credentials:**
```javascript
console.log('✅ Default admin user created');
console.log(`   Email: ${adminEmail}`);
console.log(`   Password: ${adminPassword}`);
```
- Console pe dikhata hai details (pehle login ke liye)

**Error Handling:**
```javascript
catch (error) {
  console.error('❌ Error seeding admin:', error.message);
}
```
- Error handling: sirf print, server start nahi rokta

**Where it's called:**
**File: `backend/src/config/db.js`**
```javascript
// Line 15
await seedAdmin();
```
- Jab db connect hota hai, tab call hota hai (auto admin create)

**Default Admin Credentials:**
- **Email:** `admin@example.com` (ya .env me ADMIN_EMAIL)
- **Password:** `admin123` (ya .env me ADMIN_PASSWORD)
- **Name:** `Admin User` (ya .env me ADMIN_NAME)

**Important Notes:**
- Production me strong password zaroor set karein .env me
- Default admin password turant badalna chahiye
- Admin delete ho jaye to agle server start par wapas ban jayega

### Testing (Console/Response)
**Console expected (first run):**
```
✅ Default admin user created
   Email: admin@example.com
   Password: admin123
```
**Console expected (already exists):**
```
ℹ️  Admin user admin@example.com already exists
```

---

## 8. Error Handling Flow

**File: `backend/src/middlewares/errorHandler.js`**

```javascript
// Line 2-13
function errorHandler(err, req, res, next) {
  console.error('Error handler caught:', err.message);
  console.error('Error stack:', err.stack);

  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal server error'
  });
}
```

**Kya hota hai:**
- Koi bhi error aye, sab kuch catch karta hai
- Status code error object se ya 500 by default
- Message bhi error ka, nahi to generic

**Example Error Responses:**

```json
// 400 Bad Request (validation error)
{
  "success": false,
  "message": "Name is required"
}

// 401 Unauthorized (invalid token)
{
  "success": false,
  "message": "Invalid or expired token"
}

// 403 Forbidden (insufficient role)
{
  "success": false,
  "message": "Forbidden: insufficient role"
}

// 500 Internal Server Error
{
  "success": false,
  "message": "Internal server error"
}
```

### Testing (Console/Response)
**Console expected:**
```
Error handler caught: Something went wrong
Error stack: ...
```
**Response (500):**
```json
{ "success": false, "message": "Something went wrong" }
```

---

## 9. Database Connection Flow

**File: `backend/src/config/db.js`**

```javascript
// Line 5-31
async function connectDb() {
  try {
    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    };

    await mongoose.connect(env.mongoUri, options);
    console.log('✅ Connected to MongoDB');

    await seedAdmin();  // Admin user create karne wala call (agar nahi hai)
  } catch (error) {
    // Error handling...
    throw new Error(errorMsg);
  }
}
```

**Kya hota hai:**
- MongoDB se connect hota hai
- succeed hua to seedAdmin call hota hai (admin auto create logic)

### Testing (Console/Response)
**Console expected (success):**
```
✅ Connected to MongoDB
```
**Console expected (failure):**
```
❌ Failed to connect to MongoDB: <error>
```

---

## 10. Summary

### Request Flow Pattern:
```
1. Route Definition (routes/*.js)
2. Middleware Chain:
   - authenticate (token verify)
   - authorizeRole (role check)
   - validator (data validation)
   - validateRequest (validation errors check)
3. Controller (controllers/*.js): request/response handling
4. Service (services/*.js): business logic (db, etc.)
5. Model (models/*.js): schema aur db ops
6. Response frontend ko jata hai
7. Error Handler (agar error aye)
```

### Key Points:
- **Routes**: URL path define karte hain
- **Validators**: Input data validate hota hai
- **Middlewares**: Auth, role, validation, etc.
- **Controllers**: Request receive/process/response
- **Services**: Logic – jaise password hash, tokens, db ops
- **Models**: Database schema aur queries
- **Error Handler**: Sab errors last me catch

### Testing (Console/Response)
**Quick check (auth-protected route without token):**
```json
{ "success": false, "message": "Missing token" }
```

---

**End of Document**
