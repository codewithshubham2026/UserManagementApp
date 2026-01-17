# Visual Learning Guide - User Management System
## Diagrams and Flowcharts for Beginners

---

## 1. System Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              USER'S BROWSER                                  │
│                                                                              │
│    ┌─────────────────────────────────────────────────────────────────────┐   │
│    │                    React Application                                │   │
│    │                    (Frontend - Port 5173)                           │   │
│    │                                                                     │   │
│    │   ┌──────────┐   ┌──────────┐   ┌──────────┐                        │   │
│    │   │  Login   │   │ Dashboard│   │  Admin   │                        │   │
│    │   │  Page    │   │   Page   │   │   Page   │                        │   │
│    │   └──────────┘   └──────────┘   └──────────┘                        │   │
│    │                                                                     │   │
│    │   ┌───────────────────────────────────────────────┐                 │   │
│    │   │         AuthContext (Global State)            │                 │   │
│    │   │   - user: { id, name, email, role }           │                 │   │
│    │   │   - token: "eyJhbGciOiJIUzI1NiIs..."          │                 │   │
│    │   └───────────────────────────────────────────────┘                 │   │
│    │                                                                     │   │
│    │   ┌───────────────────────────────────────────────┐                 │   │
│    │   │         API Client (Axios)                    │                 │   │
│    │   │   - baseURL: http://localhost:5000            │                 │   │
│    │   │   - Auto-adds Authorization header            │                 │   │
│    │   └───────────────────────────────────────────────┘                 │   │
│    └─────────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────┬──────────────────────────────────────────────┘
                                │
                                │ HTTP Requests (JSON)
                                │ GET /api/users
                                │ POST /api/auth/login
                                │ Authorization: Bearer <token>
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                           EXPRESS SERVER                                     │
│                           (Backend - Port 5000)                              │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐    │
│   │                        Middleware Stack                             │    │
│   │    1. CORS (Allow frontend)                                         │    │
│   │    2. express.json() (Parse JSON)                                   │    │
│   │    3. Routes                                                        │    │
│   │    4. Error Handler                                                 │    │
│   └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                       │
│   │  Auth Routes │  │  User Routes │  │  AI Routes   │                       │
│   │  /api/auth   │  │  /api/users  │  │  /api/ai     │                       │
│   └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                       │
│          │                 │                 │                               │
│          ▼                 ▼                 ▼                               │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                       │
│   │ Controllers  │  │ Controllers  │  │ Controllers  │                       │
│   │ - register   │  │ - getAllUsers│  │ - ask        │                       │
│   │ - login      │  │ - changeRole │  │              │                       │
│   │ - me         │  │ - deleteUser │  │              │                       │
│   └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                       │
│          │                 │                 │                               │
│          ▼                 ▼                 ▼                               │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                       │
│   │  Services    │  │  Services    │  │  Services    │                       │
│   │ - registerUser│ │ - listUsers  │  │ - askAi      │                       │
│   │ - loginUser   │ │ - updateRole │  │              │                       │
│   └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                       │
│          │                 │                 │                               │
│          └─────────────────┴─────────────────┘                               │
│                                │                                             │
│                                ▼                                             │
│                     ┌─────────────────────┐                                  │
│                     │  User Model         │                                  │
│                     │  (Mongoose)         │                                  │
│                     └─────────┬───────────┘                                  │
└───────────────────────────────┼──────────────────────────────────────────────┘
                                │
                                │ Database Queries
                                │ findOne(), create(), find()
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                              MONGODB DATABASE                               │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐    │
│   │                         users Collection                           │    │
│   │                                                                   │    │
│   │   {                                                              │    │
│   │     _id: ObjectId("65abcde123456789"),                            │    │
│   │     name: "John Doe",                                             │    │
│   │     email: "john@example.com",                                    │    │
│   │     password: "$2a$10$N9qo8uLOickgx2ZMRZoMye...",                 │    │
│   │     role: "admin",                                                │    │
│   │     createdAt: ISODate("2024-01-09T10:30:00Z"),                   │    │
│   │     updatedAt: ISODate("2024-01-09T10:30:00Z")                    │    │
│   │   }                                                               │    │
│   └─────────────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. User Registration Flow

