# ⚠️ IMPORTANT: Update Your .env File

## Issue Found
Your `.env` file currently has `DB_PORT=5433` which is causing database connection issues.

## Required Fix
Edit your `logistics-backend/.env` file and change:

```env
# WRONG - Current setting
DB_PORT=5433

# CORRECT - Change to this
DB_PORT=5432
```

## Complete .env File Should Look Like This:

```env
# Server Configuration
PORT=4000

# JWT
JWT_SECRET=a1b2c3d4e5f67890abcd1234ef567890abcdef1234567890abcdef1234567890

# Database Configuration
DB_HOST=localhost
DB_NAME=logistics_db
DB_USER=postgres
DB_PASS=postgre123
DB_PORT=5432
```

## After Updating:
1. Save the `.env` file
2. Restart the backend server: `npm run dev`
3. You should see: `Attempting PostgreSQL connection: postgres@localhost:5432/logistics_db`

## Why This Matters:
- PostgreSQL default port is **5432**
- Your current setting **5433** causes connection failures
- This prevents user registration and login from working
