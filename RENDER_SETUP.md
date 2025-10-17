# Render Deployment Setup

## Environment Variables to Set on Render

Go to your Render dashboard > Your service > Environment tab and add:

### For SQLite Fallback (Temporary Solution)
```
FORCE_SQLITE=true
NODE_ENV=production
```

### For PostgreSQL (Recommended)
```
DATABASE_URL=your_postgres_connection_string
NODE_ENV=production
```

## Default Login Credentials

After deployment, you can login with:
- **Email**: admin@test.com
- **Password**: password123

## Troubleshooting

1. If you get 500 errors, check the Render logs
2. The app will automatically create a default admin user on startup
3. If database connection fails, it will fall back to SQLite in-memory storage

## Frontend Environment Variables

Make sure your frontend `.env.production` has:
```
REACT_APP_API_URL=https://logisticsfleetmanagement.onrender.com/api
REACT_APP_SOCKET_URL=https://logisticsfleetmanagement.onrender.com
```
