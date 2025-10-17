const { Sequelize } = require('sequelize');

// Check if DATABASE_URL is provided (common for cloud deployments like Render)
let sequelize;

console.log('Initializing database connection...');
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);

if (process.env.DATABASE_URL) {
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
    storage: './database.sqlite',
    logging: false
  });
} else {
  console.log('Using individual environment variables for local development');
  // Use individual environment variables for local development
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
