# PostgreSQL Installation Guide for Windows
# This guide helps you set up PostgreSQL on Windows for the Logistics Fleet Management system

echo "🗄️ PostgreSQL Installation for Windows"
echo "====================================="

# Check if PostgreSQL is already installed
if (Get-Service "postgresql*" -ErrorAction SilentlyContinue) {
    echo "✅ PostgreSQL is already installed"
    echo "Starting PostgreSQL service..."
    Get-Service "postgresql*" | Start-Service
    echo "✅ PostgreSQL service started"
} else {
    echo "❌ PostgreSQL is not installed"
    echo ""
    echo "📥 Download PostgreSQL:"
    echo "1. Go to: https://www.postgresql.org/download/windows/"
    echo "2. Download the latest version (18.x)"
    echo "3. Run the installer"
    echo "4. Choose default settings"
    echo "5. Set password for 'postgres' user (remember this!)"
    echo "6. Complete installation"
    echo ""
    echo "🔧 After installation:"
    echo "1. PostgreSQL service should start automatically"
    echo "2. Update your .env file with the correct password"
    echo "3. Create database: logistics_db"
    echo ""
    echo "📋 Manual Database Creation:"
    echo "1. Open pgAdmin or psql"
    echo "2. Connect as postgres user"
    echo "3. Run: CREATE DATABASE logistics_db;"
    echo ""
    echo "🎯 Quick Setup:"
    echo "After PostgreSQL installation, run:"
    echo "node init-postgresql.js"
}

echo ""
echo "🔧 Environment Variables (.env file):"
echo "DB_HOST=localhost"
echo "DB_PORT=5432"
echo "DB_NAME=logistics_db"
echo "DB_USER=postgres"
echo "DB_PASS=your_postgres_password"
echo ""
echo "✅ Setup complete!"
