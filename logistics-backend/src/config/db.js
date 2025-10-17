const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');

// Ensure database directory exists for SQLite
const dbDir = path.join(__dirname, '../../database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log('Created database directory:', dbDir);
}

// Check if DATABASE_URL is provided (common for cloud deployments like Render)
let sequelize;

console.log('Initializing database connection...');
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('FORCE_SQLITE:', process.env.FORCE_SQLITE);

if (process.env.FORCE_SQLITE === 'true') {
  console.log('Forcing SQLite mode');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(dbDir, 'logistics.db'), // Use persistent file storage
    logging: false
  });
} else if (process.env.DATABASE_URL) {
  console.log('Using DATABASE_URL for cloud deployment');
  // Use DATABASE_URL for cloud deployments
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false, // Disable logging in production
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
} else if (process.env.NODE_ENV === 'production') {
  console.log('Production mode but no DATABASE_URL - using SQLite fallback');
  // SQLite fallback for production if no DATABASE_URL
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(dbDir, 'logistics.db'), // Use persistent file storage
    logging: false
  });
} else {
  console.log('Using individual environment variables for local development');
  // Try PostgreSQL first with your .env settings
  try {
    sequelize = new Sequelize(
      process.env.DB_NAME || 'logistics_db',
      process.env.DB_USER || 'postgres',
      process.env.DB_PASS || 'postgres',
      {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: false,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        }
      }
    );
    console.log(`Attempting PostgreSQL connection: ${process.env.DB_USER}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
  } catch (error) {
    console.log('PostgreSQL configuration failed, falling back to SQLite');
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: path.join(dbDir, 'logistics.db'),
      logging: false
    });
  }
}

// Test the connection
sequelize.authenticate()
  .then(() => {
    console.log('Database connection established successfully ✅');
  })
  .catch(err => {
    console.error('Unable to connect to the database ❌:', err);
  });

module.exports = sequelize;
