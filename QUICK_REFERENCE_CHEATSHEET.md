# Quick Reference Cheat Sheet
## User Management System - Code Snippets & Patterns

---

## 🔧 Backend Patterns

### 1. Creating a Route

```javascript
// routes/exampleRoutes.js
const express = require('express');
const { exampleController } = require('../controllers/exampleController');
const { authenticate } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/example', authenticate, exampleController);
module.exports = router;
```

### 2. Creating a Controller

```javascript
// controllers/exampleController.js
async function exampleController(req, res, next) {
  try {
    // Your logic here
    const result = await someService();
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);  // Pass to error handler
  }
}

module.exports = { exampleController };
```

### 3. Creating a Service

```javascript
// services/exampleService.js
const Model = require('../models/Model');

async function someService() {
  const data = await Model.find();
  return data;
}

module.exports = { someService };
```

### 4. Creating a Model

```javascript
// models/Example.js
const mongoose = require('mongoose');

const exampleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Example', exampleSchema);
```

### 5. Creating a Validator

```javascript
// validators/exampleValidators.js
const { body } = require('express-validator');

const exampleValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required')
];

module.exports = { exampleValidator };
```

### 6. Using Validator in Route

```javascript
router.post('/example', 
  exampleValidator,      // 1. Validate
  validateRequest,       // 2. Check validation results
  exampleController      // 3. Handle request
);
```

### 7. Password Hashing

```javascript
const bcrypt = require('bcryptjs');

// Hash password
const hashedPassword = await bcrypt.hash(password, 10);

// Compare password
const isMatch = await bcrypt.compare(inputPassword, storedHash);
```

### 8. JWT Token Generation

```javascript
const jwt = require('jsonwebtoken');
const env = require('../config/env');

function generateToken(userId) {
  return jwt.sign({ id: userId }, env.jwtSecret, { expiresIn: '2h' });
}
```

### 9. JWT Token Verification

```javascript
const token = req.headers.authorization.split(' ')[1];
const decoded = jwt.verify(token, env.jwtSecret);
const userId = decoded.id;
```

### 10. Error Handling

```javascript
// In service/controller
const error = new Error('User not found');
error.status = 404;
throw error;

// Error handler middleware catches it automatically
```

### 11. Database Queries

```javascript
// Find one
const user = await User.findOne({ email });

// Find by ID
const user = await User.findById(id);

// Find all
const users = await User.find();

// Create
const user = await User.create({ name, email, password });

// Update
user.name = 'New Name';
await user.save();

// Delete
await user.deleteOne();
```

### 12. Excluding Fields

```javascript
// Exclude password
const user = await User.findById(id).select('-password');

// Select specific fields
const user = await User.findById(id).select('name email role');
```

---

## ⚛️ Frontend Patterns

### 1. Creating a Component

```javascript
// components/Example.jsx
import React from 'react';

export default function Example() {
  return <div>Hello World</div>;
}
```

### 2. Using State

```javascript
import { useState } from 'react';

function Example() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

### 3. Using useEffect

```javascript
import { useEffect, useState } from 'react';

function Example() {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    // Runs on component mount
    fetchData();
  }, []);  // Empty array = run once
  
  return <div>{/* ... */}</div>;
}
```

### 4. Making API Calls

```javascript
import api from '../api';

// GET request
const { data } = await api.get('/api/users');

// POST request
const { data } = await api.post('/api/auth/login', { email, password });

// PATCH request
const { data } = await api.patch(`/api/users/${id}/role`, { role: 'admin' });

// DELETE request
await api.delete(`/api/users/${id}`);
```

### 5. Handling Errors

```javascript
try {
  const { data } = await api.get('/api/users');
  setUsers(data.users);
} catch (err) {
  setError(err.response?.data?.message || 'Something went wrong');
}
```

### 6. Using Auth Context

```javascript
import useAuth from '../hooks/useAuth';

function Example() {
  const { user, login, logout, loading } = useAuth();
  
  if (loading) return <p>Loading...</p>;
  if (!user) return <p>Please login</p>;
  
  return <div>Welcome, {user.name}!</div>;
}
```

### 7. Form Handling

```javascript
const [form, setForm] = useState({ email: '', password: '' });

const handleChange = (e) => {
  setForm({ ...form, [e.target.name]: e.target.value });
};

const handleSubmit = async (e) => {
  e.preventDefault();
  // Submit form
};

