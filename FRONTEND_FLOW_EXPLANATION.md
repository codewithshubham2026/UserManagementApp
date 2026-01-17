# Frontend Flow Explanation (Hindi in English letters)

Ye document frontend ka complete flow explain karta hai – file by file, code by code (simple tareeke se). Iska format `BACKEND_FLOW_EXPLANATION.md` ke style jaisa hi rakha hai.

---

## 📋 Table of Contents
1. [Project Setup & Scripts](#1-project-setup--scripts)
2. [Entry Point Flow](#2-entry-point-flow)
3. [Routing & Layout Flow](#3-routing--layout-flow)
4. [API Layer Flow](#4-api-layer-flow)
5. [Auth Context Flow (Session Restore)](#5-auth-context-flow-session-restore)
6. [Register Flow (Complete)](#6-register-flow-complete)
7. [Login Flow (Complete)](#7-login-flow-complete)
8. [Protected Route Flow](#8-protected-route-flow)
9. [Dashboard Flow](#9-dashboard-flow)
10. [Admin Panel Flow (Users + AI)](#10-admin-panel-flow-users--ai)
11. [Confirm Modal Flow](#11-confirm-modal-flow)
12. [Styles & UI Files](#12-styles--ui-files)

---

## 1. Project Setup & Scripts

### File: `frontend/package.json`

**Kya hota hai:**
- React + Vite setup
- Scripts dev/build/preview
- Dependencies list

```json
{
  "name": "user-management-frontend",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext js,jsx"
  },
  "dependencies": {
    "axios": "^1.6.8",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.3"
  }
}
```

### File: `frontend/vite.config.js`

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  }
});
```

### File: `frontend/env.example`

```bash
VITE_API_BASE=http://localhost:5000
```

**Kya hota hai:**
- Frontend ko backend ka base URL milta hai
- Ye value `src/api.js` me use hoti hai

---

## 2. Entry Point Flow

### File: `frontend/index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>User Management</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

**Kya hota hai:**
- `#root` wahi container hai jahan React app render hota hai
- `main.jsx` app ka entry point hai

### File: `frontend/src/main.jsx`

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

**Flow:**
`index.html` → `main.jsx` → `App.jsx`

---

## 3. Routing & Layout Flow

### File: `frontend/src/App.jsx`

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
import commonStyles from './styles/common.module.css';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
     <section className={commonStyles.mainContainer}>
        <NavBar />
        <main className={commonStyles.container}>
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
        </section>
      </BrowserRouter>
    </AuthProvider>
  );
}
```

**Kya hota hai:**
- `AuthProvider` pure app ko auth state deta hai
- `BrowserRouter` routing handle karta hai
- `ProtectedRoute` se `/` aur `/admin` secure hain
- `NavBar` top navigation me dikhata hai

---

## 4. API Layer Flow

### File: `frontend/src/api.js`

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT to each request when available.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const baseURL = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
    if (!error.response) {
      if (error.message && (error.message.includes('CORS') || error.message.includes('cors'))) {
        error.response = {
          data: { 
            message: `CORS Error: The backend is blocking requests from this origin. 
Please check backend/.env CLIENT_ORIGIN matches: ${window.location.origin}
Current frontend URL: ${window.location.origin}` 
          },
          status: 0
        };
      } else if (error.code === 'ECONNREFUSED' || error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
        error.response = {
          data: { 
            message: `Cannot connect to server at ${baseURL}. 

Troubleshooting:
1. Verify backend is running: Check terminal for "🚀 Server running on port..."
2. Test connection: Open ${baseURL}/api/health in your browser
3. Check port: Backend should be on port 5000 (or check backend/.env PORT)
4. Check CORS: backend/.env CLIENT_ORIGIN should be: ${window.location.origin}
5. Restart both servers if needed` 
          },
          status: 0
        };
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

**Kya hota hai:**
- `baseURL` backend base set hota hai
- har request me token auto add hota hai
- errors ko human-friendly banaya gaya hai

---

## 5. Auth Context Flow (Session Restore)

### File: `frontend/src/context/AuthContext.jsx`

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

**Flow (Session Restore):**
App start → localStorage token check → `/api/auth/me` → user set → routes unlock

### File: `frontend/src/hooks/useAuth.js`

```javascript
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function useAuth() {
  return useContext(AuthContext);
}
```

**Kya hota hai:**
- `useAuth()` se kisi bhi component me `user`, `login`, `logout`, `loading` milta hai

---

## 6. Register Flow (Complete)

### File: `frontend/src/pages/Register.jsx`

```javascript
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import useAuth from '../hooks/useAuth';
import commonStyles from '../styles/common.module.css';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
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
      const { data } = await api.post('/api/auth/register', form);
      login(data.token, data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };
```

**Register Flow:**
Form fill → `handleSubmit` → `POST /api/auth/register` → token + user → `login()` → `/` redirect

---

## 7. Login Flow (Complete)

### File: `frontend/src/pages/Login.jsx`

```javascript
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import useAuth from '../hooks/useAuth';
import commonStyles from '../styles/common.module.css';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

**Login Flow:**
Email/Password → `POST /api/auth/login` → token + user → `login()` → `/` redirect

---

## 8. Protected Route Flow

### File: `frontend/src/components/ProtectedRoute.jsx`

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

**Kya hota hai:**
- User nahi to login page
- Role match nahi to home
- `loading` jab tak session restore ho

---

## 9. Dashboard Flow

### File: `frontend/src/pages/Dashboard.jsx`

```javascript
import React from 'react';
import useAuth from '../hooks/useAuth';
import commonStyles from '../styles/common.module.css';
import styles from './Admin.module.css';

export default function Dashboard() {
  const { user } = useAuth();
  return (
    <div className={commonStyles.card}>
      <h2 className={commonStyles.cardTitle}>Welcome Back! 👋</h2>
      <div style={{ marginTop: '1.5rem' }}>
        <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
          Hello, <strong style={{ color: 'var(--accent-2)' }}>{user?.name}</strong>!
        </p>
        <p style={{ marginBottom: '1rem' }}>
          Your role: <span className={`${styles.roleTag} ${user?.role === 'admin' ? styles.roleTagAdmin : styles.roleTagUser}`} style={{ display: 'inline-block', marginLeft: '0.5rem' }}>{user?.role}</span>
        </p>
        <p style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>
          This is your protected dashboard. You're successfully authenticated and can access your account features.
        </p>
      </div>
    </div>
  );
}
```

**Kya hota hai:**
- `useAuth()` se user details dikhte hain
- Admin ko extra note milta hai

---

## 10. Admin Panel Flow (Users + AI)

### File: `frontend/src/pages/Admin.jsx`

**Users list load:**
```javascript
useEffect(() => {
  async function fetchUsers() {
    try {
      const { data } = await api.get('/api/users');
      setUsers(data.users);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load users');
    } finally {
      setLoadingUsers(false);
    }
  }
  fetchUsers();
}, []);
```

**Role change flow:**
```javascript
const handleToggleRole = async (u) => {
  if (u.id === currentUser?.id) {
    setActionError('You cannot change your own role.');
    return;
  }

  const nextRole = u.role === 'admin' ? 'user' : 'admin';
  const userId = String(u.id).trim();

  const { data } = await api.patch(`/api/users/${userId}/role`, { role: nextRole });
  if (data.success && data.user) {
    setUsers((prev) => prev.map((item) => (item.id === u.id ? data.user : item)));
  }
};
```

**Delete user flow:**
```javascript
const handleDeleteConfirm = async () => {
  const u = deleteModal.user;
  const { data } = await api.delete(`/api/users/${u.id}`);
  if (data.success) {
    setUsers((prev) => prev.filter((item) => item.id !== u.id));
  }
};
```

**AI ask flow:**
```javascript
const handleAsk = async (e) => {
  e.preventDefault();
  if (!prompt.trim()) return;

  const currentPrompt = prompt.trim();
  const { data } = await api.post('/api/ai/ask', { prompt: currentPrompt });
  const aiAnswer = data.answer;
  setAnswer(aiAnswer);
  setPrompt('');
};
```

**Kya hota hai:**
- Admin page se user list aati hai (`GET /api/users`)
- Role change (`PATCH /api/users/:id/role`)
- Delete user (`DELETE /api/users/:id`)
- AI request (`POST /api/ai/ask`)
- Chat history last 5 prompts store hoti hai

---

## 11. Confirm Modal Flow

### File: `frontend/src/components/ConfirmModal.jsx`

```javascript
import React from 'react';
import styles from './ConfirmModal.module.css';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Yes', cancelText = 'No', type = 'danger' }) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{title}</h3>
          <button className={styles.modalClose} onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className={styles.modalBody}>
          <p className={styles.modalMessage}>{message}</p>
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.modalCancel} onClick={onClose}>
            {cancelText}
          </button>
          <button className={`${styles.modalConfirm} ${type === 'danger' ? styles.modalConfirmDanger : styles.modalConfirmPrimary}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Kya hota hai:**
- Delete action se pehle confirmation show hota hai
- Overlay click se modal close hota hai

---

## 12. Styles & UI Files

**Global styles:**
- `frontend/src/styles.css` → root theme variables, base styling

**Shared UI styles:**
- `frontend/src/styles/common.module.css` → cards, form inputs, buttons, loaders

**Page/Component CSS modules:**
- `frontend/src/pages/Admin.module.css`
- `frontend/src/components/NavBar.module.css`
- `frontend/src/components/ConfirmModal.module.css`

**Kya hota hai:**
- CSS Modules se class scope safe hota hai
- UI consistent rehta hai across pages

---

## ✅ Frontend Coverage Check (Summary)

Is document me frontend ke sab core files cover kiye gaye hain:
- Entry (`index.html`, `main.jsx`)
- Routing (`App.jsx`)
- API layer (`api.js`)
- Auth system (`AuthContext`, `useAuth`, `ProtectedRoute`)
- Pages (`Register`, `Login`, `Dashboard`, `Admin`)
- Components (`NavBar`, `ConfirmModal`)
- Styling files

---

**End of Document**