```
┌─────────────┐
│   User      │
│  Fills Form │
└──────┬──────┘
       │
       │ 1. Types: name, email, password
       │
       ▼
┌─────────────────────┐
│   Register.jsx      │
│                     │
│  handleSubmit()     │
│  - Prevents default │
│  - Sets loading     │
└──────┬──────────────┘
       │
       │ 2. api.post('/api/auth/register', form)
       │
       ▼
┌─────────────────────┐
│     api.js          │
│                     │
│  Interceptor adds:  │
│  - baseURL          │
│  - Content-Type     │
└──────┬──────────────┘
       │
       │ 3. HTTP POST http://localhost:5000/api/auth/register
       │    Body: { name, email, password }
       │
       ▼
┌─────────────────────┐
│    server.js        │
│                     │
│  Express receives   │
│  request            │
└──────┬──────────────┘
       │
       │ 4. Routes to /api/auth
       │
       ▼
┌──────────────────────┐
│   authRoutes.js      │
│                      │
│  POST /register      │
│  Middleware chain:   │
│  1. registerValidator│
│  2. validateRequest  │
│  3. register         │
└──────┬───────────────┘
       │
       │ 5. Validation checks:
       │    - Email format valid?
       │    - Password ≥ 6 chars?
       │
       ▼
┌──────────────────────┐
│ authController.js    │
│                      │
│  register()          │
│  - Extracts data     │
│  - Calls service     │
└──────┬───────────────┘
       │
       │ 6. registerUser({ name, email, password })
       │
       ▼
┌──────────────────────┐
│  authService.js      │
│                      │
│  1. Check if email   │
│     exists           │
│  2. Hash password    │
│  3. Create user      │
│  4. Generate token   │
│  5. Return user +    │
│     token            │
└──────┬───────────────┘
       │
       │ 7. Database operations:
       │    - User.findOne({ email })
       │    - bcrypt.hash(password, 10)
       │    - User.create({ ... })
       │    - generateToken(userId)
       │
       ▼
┌──────────────────────┐
│     MongoDB          │
│                      │
│  Insert new user:    │
│  {                   │
│    name: "John",     │
│    email: "...",     │
│    password: "$2a$10$...",  (hashed!)
│    role: "user"      │
│  }                   │
└──────┬───────────────┘
       │
       │ 8. Response: { success: true, user: {...}, token: "..." }
       │
       ▼
┌─────────────────────┐
│   Register.jsx      │
│                     │
│  Receives response  │
│  - login(token, user)│
│  - navigate('/')    │
└──────┬──────────────┘
       │
       │ 9. Token saved to localStorage
       │    User state updated
       │    Redirect to Dashboard
       │
       ▼
┌──────────────────────┐
│   Dashboard.jsx      │
│                      │
│  ProtectedRoute      │
│  checks token → OK   │
│  Renders dashboard   │
└──────────────────────┘
```

---

## 3. User Login Flow

```
┌─────────────┐
│   User      │
│  Types      │
│  Credentials│
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│   Login.jsx         │
│                     │
│  handleSubmit()     │
│  api.post('/api/auth/login', { email, password }) │
└──────┬──────────────┘
       │
       │ HTTP POST /api/auth/login
       │
       ▼
┌─────────────────────┐
│   authRoutes.js     │
│                     │
│  POST /login        │
│  1. loginValidator  │
│  2. validateRequest │
│  3. login           │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ authController.js   │
│                     │
│  login()            │
│  Calls loginUser()  │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  authService.js     │
│                     │
│  1. Find user by    │
│     email           │
│  2. Compare password│
│     (bcrypt.compare)│
│  3. Generate token  │
│  4. Return user +   │
│     token           │
└──────┬──────────────┘
       │
       │ Database Query:
       │ User.findOne({ email: "john@example.com" })
       │
       │ Password Check:
       │ bcrypt.compare("secret123", "$2a$10$...")
       │ → true (match!)
       │
       ▼
┌──────────────────────┐
│     Response         │
│                      │
│  {                   │
│    success: true,    │
│    user: {           │
│      id: "...",      │
│      name: "John",   │
│      email: "...",   │
│      role: "user"    │
│    },                │
│    token: "eyJ..."   │
│  }                   │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│    Login.jsx         │
│                      │
│  login(token, user)  │
│  navigate('/')       │
└──────────────────────┘
```

---

## 4. Protected Route Flow

