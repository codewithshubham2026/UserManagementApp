# 🚀 Quick Reference Guide

A cheat sheet for common concepts, syntax, and patterns used in this MERN stack project.

---

## 📦 Package Purposes (Quick Lookup)

### Backend Packages
| Package | Purpose | Example Usage |
|---------|---------|---------------|
| `express` | Web framework | `app.get('/api/users', handler)` |
| `mongoose` | MongoDB ODM | `User.findOne({ email })` |
| `jsonwebtoken` | JWT tokens | `jwt.sign({ id }, secret)` |
| `bcryptjs` | Password hashing | `bcrypt.hash(password, 10)` |
| `express-validator` | Input validation | `body('email').isEmail()` |
| `cors` | Cross-origin requests | `app.use(cors({ origin: '...' }))` |
| `dotenv` | Environment variables | `process.env.PORT` |
| `axios` | HTTP client | `axios.post(url, data)` |

### Frontend Packages
| Package | Purpose | Example Usage |
|---------|---------|---------------|
| `react` | UI library | `<Component />` |
| `react-router-dom` | Routing | `<Route path="/" element={...} />` |
| `axios` | HTTP client | `api.get('/api/users')` |
| `vite` | Build tool | `npm run dev` |

---

## 🔑 Key Concepts

### RESTful API Methods
- **GET** - Read data (fetch)
- **POST** - Create data (register, login)
- **PATCH** - Update data (modify)
- **DELETE** - Remove data (delete)

### HTTP Status Codes
- **200** - Success
- **201** - Created
- **400** - Bad Request (validation error)
- **401** - Unauthorized (not logged in)
- **403** - Forbidden (not authorized)
- **404** - Not Found
- **500** - Server Error

### JWT Token Flow
1. User logs in → Server creates token
2. Token sent to frontend → Stored in localStorage
3. Frontend sends token in `Authorization: Bearer <token>` header
4. Backend verifies token → Extracts user ID
5. Request proceeds with user info

---

## 💻 Common Code Patterns

### Backend Patterns

#### Express Route
```javascript
router.post('/endpoint', middleware1, middleware2, controller);
```

#### Controller Function
```javascript
async function handler(req, res, next) {
  try {
    const data = req.body;
    const result = await serviceFunction(data);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}
```

#### Middleware Function
```javascript
function middleware(req, res, next) {
  // Do something
  if (error) {
    return res.status(400).json({ error: '...' });
  }
  next(); // Continue to next middleware
}
```

#### Mongoose Query
```javascript
// Find one
const user = await User.findOne({ email });

// Find by ID
const user = await User.findById(id);

// Create
const user = await User.create({ name, email, password });

// Update
await User.findByIdAndUpdate(id, { role: 'admin' });

// Delete
await User.findByIdAndDelete(id);
```

#### Password Hashing
```javascript
// Hash password
const hashed = await bcrypt.hash(password, 10);

// Compare password
const match = await bcrypt.compare(password, hashedPassword);
```

#### JWT Token
```javascript
// Generate token
const token = jwt.sign({ id: userId }, secret, { expiresIn: '2h' });

// Verify token
const decoded = jwt.verify(token, secret);
```

#### Validation
```javascript
const validator = [
  body('email').isEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 6 }).withMessage('Too short')
];
```

---

### Frontend Patterns

#### React Component
```javascript
import React, { useState } from 'react';

export default function Component() {
  const [state, setState] = useState(initialValue);
  
  return <div>Content</div>;
}
```

#### useState Hook
```javascript
const [value, setValue] = useState(initialValue);

// Update
setValue(newValue);
setValue(prev => prev + 1); // Functional update
```

#### useEffect Hook
```javascript
// Run once on mount
useEffect(() => {
  // Code here
}, []);

// Run when dependency changes
useEffect(() => {
  // Code here
}, [dependency]);

// Cleanup
useEffect(() => {
  const timer = setInterval(() => {}, 1000);
  return () => clearInterval(timer); // Cleanup
}, []);
```

