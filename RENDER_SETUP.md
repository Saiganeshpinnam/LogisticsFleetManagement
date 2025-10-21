# Render Deployment Setup

## 🚀 Quick Fix for Database Connection Issues

**If you're getting database connection errors on Render, the app now automatically falls back to SQLite!**

The application will:
1. Try to connect to PostgreSQL first (if DATABASE_URL is provided)
2. Automatically fall back to SQLite if PostgreSQL fails
3. Work perfectly with SQLite for all basic functionality

## Environment Variables for Render

Go to your Render dashboard > Your service > Environment tab and add:

### Option 1: PostgreSQL (Recommended for production)
```
DATABASE_URL=your_postgres_connection_string
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=production
```

### Option 2: SQLite Fallback (Automatic - no setup needed!)
```
# No environment variables needed - SQLite fallback is automatic!
NODE_ENV=production
```

**Note:** If you want to use PostgreSQL later, add `DATABASE_URL`. The app will automatically detect and use it.

## Default Login Credentials

After deployment, you can login with:
- **Email**: admin@test.com
- **Password**: password123

## Troubleshooting

1. **Database Connection Issues**: The app automatically falls back to SQLite if PostgreSQL connection fails
2. **500 Errors**: Check Render logs - if you see database connection errors, SQLite fallback should handle it
3. **Default Admin User**: The app automatically creates a default admin user on startup
4. **SQLite Storage**: Uses local file storage in Render's filesystem

## Frontend Environment Variables

Make sure your frontend `.env.production` has:
```
REACT_APP_API_URL=https://logisticsfleetmanagement.onrender.com/api
REACT_APP_SOCKET_URL=https://logisticsfleetmanagement.onrender.com
```

## 🚨 Important Notes

- **SQLite fallback is now automatic** - no manual intervention needed
- **All authentication and basic features work with SQLite**
- **PostgreSQL is still recommended for production with multiple users**
- **The app creates the admin user automatically on first startup**