```
┌─────────────┐
│   User      │
│  Visits     │
│  /admin     │
└──────┬──────┘
       │
       ▼
┌──────────────────────┐
│    App.jsx           │
│                      │
│  <Route              │
│    path="/admin"     │
│    element={         │
│      <ProtectedRoute │
│        requireRole=  │
│        "admin">      │
│        <Admin />     │
│      </ProtectedRoute│
│    }                 │
│  />                  │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ ProtectedRoute.jsx   │
│                      │
│  const { user,       │
│          loading }   │
│    = useAuth()       │
└──────┬───────────────┘
       │
       │ Check 1: Is loading?
       │
       ├─ YES → Show "Loading session..."
       │
       ├─ NO → Check 2: Is user logged in?
       │
       │   ├─ NO → <Navigate to="/login" />
       │   │
       │   └─ YES → Check 3: Does user have required role?
       │         │
       │         ├─ NO → <Navigate to="/" />
       │         │      (Regular user trying to access admin)
       │         │
       │         └─ YES → Render <Admin />
       │                 (Admin user, all checks pass)
       │
       ▼
┌──────────────────────┐
│    Admin.jsx         │
│                      │
│  useEffect()         │
│  - Fetches users     │
│  - Renders UI        │
└──────────────────────┘
```

---

## 5. Authenticated Request Flow (Get Users)

```
┌─────────────┐
│   Admin     │
│  Page Loads │
└──────┬──────┘
       │
       ▼
┌──────────────────────┐
│    Admin.jsx         │
│                      │
│  useEffect(() => {   │
│    api.get('/api/users') │
│  }, [])              │
└──────┬───────────────┘
       │
       │ 1. api.get() called
       │
       ▼
┌──────────────────────┐
│     api.js           │
│                      │
│  Interceptor:        │
│  1. Get token from   │
│     localStorage     │
│  2. Add to header:   │
│     Authorization:   │
│     Bearer <token>   │
└──────┬───────────────┘
       │
       │ 2. HTTP GET /api/users
       │    Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
       │
       ▼
┌──────────────────────┐
│   server.js          │
│                      │
│  Express receives    │
│  request             │
└──────┬───────────────┘
       │
       │ 3. Routes to /api/users
       │
       ▼
┌──────────────────────┐
│   userRoutes.js      │
│                      │
│  GET /               │
│  Middleware:         │
│  1. authenticate     │
│  2. authorizeRole('admin') │
│  3. getAllUsers      │
└──────┬───────────────┘
       │
       │ 4. authenticate middleware
       │
       ▼
┌──────────────────────┐
│ authMiddleware.js    │
│                      │
│  1. Extract token    │
│     from header      │
│  2. jwt.verify()     │
│     - Decode token   │
│     - Check signature│
│     - Check expiry   │
│  3. Find user by ID  │
│  4. Attach to req.user │
└──────┬───────────────┘
       │
       │ 5. authorizeRole('admin')
       │
       ▼
┌──────────────────────┐
│ authMiddleware.js    │
│                      │
│  Check:              │
│  req.user.role === 'admin' │
│                      │
│  YES → Continue      │
│  NO  → 403 Forbidden │
└──────┬───────────────┘
       │
       │ 6. getAllUsers() controller
       │
       ▼
┌──────────────────────┐
│ userController.js    │
│                      │
│  getAllUsers()       │
│  Calls listUsers()   │
└──────┬───────────────┘
       │
       │ 7. listUsers() service
       │
       ▼
┌──────────────────────┐
│  userService.js      │
│                      │
│  User.find()         │
│  .select('-password')│
│  Returns all users   │
└──────┬───────────────┘
       │
       │ 8. Database Query:
       │    SELECT * FROM users
       │    (excluding passwords)
       │
       ▼
┌──────────────────────┐
│     MongoDB          │
│                      │
│  Returns:            │
│  [                   │
│    { id: "...", name: "John", ... }, │
│    { id: "...", name: "Jane", ... }  │
│  ]                   │
└──────┬───────────────┘
       │
       │ 9. Response: { success: true, users: [...] }
       │
       ▼
┌──────────────────────┐
│    Admin.jsx         │
│                      │
│  setUsers(data.users)│
│  Renders user list   │
└──────────────────────┘
```

---

## 6. Component Hierarchy

```
App.jsx
│
├── AuthProvider (Context)
│   │
│   └── BrowserRouter
│       │
│       ├── NavBar (Always visible)
│       │   │
│       │   ├── Link to "/"
│       │   ├── Link to "/admin" (if admin)
│       │   ├── Link to "/login" (if not logged in)
│       │   └── Logout button (if logged in)
│       │
│       └── main.container
│           │
│           └── Routes
│               │
│               ├── Route "/"
│               │   │
│               │   └── ProtectedRoute
│               │       │
│               │       └── Dashboard.jsx
│               │           │
│               │           └── Shows: Welcome message, user role
│               │
│               ├── Route "/login"
│               │   │
│               │   └── Login.jsx
│               │       │
│               │       ├── Form (email, password)
│               │       ├── Submit handler
│               │       └── Link to Register
│               │
│               ├── Route "/register"
│               │   │
│               │   └── Register.jsx
│               │       │
│               │       ├── Form (name, email, password)
│               │       ├── Submit handler
│               │       └── Link to Login
│               │
│               └── Route "/admin"
│                   │
│                   └── ProtectedRoute (requireRole="admin")
│                       │
│                       └── Admin.jsx
│                           │
│                           ├── User List Section
│                           │   ├── Fetch users on mount
│                           │   ├── Display users
│                           │   ├── Toggle role button
│                           │   └── Delete button
│                           │
│                           └── AI Chat Section
│                               ├── Textarea (prompt)
│                               ├── Submit button
│                               └── Display answer
```

