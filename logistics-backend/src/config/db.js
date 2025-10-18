const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');

// Ensure database directory exists for SQLite fallback
const dbDir = path.join(__dirname, '../../database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log('Created database directory:', dbDir);
}

// Use PostgreSQL as the primary database
let sequelize;

console.log('Initializing PostgreSQL database connection...');
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Use DATABASE_URL if provided (for cloud deployments or custom setup)
if (process.env.DATABASE_URL) {
  console.log('Using DATABASE_URL for database connection');
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false, // Disable logging in production
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
} else {
  console.log('Using individual environment variables for PostgreSQL connection');
  // Use individual environment variables for local development
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432, // Fixed to use standard PostgreSQL port
    database: process.env.DB_NAME || 'logistics_db',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'postgres',
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  };

  console.log(`Attempting PostgreSQL connection: ${dbConfig.username}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);

  sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
      host: dbConfig.host,
      port: dbConfig.port,
      dialect: dbConfig.dialect,
      logging: dbConfig.logging,
      pool: dbConfig.pool
    }
  );
}

// Test the connection
sequelize.authenticate()
  .then(() => {
    console.log('PostgreSQL database connection established successfully ✅');
  })
  .catch(err => {
    console.error('Unable to connect to PostgreSQL database ❌:', err.message);
    console.error('\n🔧 Troubleshooting steps:');
    console.error('1. Ensure PostgreSQL is installed and running');
    console.error('2. Check your .env file has correct DB_PASS');
    console.error('3. Create database "logistics_db" in PostgreSQL');
    console.error('4. Verify PostgreSQL credentials are correct');
    console.error('5. Make sure PostgreSQL is running on port 5432 (default)');
    console.error('\n💡 Quick fix: Install PostgreSQL from https://postgresql.org/download/');
  });

module.exports = sequelize;
