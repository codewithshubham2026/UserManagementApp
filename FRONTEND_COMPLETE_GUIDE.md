# Frontend Project Complete Flow & Teaching Guide

## Table of Contents
1. [Project Architecture Overview](#project-architecture-overview)
2. [File Structure & Logic Flow](#file-structure--logic-flow)
3. [Complete Component Breakdown](#complete-component-breakdown)
4. [User Flows & Interactions](#user-flows--interactions)
5. [API Integration & State Management](#api-integration--state-management)
6. [Routing & Navigation](#routing--navigation)
7. [Styling & UI Components](#styling--ui-components)
8. [Testing Guide](#testing-guide)
9. [Common Issues & Solutions](#common-issues--solutions)

---

## Project Architecture Overview

### Technology Stack
- **Framework**: React 18.2.0
- **Build Tool**: Vite 5.2.0
- **Routing**: React Router DOM 6.22.3
- **HTTP Client**: Axios 1.6.8
- **Styling**: CSS Modules + Global CSS

### Architecture Pattern
- **Component-Based**: Reusable, isolated components
- **Context API**: Global state management (authentication)
- **Custom Hooks**: Reusable logic (useAuth)
- **Protected Routes**: Route guards for authentication/authorization
- **API Layer**: Centralized API configuration with interceptors

### Key Concepts for Students
1. **React Hooks**: useState, useEffect, useContext
2. **React Router**: Navigation, protected routes
3. **Context API**: Global state sharing
4. **Axios Interceptors**: Request/response handling
5. **CSS Modules**: Scoped styling
6. **Form Handling**: Controlled components
7. **Error Handling**: User-friendly error messages

---

## File Structure & Logic Flow

### Complete File Structure

```
frontend/
├── package.json              # Dependencies and scripts
├── vite.config.js            # Vite build configuration
├── env.example               # Environment variables template
├── index.html                # HTML entry point
└── src/
    ├── main.jsx              # React entry point
    ├── App.jsx               # Main app component (routing)
    ├── api.js                # Axios configuration
    ├── styles.css            # Global styles
    ├── context/
    │   └── AuthContext.jsx   # Authentication context provider
    ├── hooks/
    │   └── useAuth.js        # Custom hook for auth context
    ├── components/
    │   ├── NavBar.jsx        # Navigation bar
    │   ├── NavBar.module.css
    │   ├── ProtectedRoute.jsx # Route guard component
    │   ├── ConfirmModal.jsx  # Confirmation dialog
    │   └── ConfirmModal.module.css
    └── pages/
        ├── Login.jsx         # Login page
        ├── Register.jsx      # Registration page
        ├── Dashboard.jsx     # User dashboard
        ├── Admin.jsx         # Admin panel
        └── Admin.module.css
    └── styles/
        └── common.module.css # Shared styles
```

---

## Complete Component Breakdown

### 1. Entry Point: `src/main.jsx`

**Purpose**: React application bootstrap

**Code Flow**:
```javascript
1. Import React and ReactDOM
2. Import App component
3. Get root element from DOM
4. Render App inside React.StrictMode
5. StrictMode helps catch bugs in development
```

**Key Points**:
- `React.StrictMode` enables additional checks in development
- `createRoot` is the modern React 18 way to render
- This is the first file that runs when the app loads

---

### 2. API Configuration: `src/api.js`

**Purpose**: Centralized HTTP client setup with interceptors

**Logic Flow**:
```
1. Create Axios instance with base URL
2. Request Interceptor:
   - Check localStorage for token
   - Attach token to Authorization header
   - Format: "Bearer <token>"
3. Response Interceptor:
   - Handle network errors (no connection)
   - Handle CORS errors
   - Provide helpful error messages
   - Pass through server errors
```

**Key Features**:
- **Base URL**: Reads from `VITE_API_BASE` environment variable
- **Auto Token**: Automatically adds JWT to all requests
- **Error Handling**: User-friendly error messages
- **CORS Detection**: Identifies CORS configuration issues

**Environment Variable**:
```env
VITE_API_BASE=http://localhost:5000
```

**Important Notes**:
- All environment variables in Vite must start with `VITE_`
- Access in code: `import.meta.env.VITE_API_BASE`
- No trailing slash in base URL

---

### 3. Authentication Context: `src/context/AuthContext.jsx`

**Purpose**: Global authentication state management

**State Variables**:
- `user`: Current logged-in user object (null if not logged in)
- `loading`: Boolean indicating if auth check is in progress

**Functions Provided**:
- `login(token, userData)`: Store token and set user
- `logout()`: Clear token and reset user
- `user`: Current user object
- `loading`: Loading state

**Logic Flow**:
```
1. On Component Mount (useEffect):
   - Check localStorage for token
   - If token exists:
     - Call /api/auth/me endpoint
     - If successful: Set user state
     - If failed: Remove invalid token
   - Set loading to false
2. Login Function:
   - Save token to localStorage
   - Update user state
3. Logout Function:
   - Remove token from localStorage
   - Clear user state
```

**Key Concepts**:
- **Context API**: Provides data to all child components
- **Provider Pattern**: Wraps app to provide context
- **useEffect**: Runs on mount to check existing session
- **localStorage**: Browser storage for token persistence

---

### 4. Custom Hook: `src/hooks/useAuth.js`

**Purpose**: Easy access to authentication context

**Implementation**:
```javascript
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function useAuth() {
  return useContext(AuthContext);
}
```

**Usage**:
```javascript
const { user, login, logout, loading } = useAuth();
```

**Benefits**:
- Single import instead of importing useContext and AuthContext
- Consistent access pattern across components
- Cleaner component code

---

### 5. Main App Component: `src/App.jsx`

**Purpose**: Application shell with routing

**Structure**:
```
AuthProvider (Context Provider)
  └── BrowserRouter (React Router)
      └── NavBar (Navigation)
      └── Routes (Route definitions)
          ├── / → Dashboard (Protected)
          ├── /login → Login
          ├── /register → Register
          └── /admin → Admin (Protected, Admin only)
```

**Route Protection**:
- `/`: Protected (requires authentication)
- `/admin`: Protected + Role check (requires admin role)
- `/login`, `/register`: Public routes

**Key Components**:
- `AuthProvider`: Wraps entire app for context access
- `BrowserRouter`: Enables routing
- `NavBar`: Always visible navigation
- `ProtectedRoute`: Guards routes based on auth/role

---

### 6. Navigation Bar: `src/components/NavBar.jsx`

**Purpose**: Site-wide navigation

**Logic Flow**:
```
1. Get user and logout function from useAuth()
2. Render navigation links based on user state:
   - If user exists:
     - Show "Admin" link (if admin role)
     - Show welcome message with name and role
     - Show logout button
   - If no user:
     - Show "Login" and "Register" links
3. Handle logout on button click
```

**Features**:
- Dynamic navigation based on auth state
- Role-based link visibility
- User information display
- Logout functionality

---

### 7. Protected Route Component: `src/components/ProtectedRoute.jsx`

**Purpose**: Route guard for authentication and authorization

**Logic Flow**:
```
1. Get user and loading from useAuth()
2. If loading: Show loading message
3. If no user: Redirect to /login
4. If requireRole is set:
   - Check if user.role matches requireRole
   - If not: Redirect to home (/)
5. If all checks pass: Render children
```

**Usage Examples**:
```javascript
// Protected route (any authenticated user)
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>

// Admin-only route
<ProtectedRoute requireRole="admin">
  <Admin />
</ProtectedRoute>
```

**Key Concepts**:
- **Route Guards**: Protect routes from unauthorized access
- **Navigate Component**: React Router's redirect component
- **Conditional Rendering**: Show content only if authorized

---

### 8. Login Page: `src/pages/Login.jsx`

**Purpose**: User authentication

**State Management**:
- `form`: { email, password }
- `error`: Error message string
- `loading`: Loading state boolean

**Logic Flow**:
```
1. User enters email and password
2. handleChange updates form state
3. On form submit:
   - Prevent default form submission
   - Clear previous errors
   - Set loading to true
   - Call POST /api/auth/login
   - On success:
     - Call login(token, user) from context
     - Navigate to dashboard (/)
   - On error:
     - Display error message
   - Set loading to false
```

**Features**:
- Controlled form inputs
- Loading state with spinner
- Error message display
- Link to registration page
- Auto-redirect on success

**Form Validation**:
- HTML5 validation (required, email type)
- Backend validation (error messages from API)

---

### 9. Register Page: `src/pages/Register.jsx`

**Purpose**: New user registration

**State Management**:
- `form`: { name, email, password }
- `error`: Error message string
- `loading`: Loading state boolean

**Logic Flow**:
```
1. User enters name, email, and password
2. handleChange updates form state
3. On form submit:
   - Prevent default form submission
   - Clear previous errors
   - Set loading to true
   - Call POST /api/auth/register
   - On success:
     - Call login(token, user) from context
     - Navigate to dashboard (/)
   - On error:
     - Display error message
   - Set loading to false
```

**Features**:
- Three-field registration form
- Password minimum length (6 characters)
- Auto-login after registration
- Link to login page
- Same styling as login page

---

### 10. Dashboard Page: `src/pages/Dashboard.jsx`

**Purpose**: User's main landing page after login

**Logic Flow**:
```
1. Get user from useAuth()
2. Display welcome message with user's name
3. Show user's role with styled badge
4. If admin: Show message about admin panel access
```

**Features**:
- Personalized welcome message
- Role badge display
- Admin-specific information
- Protected route (requires authentication)

**User Experience**:
- Immediate feedback on successful login
- Clear role indication
- Navigation hints for admins

---

### 11. Admin Page: `src/pages/Admin.jsx`

**Purpose**: Admin-only panel for user management and AI features

**State Management**:
- `users`: Array of all users
- `loadingUsers`: Loading state for user list
- `actionUserId`: ID of user being modified
- `actionError`: Error message for user actions
- `actionSuccess`: Success message for user actions
- `prompt`: AI question input
- `answer`: AI response
- `aiLoading`: Loading state for AI request
- `error`: General error message
- `chatHistory`: Array of previous AI conversations
- `expandedChats`: Set of expanded chat indices
- `deleteModal`: Modal state { isOpen, user }

**User Management Section**:

**Fetch Users (useEffect)**:
```
1. On component mount:
   - Set loadingUsers to true
   - Call GET /api/users
   - On success: Update users state
   - On error: Display error message
   - Set loadingUsers to false
```

**Toggle Role Function**:
```
1. Check if user is trying to change own role
   - If yes: Show error, return
2. Determine next role (admin ↔ user)
3. Set actionUserId to show loading state
4. Call PATCH /api/users/:id/role
5. On success:
   - Update users array with new role
   - Show success message
   - Clear after 3 seconds
6. On error:
   - Display detailed error message
7. Clear actionUserId
```

**Delete User Function**:
```
1. Check if user is trying to delete own account
   - If yes: Show error, return
2. Open confirmation modal
3. On confirm:
   - Set actionUserId
   - Call DELETE /api/users/:id
   - On success:
     - Remove user from users array
     - Show success message
   - On error: Display error message
   - Clear actionUserId
```

**AI Assistant Section**:

**Ask AI Function**:
```
1. Prevent form submission
2. Validate prompt is not empty
3. Set aiLoading to true
4. Call POST /api/ai/ask with prompt
5. On success:
   - Display answer
   - Add to chat history (keep last 5)
   - Clear prompt input
6. On error: Display error message
7. Set aiLoading to false
```

**Chat History**:
- Stores last 5 conversations
- Expandable/collapsible accordion
- Shows prompt, answer, and timestamp
- Clear all functionality

**Features**:
- Two-column layout (Users | AI)
- Real-time user list updates
- Role toggle with visual feedback
- Delete confirmation modal
- AI chat with history
- Comprehensive error handling
- Loading states for all actions

---

### 12. Confirmation Modal: `src/components/ConfirmModal.jsx`

**Purpose**: Reusable confirmation dialog

**Props**:
- `isOpen`: Boolean to show/hide modal
- `onClose`: Function to close modal
- `onConfirm`: Function to execute on confirm
- `title`: Modal title
- `message`: Modal message
- `confirmText`: Confirm button text (default: "Yes")
- `cancelText`: Cancel button text (default: "No")
- `type`: "danger" or "primary" (default: "danger")

**Logic Flow**:
```
1. If not isOpen: Return null (don't render)
2. Render overlay (click to close)
3. Render modal content:
   - Header with title and close button
   - Body with message
   - Footer with cancel and confirm buttons
4. Stop propagation on content click (prevent closing)
5. On confirm: Call onConfirm then onClose
6. On cancel/close: Call onClose
```

**Features**:
- Click outside to close
- Escape key support (browser default)
- Customizable text and styling
- Danger/primary variants

---

## User Flows & Interactions

### Flow 1: New User Registration

```
1. User visits /register
2. Fills out form (name, email, password)
3. Submits form
4. Frontend validates (HTML5)
5. POST /api/auth/register
6. Backend creates user, returns token
7. Frontend stores token in localStorage
8. Frontend updates AuthContext with user
9. Navigate to / (Dashboard)
10. Dashboard displays welcome message
```

### Flow 2: Existing User Login

```
1. User visits /login
2. Enters email and password
3. Submits form
4. POST /api/auth/login
5. Backend validates credentials
6. Backend returns token and user data
7. Frontend stores token in localStorage
8. Frontend updates AuthContext
9. Navigate to / (Dashboard)
10. NavBar updates to show user info
```

### Flow 3: Protected Route Access

```
1. User tries to access / (Dashboard)
2. ProtectedRoute checks AuthContext
3. If no user: Redirect to /login
4. If user exists: Render Dashboard
5. NavBar shows user info and logout button
```

### Flow 4: Admin Panel Access

```
1. Admin user clicks "Admin" link in NavBar
2. Navigate to /admin
3. ProtectedRoute checks:
   - User exists? ✓
   - Role is "admin"? ✓
4. Render Admin component
5. useEffect fetches all users
6. Display user list and AI assistant
```

### Flow 5: Change User Role (Admin)

```
1. Admin clicks "Make Admin" or "Make User" button
2. Frontend checks if target is current user
   - If yes: Show error, stop
3. Determine new role (toggle)
4. Show loading state on button
5. PATCH /api/users/:id/role
6. Backend updates role
7. Frontend updates local users array
8. Show success message
9. Clear success after 3 seconds
```

### Flow 6: Delete User (Admin)

```
1. Admin clicks "Delete" button
2. Frontend checks if target is current user
   - If yes: Show error, stop
3. Open ConfirmModal
4. User confirms deletion
5. Show loading state
6. DELETE /api/users/:id
7. Backend deletes user
8. Frontend removes user from array
9. Show success message
10. Close modal
```

### Flow 7: AI Question (Admin)

```
1. Admin types question in textarea
2. Clicks "Ask AI" button
3. Show loading state
4. POST /api/ai/ask with prompt
5. Backend processes with Gemini/ChatGPT
6. Backend returns answer
7. Display answer in styled container
8. Add to chat history
9. Clear input field
10. User can expand/collapse history items
```

### Flow 8: Logout

```
1. User clicks "Logout" button in NavBar
2. Call logout() from AuthContext
3. Remove token from localStorage
4. Clear user from AuthContext state
5. NavBar updates (shows Login/Register)
6. Protected routes redirect to /login
```

### Flow 9: Session Persistence

```
1. User closes browser
2. User reopens browser
3. App loads (main.jsx)
4. AuthContext useEffect runs
5. Check localStorage for token
6. If token exists: GET /api/auth/me
7. If valid: Set user state
8. If invalid: Remove token
9. User stays logged in
```

---

## API Integration & State Management

### API Calls Overview

| Endpoint | Method | Auth Required | Purpose |
|----------|--------|---------------|---------|
| `/api/auth/register` | POST | No | Create new user |
| `/api/auth/login` | POST | No | Authenticate user |
| `/api/auth/me` | GET | Yes | Get current user |
| `/api/users` | GET | Admin | Get all users |
| `/api/users/:id/role` | PATCH | Admin | Update user role |
| `/api/users/:id` | DELETE | Admin | Delete user |
| `/api/ai/ask` | POST | Admin | Ask AI question |

### Axios Interceptor Flow

**Request Interceptor**:
```javascript
1. Before every request:
   - Check localStorage for 'token'
   - If token exists:
     - Add to headers: Authorization: Bearer <token>
   - Continue with request
```

**Response Interceptor**:
```javascript
1. On successful response:
   - Return response as-is
2. On error:
   - Check if no response (network error)
   - Check for CORS errors
   - Provide helpful error messages
   - Return rejected promise with error
```

### State Management Strategy

**Global State (Context API)**:
- User authentication state
- Login/logout functions
- Loading state for auth check

**Local State (useState)**:
- Form inputs
- Error messages
- Loading states
- Component-specific data (users list, AI responses)

**Why This Approach**:
- Context for shared, global state
- Local state for component-specific data
- Simple and easy to understand
- No external state management library needed

---

## Routing & Navigation

### Route Configuration

```javascript
/ → Dashboard (Protected)
/login → Login (Public)
/register → Register (Public)
/admin → Admin Panel (Protected, Admin only)
```

### Navigation Flow

**Public Routes**:
- Accessible without authentication
- Login and Register pages
- Redirect to dashboard if already logged in (handled by ProtectedRoute)

**Protected Routes**:
- Require authentication
- Redirect to /login if not authenticated
- Dashboard accessible to all authenticated users

**Admin Routes**:
- Require authentication + admin role
- Redirect to / if not admin
- Admin panel for user management

### React Router Components

**BrowserRouter**:
- Enables routing in the app
- Wraps entire application
- Uses HTML5 history API

**Routes & Route**:
- Defines route paths
- Maps paths to components
- Handles route matching

**Navigate**:
- Programmatic navigation
- Used in ProtectedRoute for redirects
- Can replace current history entry

**Link**:
- Declarative navigation
- Used in NavBar for links
- Prevents full page reload

---

## Styling & UI Components

### Styling Approach

**CSS Modules**:
- Scoped styles per component
- Prevents style conflicts
- Files: `ComponentName.module.css`

**Global Styles**:
- `styles.css`: Base styles, CSS variables
- `styles/common.module.css`: Shared component styles

**CSS Variables**:
```css
--primary-color
--accent-1
--accent-2
--background
--text
--muted
--border
--error
--success
```

### Component Styling

**Common Styles (common.module.css)**:
- `.card`: Card container
- `.cardTitle`: Card heading
- `.form`: Form container
- `.formLabel`: Form label
- `.formInput`: Text input
- `.formTextarea`: Textarea
- `.button`: Primary button
- `.errorMessage`: Error text
- `.loadingSpinner`: Loading animation
- `.loadingContainer`: Loading wrapper

**Component-Specific Styles**:
- `NavBar.module.css`: Navigation styles
- `Admin.module.css`: Admin page styles
- `ConfirmModal.module.css`: Modal styles

### UI Patterns

**Loading States**:
- Spinner animation
- Disabled buttons
- Loading text
- Prevents duplicate submissions

**Error Handling**:
- Inline error messages
- Dismissible error containers
- User-friendly messages
- Network error detection

**Success Feedback**:
- Success messages
- Auto-dismiss after 3 seconds
- Visual confirmation
- State updates

---

## Testing Guide

### Manual Testing Checklist

#### Authentication Flow
- [ ] Register new user
- [ ] Register with duplicate email (error)
- [ ] Register with invalid email (error)
- [ ] Register with short password (error)
- [ ] Login with correct credentials
- [ ] Login with wrong password (error)
- [ ] Login with non-existent email (error)
- [ ] Logout functionality
- [ ] Session persistence (refresh page)

#### Protected Routes
- [ ] Access dashboard without login (redirect to login)
- [ ] Access admin without login (redirect to login)
- [ ] Access admin as regular user (redirect to home)
- [ ] Access dashboard as logged-in user (success)
- [ ] Access admin as admin user (success)

#### User Management (Admin)
- [ ] View all users list
- [ ] Change user role (user → admin)
- [ ] Change user role (admin → user)
- [ ] Try to change own role (error)
- [ ] Delete user
- [ ] Try to delete own account (error)
- [ ] Delete non-existent user (error)

#### AI Assistant (Admin)
- [ ] Ask AI question
- [ ] Ask with empty prompt (error)
- [ ] View AI response
- [ ] Clear AI response
- [ ] View chat history
- [ ] Expand/collapse chat history
- [ ] Clear chat history

#### Navigation
- [ ] NavBar shows correct links for logged-out user
- [ ] NavBar shows correct links for logged-in user
- [ ] NavBar shows admin link for admin users
- [ ] Navigation links work correctly
- [ ] Logout button works

#### Error Handling
- [ ] Network errors display helpful messages
- [ ] CORS errors display helpful messages
- [ ] Server errors display user-friendly messages
- [ ] Validation errors display correctly
- [ ] Error messages are dismissible

### Browser Testing

**Test in Multiple Browsers**:
- Chrome/Edge
- Firefox
- Safari

**Test Responsive Design**:
- Desktop (1920x1080)
- Tablet (768x1024)
- Mobile (375x667)

### Common Test Scenarios

**Scenario 1: New User Journey**
1. Visit register page
2. Create account
3. Automatically logged in
4. See dashboard
5. Logout
6. Login again
7. Session persists on refresh

**Scenario 2: Admin Workflow**
1. Login as admin
2. Access admin panel
3. View all users
4. Change a user's role
5. Delete a user
6. Ask AI question
7. View chat history

**Scenario 3: Error Handling**
1. Try to access protected route (redirect)
2. Login with wrong password (error)
3. Register with duplicate email (error)
4. Try to change own role (error)
5. Try to delete own account (error)

---

## Common Issues & Solutions

### Issue 1: CORS Errors

**Symptoms**: 
- Network errors in console
- "CORS policy" error messages
- Requests blocked by browser

**Solution**:
1. Check `VITE_API_BASE` in frontend `.env`
2. Check `CLIENT_ORIGIN` in backend `.env`
3. Ensure `CLIENT_ORIGIN` matches frontend URL exactly
4. No trailing slashes
5. Restart both servers

**Example**:
```env
# Frontend .env
VITE_API_BASE=http://localhost:5000

# Backend .env
CLIENT_ORIGIN=http://localhost:5173
```

### Issue 2: Token Not Persisting

**Symptoms**:
- Logged out after page refresh
- Token not in localStorage
- AuthContext not working

**Solution**:
1. Check browser localStorage (DevTools → Application → Local Storage)
2. Verify token is being saved in login/register
3. Check AuthContext useEffect is running
4. Verify `/api/auth/me` endpoint works
5. Check token format in localStorage

### Issue 3: API Calls Failing

**Symptoms**:
- Network errors
- 404 errors
- Connection refused

**Solution**:
1. Verify backend is running
2. Check backend port (default: 5000)
3. Test backend health: `http://localhost:5000/api/health`
4. Check `VITE_API_BASE` matches backend URL
5. Verify no trailing slash in base URL
6. Check browser console for detailed errors

### Issue 4: Protected Routes Not Working

**Symptoms**:
- Can access protected routes without login
- Redirects not working
- AuthContext not updating

**Solution**:
1. Check ProtectedRoute component logic
2. Verify AuthContext is providing data
3. Check useAuth hook is working
4. Verify token is being sent in requests
5. Check backend authentication middleware

### Issue 5: Styling Not Applied

**Symptoms**:
- Components unstyled
- CSS not loading
- Styles conflicting

**Solution**:
1. Check CSS module imports
2. Verify class names match
3. Check for typos in class names
4. Verify CSS files are in correct locations
5. Clear browser cache
6. Restart dev server

### Issue 6: Form Submissions Not Working

**Symptoms**:
- Forms not submitting
- No API calls
- Page refreshes

**Solution**:
1. Check `e.preventDefault()` in handleSubmit
2. Verify form has `onSubmit` handler
3. Check button type is "submit"
4. Verify API calls are being made (Network tab)
5. Check for JavaScript errors in console

### Issue 7: State Not Updating

**Symptoms**:
- UI not reflecting changes
- State stuck
- Components not re-rendering

**Solution**:
1. Check useState hooks are used correctly
2. Verify state updates are not mutating directly
3. Check for missing dependencies in useEffect
4. Verify Context updates are triggering re-renders
5. Use React DevTools to inspect state

### Issue 8: Navigation Not Working

**Symptoms**:
- Links not navigating
- Routes not changing
- 404 errors

**Solution**:
1. Verify BrowserRouter wraps app
2. Check route paths match exactly
3. Verify Link components are used (not <a>)
4. Check for typos in paths
5. Verify React Router is installed

---

## Quick Reference

### Environment Variables

**Frontend (.env)**:
```env
VITE_API_BASE=http://localhost:5000
```

**Important**: 
- Must start with `VITE_`
- Access with `import.meta.env.VITE_API_BASE`
- No trailing slash

### Default URLs

- **Frontend**: `http://localhost:5173`
- **Backend**: `http://localhost:5000`
- **API Base**: `http://localhost:5000/api`

### Key Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Component Import Pattern

```javascript
// Context
import { AuthProvider } from './context/AuthContext';
import useAuth from './hooks/useAuth';

// API
import api from './api';

// Components
import NavBar from './components/NavBar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
```

### Common Patterns

**Form Handling**:
```javascript
const [form, setForm] = useState({ email: '', password: '' });

const handleChange = (e) => {
  setForm({ ...form, [e.target.name]: e.target.value });
};

const handleSubmit = async (e) => {
  e.preventDefault();
  // Submit logic
};
```

**API Call Pattern**:
```javascript
try {
  setLoading(true);
  const { data } = await api.post('/api/endpoint', payload);
  // Handle success
} catch (err) {
  setError(err.response?.data?.message || 'Error message');
} finally {
  setLoading(false);
}
```

**Protected Route Usage**:
```javascript
<ProtectedRoute>
  <Component />
</ProtectedRoute>

<ProtectedRoute requireRole="admin">
  <AdminComponent />
</ProtectedRoute>
```

---

## Teaching Timeline (2 Hours)

### Hour 1: Foundation & Core Concepts (60 minutes)

**0-10 min: Introduction**
- Project overview
- Technology stack
- File structure walkthrough
- Architecture overview

**10-25 min: Setup & Configuration**
- Environment variables
- API configuration (api.js)
- Axios interceptors
- Base URL setup

**25-45 min: Authentication System**
- AuthContext setup
- useAuth hook
- Login flow
- Register flow
- Token management
- Session persistence

**45-60 min: Routing & Navigation**
- React Router setup
- Route configuration
- ProtectedRoute component
- Navigation bar
- Route guards

### Hour 2: Features & Advanced Topics (60 minutes)

**0-20 min: Dashboard & User Pages**
- Dashboard component
- User information display
- Protected routes in action

**20-40 min: Admin Panel - User Management**
- Admin page structure
- Fetching users list
- Role toggle functionality
- Delete user with confirmation
- Error handling

**40-55 min: Admin Panel - AI Features**
- AI assistant integration
- Chat history
- Loading states
- Error handling

**55-60 min: Q&A & Best Practices**
- Common issues
- Debugging tips
- Best practices
- Next steps

---

## Key Learning Objectives

By the end of this guide, students should understand:

1. **React Fundamentals**:
   - Component structure
   - Hooks (useState, useEffect, useContext)
   - Props and state management
   - Event handling

2. **Routing**:
   - React Router setup
   - Route protection
   - Navigation patterns
   - Programmatic navigation

3. **State Management**:
   - Context API
   - Global vs local state
   - State updates
   - Persistence (localStorage)

4. **API Integration**:
   - Axios configuration
   - Request/response interceptors
   - Error handling
   - Loading states

5. **Form Handling**:
   - Controlled components
   - Form submission
   - Validation
   - Error display

6. **UI/UX Patterns**:
   - Loading states
   - Error messages
   - Success feedback
   - Modal dialogs

7. **Best Practices**:
   - Component organization
   - Code reusability
   - Error handling
   - User experience

---

## File Creation Order (Development)

1. `package.json` - Dependencies
2. `vite.config.js` - Build configuration
3. `index.html` - HTML entry point
4. `src/main.jsx` - React entry point
5. `src/api.js` - API configuration
6. `src/context/AuthContext.jsx` - Auth context
7. `src/hooks/useAuth.js` - Auth hook
8. `src/styles.css` - Global styles
9. `src/styles/common.module.css` - Shared styles
10. `src/components/ProtectedRoute.jsx` - Route guard
11. `src/components/NavBar.jsx` - Navigation
12. `src/pages/Login.jsx` - Login page
13. `src/pages/Register.jsx` - Register page
14. `src/pages/Dashboard.jsx` - Dashboard
15. `src/App.jsx` - Main app with routing
16. `src/pages/Admin.jsx` - Admin panel
17. `src/components/ConfirmModal.jsx` - Modal component

---

## Additional Resources

### React Documentation
- [React Official Docs](https://react.dev)
- [React Router Docs](https://reactrouter.com)
- [Context API Guide](https://react.dev/reference/react/useContext)

### Vite Documentation
- [Vite Guide](https://vitejs.dev/guide/)
- [Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

### Axios Documentation
- [Axios Docs](https://axios-http.com/docs/intro)
- [Interceptors](https://axios-http.com/docs/interceptors)

### CSS Modules
- [CSS Modules Guide](https://github.com/css-modules/css-modules)

---

**End of Document**