---

## 7. State Management Flow

```
┌──────────────────────────────────────────────────────────────┐
│                AuthContext (Global State)                    │
│                                                              │
│  State Variables:                                            │
│   ┌───────────────────────────────────────────────────────┐ │
│   │ user: { id, name, email, role } | null               │ │
│   │ loading: true | false                                │ │
│   └───────────────────────────────────────────────────────┘ │
│                                                              │
│  Functions:                                                  │
│   ┌───────────────────────────────────────────────────────┐ │
│   │ login(token, userData)                               │ │
│   │   - localStorage.setItem('token', token)             │ │
│   │   - setUser(userData)                                │ │
│   │                                                     │ │
│   │ logout()                                            │ │
│   │   - localStorage.removeItem('token')                │ │
│   │   - setUser(null)                                   │ │
│   └───────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
                          │
                          │ Provides to all children
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  Login.jsx   │   │  NavBar.jsx  │   │  Admin.jsx   │
│              │   │              │   │              │
│  const {     │   │  const {     │   │  const {     │
│    login     │   │    user,     │   │    user      │
│  } = useAuth()│  │    logout    │   │  } = useAuth()│
│              │   │  } = useAuth()│  │              │
│              │   │              │   │              │
│  Calls:      │   │  Displays:   │   │  Uses:       │
│  login(token,│   │  - user.name │   │  - user.role │
│   user)      │   │  - Logout btn│   │    (check)   │
└──────────────┘   └──────────────┘   └──────────────┘
```

---

## 8. Middleware Execution Order

```
HTTP Request Arrives
        │
        ▼
┌───────────────────────┐
│  1. CORS Middleware   │
│     - Check origin    │
│     - Add CORS headers│
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│  2. express.json()    │
│     - Parse JSON body │
│     - Attach to req.body │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│  3. Route Matching    │
│     - Find route      │
│     - Execute route   │
│       middleware      │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│  Route Middleware     │
│  (e.g., /api/users)   │
│                       │
│  3a. authenticate     │
│      - Verify token   │
│      - Attach user    │
│                       │
│  3b. authorizeRole    │
│      - Check role     │
│                       │
│  3c. Controller       │
│      - Handle request │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│  4. Error Handler     │
│     (if error thrown) │
│     - Catch error     │
│     - Send response   │
└───────────────────────┘
            │
            ▼
      HTTP Response
```

---

## 9. Database Schema Visualization

```
┌────────────────────────────────────────────┐
│            users Collection                │
│         (MongoDB Document Store)           │
└────────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│   Document  │ │   Document  │ │   Document  │
│             │ │             │ │             │
│ _id:        │ │ _id:        │ │ _id:        │
│   ObjectId  │ │   ObjectId  │ │   ObjectId  │
│             │ │             │ │             │
│ name:       │ │ name:       │ │ name:       │
│   "John"    │ │   "Jane"    │ │   "Admin"   │
│             │ │             │ │             │
│ email:      │ │ email:      │ │ email:      │
│   "john@"   │ │   "jane@"   │ │   "admin@"  │
│             │ │             │ │             │
│ password:   │ │ password:   │ │ password:   │
│   "$2a$10$" │ │   "$2a$10$" │ │   "$2a$10$" │
│   (hashed)  │ │   (hashed)  │ │   (hashed)  │
│             │ │             │ │             │
│ role:       │ │ role:       │ │ role:       │
│   "user"    │ │   "user"    │ │   "admin"   │
│             │ │             │ │             │
│ createdAt:  │ │ createdAt:  │ │ createdAt:  │
│   Date      │ │   Date      │ │   Date      │
│             │ │             │ │             │
│ updatedAt:  │ │ updatedAt:  │ │ updatedAt:  │
│   Date      │ │   Date      │ │   Date      │
└─────────────┘ └─────────────┘ └─────────────┘
```

---

## 10. JWT Token Structure

