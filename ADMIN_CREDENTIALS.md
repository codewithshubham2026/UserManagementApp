# 🔐 Default Admin Credentials

## Automatic Admin Creation

The application **automatically creates a default admin user** when the server starts for the first time.

## Default Credentials

**Email:** `admin@example.com`  
**Password:** `admin123`  
**Name:** `Admin User`

## How It Works

1. When the backend server starts, it connects to MongoDB
2. After connection, it automatically checks if an admin user exists
3. If no admin exists, it creates one with the default credentials
4. If admin already exists, it ensures the role is set to "admin"

## Customizing Admin Credentials

You can customize the admin credentials by adding these to your `backend/.env` file:

```env
ADMIN_EMAIL=your-admin@example.com
ADMIN_PASSWORD=your-secure-password
ADMIN_NAME=Your Admin Name
```

If these are not set, the defaults will be used:
- Email: `admin@example.com`
- Password: `admin123`
- Name: `Admin User`

## For Video Tutorial

**Recommended Setup:**
- Use the default credentials for consistency
- Show students that admin is created automatically
- Mention they can customize via environment variables

**Demo Flow:**
1. Start the server
2. Show console message: "✅ Default admin user created"
3. Log in with `admin@example.com` / `admin123`
4. Show admin features

## Security Note

⚠️ **Important for Production:**
- Change the default password after first login
- Use strong passwords in production
- Consider removing auto-creation in production
- Set custom credentials via environment variables

---

**The admin user is ready to use immediately after starting the server!** 🚀
