const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');

// Check if we should force SQLite (for Render deployment or testing)
const FORCE_SQLITE = process.env.FORCE_SQLITE === 'true' || process.env.NODE_ENV === 'test';

// Ensure database directory exists for SQLite fallback
const dbDir = path.join(__dirname, '../../database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log('Created database directory:', dbDir);
}

// Use PostgreSQL as the primary database unless forced to use SQLite
let sequelize;

if (FORCE_SQLITE) {
  console.log('🔧 FORCE_SQLITE is enabled - using SQLite database');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(dbDir, 'logistics.db'),
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
} else {
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
      port: process.env.DB_PORT || 5433, // Fixed to use standard PostgreSQL port
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

  // Add connection retry logic with fallback
  sequelize.authenticate()
    .then(() => {
      console.log('PostgreSQL database connection established successfully ✅');
    })
    .catch(err => {
      console.error('Unable to connect to PostgreSQL database ❌:', err.message);
      console.error('Falling back to SQLite database...');

      // Fallback to SQLite if PostgreSQL fails
      sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: path.join(dbDir, 'logistics.db'),
        logging: false,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        }
      });

      // Test SQLite connection
      sequelize.authenticate()
        .then(() => {
          console.log('SQLite fallback database connection established successfully ✅');
        })
        .catch(sqliteErr => {
          console.error('Failed to connect to SQLite fallback ❌:', sqliteErr.message);
          console.error('💡 Please ensure SQLite is available or fix database configuration');
        });
    });
}

// Test the connection (for non-fallback scenarios)
if (!FORCE_SQLITE && !process.env.DATABASE_URL && process.env.NODE_ENV !== 'production') {
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
}

module.exports = sequelize;
