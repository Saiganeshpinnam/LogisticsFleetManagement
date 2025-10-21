# 🚨 CRITICAL: Fix Vercel Login Error (500 Internal Server Error)

## Problem
Your Vercel frontend at `https://logistics-fleet-management-ten.vercel.app/` is getting a 500 error when trying to login because the backend on Render.com cannot connect to the database.

## Root Cause
The backend is trying to connect to PostgreSQL on port **5433** instead of the correct port **5432**, causing database connection failures.

---

## ✅ Solution: Update Render.com Environment Variables

### Step 1: Go to Render.com Dashboard
1. Log in to [Render.com](https://render.com)
2. Select your **logistics-backend** service
3. Go to the **Environment** tab

### Step 2: Set/Update These Environment Variables

**CRITICAL - Database Configuration:**
```env
DATABASE_URL=postgresql://username:password@hostname:5432/database_name
```
👆 **Replace with your actual PostgreSQL connection string from Render**

**OR if using individual variables:**
```env
DB_HOST=your-postgres-host.render.com
DB_PORT=5432
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASS=your_database_password
```

**Server Configuration:**
```env
PORT=4000
NODE_ENV=production
```

**JWT Secret (MUST MATCH LOCAL):**
```env
JWT_SECRET=a1b2c3d4e5f67890abcd1234ef567890abcdef1234567890abcdef1234567890
```

**CORS Configuration:**
```env
FRONTEND_URL=https://logistics-fleet-management-ten.vercel.app
```

---

## Step 3: Create PostgreSQL Database on Render

If you haven't already:

1. In Render Dashboard, click **"New +"** → **"PostgreSQL"**
2. Name it: `logistics-db`
3. Choose the **Free** plan
4. Click **"Create Database"**
5. Wait for it to provision (takes 1-2 minutes)
6. Copy the **Internal Database URL** from the database info page
7. Use this URL as your `DATABASE_URL` in the backend environment variables

---

## Step 4: Update Backend Environment Variables

In your Render backend service:

1. Go to **Environment** tab
2. Add/Update these variables:

```env
DATABASE_URL=<paste-internal-database-url-here>
PORT=4000
NODE_ENV=production
JWT_SECRET=a1b2c3d4e5f67890abcd1234ef567890abcdef1234567890abcdef1234567890
FRONTEND_URL=https://logistics-fleet-management-ten.vercel.app
```

3. Click **"Save Changes"**
4. Render will automatically redeploy your backend

---

## Step 5: Verify Deployment

### Check Render Logs:
1. Go to your backend service on Render
2. Click on **"Logs"** tab
3. Look for these success messages:
   ```
   ✅ PostgreSQL database connection established successfully
   ✅ Server running on port 4000
   Database synced ✅
   Admin user already exists ✅
   ```

### If you see errors like:
```
❌ Unable to connect to PostgreSQL database
```

Then your DATABASE_URL is incorrect. Double-check:
- The connection string format
- The port is 5432 (not 5433)
- The database exists
- Credentials are correct

---

## Step 6: Test Login

1. Go to: `https://logistics-fleet-management-ten.vercel.app/login`
2. Try logging in with:
   - **Email:** `admin@test.com`
   - **Password:** `password123`

3. Should redirect to dashboard without 500 error

---

## 🔍 Common Issues & Solutions

### Issue 1: "Connection refused" or "ECONNREFUSED"
**Solution:** Database is not accessible. Make sure:
- PostgreSQL database is created on Render
- Using the **Internal Database URL** (not External)
- Database is in the same region as your backend service

### Issue 2: "Authentication failed"
**Solution:** Wrong credentials in DATABASE_URL
- Double-check username and password
- Copy the connection string directly from Render database page

### Issue 3: "Database does not exist"
**Solution:** Database name is wrong
- Verify the database name in the connection string
- Create the database if it doesn't exist

### Issue 4: "Port 5433 connection refused"
**Solution:** Wrong port in connection string
- Change port from 5433 to 5432
- Format: `postgresql://user:pass@host:5432/dbname`

---

## 📋 Checklist

- [ ] PostgreSQL database created on Render
- [ ] DATABASE_URL copied from Render database page
- [ ] DATABASE_URL added to backend environment variables
- [ ] PORT=4000 set in environment variables
- [ ] NODE_ENV=production set
- [ ] JWT_SECRET matches local environment
- [ ] FRONTEND_URL set to Vercel URL
- [ ] Backend redeployed on Render
- [ ] Render logs show successful database connection
- [ ] Login works on Vercel link

---

## 🎯 Expected Result

After following these steps:
- ✅ Backend connects to PostgreSQL on Render
- ✅ Login works on `https://logistics-fleet-management-ten.vercel.app/`
- ✅ No more 500 Internal Server Error
- ✅ Users can register and login successfully

---

## 📞 Still Having Issues?

Check the Render logs for specific error messages and verify:
1. Database connection string is correct
2. Database is running and accessible
3. All environment variables are set correctly
4. Backend service has redeployed after changes
