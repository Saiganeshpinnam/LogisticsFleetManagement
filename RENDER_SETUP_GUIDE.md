# 🚀 Render.com Setup Guide - Fix 500 Login Error

## 🎯 Objective
Fix the 500 Internal Server Error when logging in via your Vercel frontend at:
`https://logistics-fleet-management-ten.vercel.app/`

---

## 📋 Step-by-Step Setup

### Step 1: Create PostgreSQL Database on Render

1. **Go to [Render.com Dashboard](https://dashboard.render.com/)**
2. **Click "New +" → "PostgreSQL"**
3. **Configure Database:**
   - **Name:** `logistics-db`
   - **Database:** `logistics_db`
   - **User:** `logistics_user` (or any name you prefer)
   - **Region:** Same as your backend service
   - **Plan:** Free
4. **Click "Create Database"**
5. **Wait 2-3 minutes for provisioning**

### Step 2: Get Database Connection URL

1. **Go to your PostgreSQL database page on Render**
2. **Copy the "Internal Database URL"** (not External)
3. **It should look like:**
   ```
   postgresql://logistics_user:password@dpg-xxxxx-a.oregon-postgres.render.com/logistics_db
   ```

### Step 3: Configure Backend Environment Variables

1. **Go to your backend service on Render**
2. **Click "Environment" tab**
3. **Add these environment variables:**

```env
DATABASE_URL=postgresql://logistics_user:password@dpg-xxxxx-a.oregon-postgres.render.com/logistics_db
PORT=4000
NODE_ENV=production
JWT_SECRET=a1b2c3d4e5f67890abcd1234ef567890abcdef1234567890abcdef1234567890
FRONTEND_URL=https://logistics-fleet-management-ten.vercel.app
```

**⚠️ CRITICAL:** Replace the `DATABASE_URL` with your actual Internal Database URL from Step 2!

### Step 4: Deploy Updated Code

**Push the improved error handling code:**

```bash
cd logistics-fleet/logistics-backend
git add .
git commit -m "feat: Improve error handling and database connection for production"
git push origin main
```

This will trigger an automatic redeploy on Render.

---

## 🔍 Verify Deployment

### Check Health Endpoint
Visit: `https://logisticsfleetmanagement.onrender.com/api/health`

**Expected Response (Success):**
```json
{
  "status": "ok",
  "database": {
    "connected": true,
    "dialect": "postgres",
    "userCount": 7
  },
  "config": {
    "hasJwtSecret": true,
    "frontendUrl": "https://logistics-fleet-management-ten.vercel.app"
  }
}
```

**If you see errors, check the Render logs.**

### Check Render Logs

1. **Go to your backend service on Render**
2. **Click "Logs" tab**
3. **Look for these success messages:**
   ```
   ✅ PostgreSQL database connection established successfully
   ✅ Server running on port 4000
   Database synced ✅
   Admin user already exists ✅
   ```

### Test Login

1. **Go to:** `https://logistics-fleet-management-ten.vercel.app/login`
2. **Try logging in with:**
   - **Email:** `admin@test.com`
   - **Password:** `password123`
3. **Should redirect to dashboard without 500 error**

---

## 🚨 Troubleshooting Common Issues

### Issue 1: "Database connection failed"
**Symptoms:** Health endpoint shows `"connected": false`
**Solutions:**
- Verify DATABASE_URL is correct (copy from Render PostgreSQL page)
- Ensure database and backend service are in the same region
- Check database is running (green status on Render)

### Issue 2: "Database appears to be empty"
**Symptoms:** `"userCount": 0` in health check
**Solutions:**
- Database is connected but no users created
- Check Render logs for "Admin user created" message
- Database sync might have failed - check logs

### Issue 3: "JWT malformed" or token errors
**Symptoms:** Login works but dashboard fails
**Solutions:**
- Ensure JWT_SECRET is exactly the same in both environments
- Use the provided JWT_SECRET from this guide

### Issue 4: CORS errors
**Symptoms:** Network errors in browser console
**Solutions:**
- Verify FRONTEND_URL is set to your Vercel URL
- Check CORS configuration in app.js

---

## 📊 Environment Variables Checklist

| Variable | Required | Example Value | Purpose |
|----------|----------|---------------|---------|
| `DATABASE_URL` | ✅ | `postgresql://user:pass@host/db` | PostgreSQL connection |
| `PORT` | ✅ | `4000` | Server port |
| `NODE_ENV` | ✅ | `production` | Environment mode |
| `JWT_SECRET` | ✅ | `a1b2c3d4e5f67890...` | JWT token signing |
| `FRONTEND_URL` | ✅ | `https://logistics-fleet-management-ten.vercel.app` | CORS origin |

---

## 🎉 Success Indicators

- ✅ Health endpoint returns `"status": "ok"`
- ✅ Database shows `"connected": true`
- ✅ User count > 0 (should be 7)
- ✅ Login works without 500 error
- ✅ Dashboard loads after login
- ✅ No CORS errors in browser console

---

## 📞 Still Having Issues?

1. **Check Render service logs** for specific error messages
2. **Visit health endpoint** to see exact configuration
3. **Verify all environment variables** are set correctly
4. **Ensure database is running** (green status on Render)
5. **Test with different browsers** to rule out caching issues

The improved error handling will now show specific error messages in the logs to help diagnose any remaining issues.