return (
  <form onSubmit={handleSubmit}>
    <input 
      name="email" 
      value={form.email} 
      onChange={handleChange} 
    />
  </form>
);
```

### 8. Conditional Rendering

```javascript
// If condition
{user && <div>Welcome, {user.name}</div>}

// If-else
{user ? <Dashboard /> : <Login />}

// Multiple conditions
{loading && <p>Loading...</p>}
{error && <p className="error">{error}</p>}
{!loading && !error && <div>Content</div>}
```

### 9. Navigation

```javascript
import { useNavigate, Link } from 'react-router-dom';

function Example() {
  const navigate = useNavigate();
  
  // Programmatic navigation
  const handleClick = () => {
    navigate('/dashboard');
  };
  
  // Link component
  return <Link to="/dashboard">Go to Dashboard</Link>;
}
```

### 10. Protected Route

```javascript
import ProtectedRoute from '../components/ProtectedRoute';

// In App.jsx
<Route 
  path="/admin" 
  element={
    <ProtectedRoute requireRole="admin">
      <Admin />
    </ProtectedRoute>
  } 
/>
```

---

## 🔐 Authentication Patterns

### Backend: Protect Route

```javascript
// Require login
router.get('/protected', authenticate, controller);

// Require admin role
router.get('/admin', authenticate, authorizeRole('admin'), controller);
```

### Frontend: Check Auth

```javascript
const { user, loading } = useAuth();

if (loading) return <p>Loading...</p>;
if (!user) return <Navigate to="/login" />;
if (user.role !== 'admin') return <Navigate to="/" />;
```

### Frontend: Login Flow

```javascript
const handleLogin = async (email, password) => {
  try {
    const { data } = await api.post('/api/auth/login', { email, password });
    login(data.token, data.user);  // Save token, update state
    navigate('/');  // Redirect
  } catch (err) {
    setError(err.response?.data?.message);
  }
};
```

---

## 📝 Common Code Patterns

### 1. Loading State

```javascript
// Backend: Not needed (synchronous)

// Frontend:
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setLoading(true);
  try {
    await api.post('/api/endpoint');
  } finally {
    setLoading(false);
  }
};

return <button disabled={loading}>{loading ? 'Loading...' : 'Submit'}</button>;
```

### 2. Error State

```javascript
// Backend:
const error = new Error('Something went wrong');
error.status = 400;
throw error;

// Frontend:
const [error, setError] = useState('');

try {
  await api.post('/api/endpoint');
} catch (err) {
  setError(err.response?.data?.message || 'Error occurred');
}

return error && <p className="error">{error}</p>;
```

### 3. Success Message

```javascript
const [success, setSuccess] = useState('');

const handleSubmit = async () => {
  try {
    await api.post('/api/endpoint');
    setSuccess('Operation successful!');
    setTimeout(() => setSuccess(''), 3000);  // Clear after 3s
  } catch (err) {
    // Handle error
  }
};

return success && <p className="success">{success}</p>;
```

### 4. Form Validation (Frontend)

```javascript
const [errors, setErrors] = useState({});

