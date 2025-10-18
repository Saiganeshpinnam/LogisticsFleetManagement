# 🚀 Deployment Environment Variables Guide

## Backend Environment Variables (Render.com)

When deploying to Render.com, ensure these environment variables are set:

### Required Variables:
```env
# Database Configuration (PostgreSQL on Render)
DATABASE_URL=postgresql://username:password@hostname:5432/database_name

# JWT Secret (should match your local JWT_SECRET)
JWT_SECRET=a1b2c3d4e5f67890abcd1234ef567890abcdef1234567890abcdef1234567890

# Server Configuration
PORT=4000
NODE_ENV=production

# Frontend URL for CORS
FRONTEND_URL=https://logistics-fleet-management-ten.vercel.app
```

### How to Set Variables in Render.com:
1. Go to your Render.com dashboard
2. Select your backend service
3. Go to "Environment" tab
4. Add each variable above

## Frontend Environment Variables (Vercel)

### Production (.env.production):
```env
REACT_APP_API_URL=https://logisticsfleetmanagement.onrender.com/api
REACT_APP_SOCKET_URL=https://logisticsfleetmanagement.onrender.com
REACT_APP_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY_HERE
```

### Development (.env.development):
```env
REACT_APP_API_URL=http://localhost:4000/api
REACT_APP_SOCKET_URL=http://localhost:4000
REACT_APP_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY_HERE
```

## Common Issues & Solutions:

### Issue: Login works locally but not on deployed version
**Solution**: Ensure JWT_SECRET matches between local and deployed backend

### Issue: CORS errors
**Solution**: Add deployed frontend URL to backend CORS configuration

### Issue: Database connection fails on deployed backend
**Solution**: Check DATABASE_URL format and credentials in Render dashboard

## Current Configuration Status:

✅ **Backend CORS**: Updated to allow Vercel domain
✅ **Frontend API Detection**: Automatically detects environment
✅ **Socket Configuration**: Dynamic URL based on environment

## Testing Both Environments:

### Local Testing:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`
- Database: `localhost:5432`

### Deployed Testing:
- Frontend: `https://logistics-fleet-management-ten.vercel.app`
- Backend: `https://logisticsfleetmanagement.onrender.com`
- Database: PostgreSQL on Render

## Next Steps:

1. **Deploy Backend Changes**: Push backend changes to trigger Render deployment
2. **Verify Environment Variables**: Check Render dashboard has correct variables
3. **Test Deployed Login**: Try logging in through Vercel link
4. **Monitor Logs**: Check Render logs for any connection issues