```
┌───────────────────────────────────────────────────────────────┐
│                         JWT Token                            │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1YWJjZG      │
│ UxMjM0NTY3ODkiLCJpYXQiOjE3MDEyMzQ1Njd9.xyz123...             │
└───────────────────────────────────────────────────────────────┘
         │                   │                   │
         │                   │                   │
         ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   Header     │   │   Payload    │   │  Signature   │
│              │   │              │   │              │
│ {            │   │ {            │   │ HMAC SHA256  │
│   "alg":     │   │   "id":      │   │ (header +    │
│   "HS256",   │   │   "65abcde", │   │  payload +   │
│   "typ":     │   │   "iat":     │   │  secret)     │
│   "JWT"      │   │   1701234567 │   │              │
│ }            │   │ }            │   │              │
│              │   │              │   │              │
│ Base64       │   │ Base64       │   │ Base64       │
│ Encoded      │   │ Encoded      │   │ Encoded      │
└──────────────┘   └──────────────┘   └──────────────┘
```

**Decoded Payload Example:**
```json
{
  "id": "65abcde123456789",
  "iat": 1701234567,  // Issued at (timestamp)
  "exp": 1701241767   // Expires at (2 hours later)
}
```

---

## 11. Password Hashing Process

```
┌───────────────────────────────────────────────────────────────┐
│              Registration (Password Hashing)                 │
└───────────────────────────────────────────────────────────────┘

User Input: "secret123"
        │
        ▼
┌───────────────────────┐
│  bcrypt.hash()        │
│                       │
│  1. Generate salt     │
│     (random data)     │
│                       │
│  2. Combine:          │
│     salt + password   │
│                       │
│  3. Hash with SHA-256 │
│     (10 rounds)       │
│                       │
│  4. Format:           │
│     $2a$10$...        │
└───────────┬───────────┘
            │
            ▼
Stored in Database:
"$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
            │
            │ (One-way: Cannot reverse!)
            │
            ▼
┌───────────────────────────────────────────────────────────────┐
│              Login (Password Verification)                    │
└───────────────────────────────────────────────────────────────┘

User Input: "secret123"
        │
        ▼
┌───────────────────────┐
│  bcrypt.compare()     │
│                       │
│  1. Extract salt from │
│     stored hash       │
│                       │
│  2. Hash input with   │
│     same salt         │
│                       │
│  3. Compare hashes    │
│                       │
│  4. Return: true/false│
└───────────┬───────────┘
            │
            ▼
    Match? → Allow login
    No match → Reject
```

---

## 12. Error Handling Flow

```
┌───────────────────────────────────────────────────────────────┐
│                        Request Flow                          │
└───────────────────────────────────────────────────────────────┘

Controller throws error:
  throw new Error('User not found');
        │
        ▼
┌───────────────────────┐
│  Error Handler        │
│  Middleware           │
│                       │
│  1. Catch error       │
│  2. Log error         │
│  3. Get status code   │
│     (error.status or  │
│      default 500)     │
│  4. Send response     │
└───────────┬───────────┘
            │
            ▼
HTTP Response:
{
  "success": false,
  "message": "User not found"
}
Status: 400 (or 500)
            │
            ▼
┌───────────────────────┐
│   Frontend catches    │
│                       │
│  catch (err) {        │
│    setError(          │
│      err.response     │
│        .data.message  │
│    )                  │
│  }                    │
└───────────────────────┘
            │
            ▼
    Display error to user
```

---

## Quick Reference: HTTP Status Codes

```
200 OK              - Request successful
201 Created         - Resource created (registration)
400 Bad Request     - Invalid input (validation failed)
401 Unauthorized    - Not logged in / Invalid token
403 Forbidden       - Logged in but wrong role
404 Not Found       - Route doesn't exist
500 Internal Server - Server error (database, etc.)
```

---

## Quick Reference: File Purposes

### Backend Files:
- `server.js` - Entry point, starts server
- `config/db.js` - Database connection
- `config/env.js` - Environment variables
- `models/User.js` - Database schema
- `routes/*.js` - URL endpoints
- `controllers/*.js` - Request handlers
- `services/*.js` - Business logic
- `middlewares/*.js` - Security, validation
- `validators/*.js` - Input validation rules
- `utils/*.js` - Helper functions

### Frontend Files:
- `main.jsx` - Entry point, renders app
- `App.jsx` - Main component, routing
- `context/AuthContext.jsx` - Global auth state
- `pages/*.jsx` - Full page components
- `components/*.jsx` - Reusable UI pieces
- `api.js` - HTTP client setup
- `hooks/useAuth.js` - Custom hook for auth

---

This visual guide complements the detailed explanation in `COMPLETE_BEGINNER_GUIDE.md`. Use both together for comprehensive understanding!