const validate = () => {
  const newErrors = {};
  if (!form.email) newErrors.email = 'Email required';
  if (!form.password) newErrors.password = 'Password required';
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const handleSubmit = (e) => {
  e.preventDefault();
  if (validate()) {
    // Submit
  }
};
```

### 5. List Rendering

```javascript
const [items, setItems] = useState([]);

return (
  <ul>
    {items.map(item => (
      <li key={item.id}>{item.name}</li>
    ))}
  </ul>
);
```

### 6. Filter/Search

```javascript
const [search, setSearch] = useState('');
const [allUsers, setAllUsers] = useState([]);

const filteredUsers = allUsers.filter(user =>
  user.name.toLowerCase().includes(search.toLowerCase())
);

return (
  <input 
    value={search} 
    onChange={(e) => setSearch(e.target.value)} 
    placeholder="Search..."
  />
);
```

---

## 🗄️ Database Patterns

### Create

```javascript
const user = await User.create({
  name: 'John',
  email: 'john@example.com',
  password: hashedPassword
});
```

### Read

```javascript
// Find one
const user = await User.findOne({ email: 'john@example.com' });

// Find by ID
const user = await User.findById(userId);

// Find all
const users = await User.find();

// Find with conditions
const admins = await User.find({ role: 'admin' });
```

### Update

```javascript
// Method 1: Find then save
const user = await User.findById(userId);
user.name = 'New Name';
await user.save();

// Method 2: Find and update
await User.findByIdAndUpdate(userId, { name: 'New Name' });
```

### Delete

```javascript
// Method 1: Find then delete
const user = await User.findById(userId);
await user.deleteOne();

// Method 2: Find and delete
await User.findByIdAndDelete(userId);
```

### Sorting

```javascript
// Sort by createdAt (newest first)
const users = await User.find().sort({ createdAt: -1 });

// Sort by name (A-Z)
const users = await User.find().sort({ name: 1 });
```

---

## 🔄 Async/Await Patterns

### Basic

```javascript
async function fetchData() {
  const data = await api.get('/api/data');
  return data;
}
```

### Error Handling

```javascript
async function fetchData() {
  try {
    const data = await api.get('/api/data');
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
```

### Multiple Requests

```javascript
// Sequential (one after another)
const user = await api.get('/api/user');
const posts = await api.get('/api/posts');

// Parallel (at the same time)
const [user, posts] = await Promise.all([
  api.get('/api/user'),
  api.get('/api/posts')
]);
```

---

## 🎨 React Patterns

### Props

```javascript
// Parent
<ChildComponent name="John" age={25} />

// Child
function ChildComponent({ name, age }) {
  return <div>{name} is {age} years old</div>;
}
```

### State Lifting

```javascript
// Parent manages state
function Parent() {
  const [count, setCount] = useState(0);
  return <Child count={count} setCount={setCount} />;
}

// Child uses state
function Child({ count, setCount }) {
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### Custom Hooks

```javascript
// hooks/useCounter.js
function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);
  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);
  return { count, increment, decrement };
}

// Usage
const { count, increment, decrement } = useCounter(10);
```

---

## 🛠️ Environment Variables

### Backend (.env)

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/user_management
JWT_SECRET=your-secret-key-here
CLIENT_ORIGIN=http://localhost:5173
GEMINI_API_KEY=your-key-here
CHATGPT_API_KEY=your-key-here
```

### Frontend (.env)

```env
VITE_API_BASE=http://localhost:5000
```

### Accessing in Code

```javascript
// Backend
const port = process.env.PORT;

// Frontend
const apiBase = import.meta.env.VITE_API_BASE;
```

---

## 📦 Import/Export Patterns

### CommonJS (Backend)

```javascript
// Export
module.exports = { functionName };
module.exports = functionName;

// Import
const { functionName } = require('./file');
const functionName = require('./file');
```

### ES6 Modules (Frontend)

```javascript
// Export
export default Component;
export { functionName };
export const constant = 'value';

// Import
import Component from './Component';
import { functionName } from './utils';
import { constant } from './constants';
```

---

## 🚀 Common Commands

### Backend

```bash
npm install          # Install dependencies
npm run dev          # Start development server (with nodemon)
npm start            # Start production server
npm run lint         # Check code quality
```

### Frontend

```bash
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Check code quality
```

---

## 🐛 Debugging Tips

### Backend

```javascript
// Console logging
console.log('Variable:', variable);
console.log('Request body:', req.body);
console.log('User:', req.user);

// Error logging
console.error('Error:', error);
```

### Frontend

```javascript
// Console logging
console.log('State:', state);
console.log('Props:', props);

// React DevTools
// Install browser extension for component inspection
```

### Network Debugging

```javascript
// Check request/response
console.log('Request:', config);
console.log('Response:', response.data);
```

---

## ✅ Best Practices Checklist

### Backend
- [ ] Always hash passwords
- [ ] Validate all inputs
- [ ] Use environment variables for secrets
- [ ] Handle errors gracefully
- [ ] Use middleware for common tasks
- [ ] Sanitize user data before sending
- [ ] Use proper HTTP status codes

### Frontend
- [ ] Handle loading states
- [ ] Show error messages
- [ ] Validate forms
- [ ] Use controlled components
- [ ] Clean up useEffect (if needed)
- [ ] Handle async errors
- [ ] Use meaningful variable names

---

## 📚 Key Concepts Quick Reference

### JWT Token
- Contains user ID and expiration
- Signed with secret (prevents tampering)
- Stored in localStorage (frontend)
- Sent in Authorization header

### Password Hashing
- One-way encryption (can't reverse)
- Uses bcrypt with salt
- Compare hashes, not plain text

### Middleware
- Functions that run between request and response
- Can modify request, check auth, validate
- Executes in order

### Context API
- Global state management
- Avoids prop drilling
- Use for truly global data (auth, theme)

### Protected Routes
- Check authentication before rendering
- Redirect if not logged in
- Can check roles for admin pages

---

This cheat sheet is a quick reference. For detailed explanations, see `COMPLETE_BEGINNER_GUIDE.md`!