#### Form Handling
```javascript
const [form, setForm] = useState({ email: '', password: '' });

const handleChange = (e) => {
  setForm({ ...form, [e.target.name]: e.target.value });
};

const handleSubmit = async (e) => {
  e.preventDefault();
  await api.post('/api/endpoint', form);
};
```

#### API Call
```javascript
// GET
const { data } = await api.get('/api/users');

// POST
const { data } = await api.post('/api/auth/login', { email, password });

// With error handling
try {
  const { data } = await api.get('/api/users');
} catch (error) {
  console.error(error.response?.data?.message);
}
```

#### Context Usage
```javascript
// In component
const { user, login, logout } = useAuth();
```

#### Navigation
```javascript
import { useNavigate, Link } from 'react-router-dom';

const navigate = useNavigate();
navigate('/dashboard'); // Programmatic navigation

<Link to="/login">Login</Link> // Link component
```

#### Protected Route
```javascript
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>

<ProtectedRoute requireRole="admin">
  <Admin />
</ProtectedRoute>
```

---

## 🗂️ File Structure Reference

### Backend Structure
```
backend/src/
├── server.js           # Entry point, Express app setup
├── config/
│   ├── db.js          # MongoDB connection
│   └── env.js         # Environment variables
├── models/
│   └── User.js        # User schema
├── routes/
│   ├── authRoutes.js  # Authentication routes
│   ├── userRoutes.js  # User management routes
│   └── aiRoutes.js    # AI routes
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   └── aiController.js
├── services/
│   ├── authService.js
│   ├── userService.js
│   └── aiService.js
├── middlewares/
│   ├── authMiddleware.js    # JWT verification
│   ├── errorHandler.js      # Error handling
│   └── validateRequest.js   # Validation check
├── validators/
│   ├── authValidators.js
│   ├── userValidators.js
│   └── aiValidators.js
└── utils/
    └── generateToken.js
```

### Frontend Structure
```
frontend/src/
├── main.jsx           # Entry point
├── App.jsx            # Main app component, routes
├── api.js             # Axios setup
├── components/
│   ├── NavBar.jsx
│   └── ProtectedRoute.jsx
├── context/
│   └── AuthContext.jsx
├── hooks/
│   └── useAuth.js
└── pages/
    ├── Login.jsx
    ├── Register.jsx
    ├── Dashboard.jsx
    └── Admin.jsx
```

---

## 🔄 Request Flow Reference

### Complete Request Flow
```
1. User Action (click button, submit form)
   ↓
2. Frontend Component (handleSubmit, onClick)
   ↓
3. API Call (api.post/get/delete)
   ↓
4. Axios Interceptor (adds token to header)
   ↓
5. HTTP Request (sent to backend)
   ↓
6. Backend Server (server.js receives)
   ↓
7. Middleware Chain:
   - CORS
   - express.json()
   - Route matching
   ↓
8. Route Handler (routes/authRoutes.js)
   ↓
9. Validation Middleware (validators)
   ↓
10. Authentication Middleware (if protected)
    ↓
11. Authorization Middleware (if role required)
    ↓
12. Controller (controllers/authController.js)
    ↓
13. Service (services/authService.js)
    ↓
14. Database (MongoDB via Mongoose)
    ↓
15. Response (JSON sent back)
    ↓
16. Frontend receives response
    ↓
17. Component updates state
    ↓
18. UI re-renders
```

---

## 🛠️ Common Tasks

### Add a New Route

**Backend:**
```javascript
// routes/newRoutes.js
const router = express.Router();
router.get('/endpoint', controller);
module.exports = router;

// server.js
app.use('/api/new', newRoutes);
```

**Frontend:**
```javascript
// App.jsx
<Route path="/new-page" element={<NewPage />} />
```

### Add a New Protected Route

**Backend:**
```javascript
router.get('/protected', authenticate, controller);
router.get('/admin-only', authenticate, authorizeRole('admin'), controller);
```

