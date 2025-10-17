const { Sequelize } = require('sequelize');

// Check if DATABASE_URL is provided (common for cloud deployments like Render)
let sequelize;

if (process.env.DATABASE_URL) {
  // Use DATABASE_URL for cloud deployments
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
} else {
  // Use individual environment variables for local development
  sequelize = new Sequelize(
    process.env.DB_NAME || 'logistics_db',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASS || 'postgres',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: false
    }
  );
}

module.exports = sequelize;
