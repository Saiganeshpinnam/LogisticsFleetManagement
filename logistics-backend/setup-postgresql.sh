#!/bin/bash
# PostgreSQL Setup Script for Logistics Fleet Management
# This script helps set up PostgreSQL database for the application

echo "🚀 Setting up PostgreSQL for Logistics Fleet Management"
echo "=================================================="

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed."
    echo "Please install PostgreSQL:"
    echo "  - Ubuntu/Debian: sudo apt install postgresql postgresql-contrib"
    echo "  - CentOS/RHEL: sudo yum install postgresql-server"
    echo "  - macOS: brew install postgresql"
    echo "  - Windows: Download from https://postgresql.org/download/windows/"
    exit 1
fi

echo "✅ PostgreSQL is installed"

# Check if PostgreSQL service is running
if ! pg_isready &> /dev/null; then
    echo "❌ PostgreSQL service is not running."
    echo "Please start PostgreSQL:"
    echo "  - Linux: sudo systemctl start postgresql"
    echo "  - macOS: brew services start postgresql"
    echo "  - Windows: Start PostgreSQL service from Services"
    exit 1
fi

echo "✅ PostgreSQL service is running"

# Create database if it doesn't exist
DB_NAME="logistics_db"
DB_USER="postgres"

echo "Creating database: $DB_NAME"

sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || {
    echo "Database $DB_NAME already exists or creation failed"
}

echo "✅ Database setup completed"

echo ""
echo "📋 Next Steps:"
echo "1. Update your .env file with correct PostgreSQL credentials"
echo "2. Run the database initialization: node init-postgresql.js"
echo "3. Start your backend server: npm start"
echo "4. Start your frontend: npm start (in logistics-frontend directory)"
echo ""
echo "🔧 Environment Variables (.env file):"
echo "DB_HOST=localhost"
echo "DB_PORT=5432"
echo "DB_NAME=logistics_db"
echo "DB_USER=postgres"
echo "DB_PASS=your_postgres_password"
echo ""
echo "🎉 Happy coding!"