**Frontend:**
```javascript
<Route path="/protected" element={
  <ProtectedRoute>
    <ProtectedPage />
  </ProtectedRoute>
} />
```

### Add Form Validation

**Backend:**
```javascript
const validator = [
  body('field').notEmpty().withMessage('Required'),
  body('email').isEmail().withMessage('Invalid email')
];
router.post('/endpoint', validator, validateRequest, controller);
```

**Frontend:**
```javascript
const [error, setError] = useState('');
// In handleSubmit
try {
  await api.post('/api/endpoint', data);
} catch (err) {
  setError(err.response?.data?.message);
}
```

### Access Current User

**Backend:**
```javascript
// In controller (after authenticate middleware)
const user = req.user;
```

**Frontend:**
```javascript
const { user } = useAuth();
```

### Make Authenticated API Call

**Frontend:**
```javascript
// Token automatically added by interceptor
const { data } = await api.get('/api/protected-endpoint');
```

### Hash Password

```javascript
const hashedPassword = await bcrypt.hash(password, 10);
```

### Compare Password

```javascript
const match = await bcrypt.compare(plainPassword, hashedPassword);
```

### Generate JWT Token

```javascript
const token = jwt.sign({ id: userId }, secret, { expiresIn: '2h' });
```

### Verify JWT Token

```javascript
const decoded = jwt.verify(token, secret);
const userId = decoded.id;
```

---

## 🐛 Common Errors & Solutions

### "Cannot GET /api/..."
- **Cause**: Route not defined or wrong path
- **Solution**: Check route definition in routes file and mounting in server.js

### "Missing token" or "Invalid token"
- **Cause**: Not logged in or token expired
- **Solution**: Login again to get new token

### "CORS error"
- **Cause**: Backend not allowing frontend origin
- **Solution**: Check CORS configuration in server.js and CLIENT_ORIGIN in .env

### "Email already registered"
- **Cause**: User with that email exists
- **Solution**: Use different email or login instead

### "Invalid credentials"
- **Cause**: Wrong email or password
- **Solution**: Check credentials or reset password

### "Forbidden: insufficient role"
- **Cause**: User doesn't have required role (admin)
- **Solution**: User needs admin role

### React: "Cannot read property of undefined"
- **Cause**: Accessing property before data loads
- **Solution**: Use optional chaining: `user?.name` or check if exists

### "Module not found"
- **Cause**: Package not installed or wrong import path
- **Solution**: Run `npm install` or check import path

---

## 📝 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/user_management
JWT_SECRET=your-secret-key-here
CLIENT_ORIGIN=http://localhost:5173
CHATGPT_API_KEY=your-api-key
CHATGPT_MODEL=gpt-3.5-turbo
```

### Frontend (.env)
```env
VITE_API_BASE=http://localhost:5000
```

---

## 🎯 NPM Commands

### Backend
```bash
npm start        # Production mode
npm run dev      # Development mode (with nodemon)
npm run lint     # Check code quality
```

### Frontend
```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # Check code quality
```

---

## 📚 Useful Resources

- **MongoDB Docs**: https://www.mongodb.com/docs/
- **Express Docs**: https://expressjs.com/
- **React Docs**: https://react.dev/
- **Mongoose Docs**: https://mongoosejs.com/docs/
- **JWT.io**: https://jwt.io/ (decode tokens)
- **Postman**: https://www.postman.com/ (API testing)

---

## 💡 Pro Tips

1. **Always check console** for errors
2. **Use Postman** to test API endpoints
3. **Add console.logs** to trace data flow
4. **Check network tab** in browser DevTools
5. **Read error messages** carefully
6. **Test with different user roles**
7. **Test error scenarios** (wrong password, expired token, etc.)
8. **Use optional chaining** (`user?.name`) to avoid errors
9. **Validate on both frontend and backend**
10. **Never commit .env files** to git

---

**Keep this guide handy while coding!** 📌
