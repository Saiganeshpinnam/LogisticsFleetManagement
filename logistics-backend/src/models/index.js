const Sequelize = require('sequelize');

// Try to require database config, with fallback handling
let sequelize;
try {
  sequelize = require('../config/db');
} catch (error) {
  console.error('Failed to load database config:', error.message);
  console.log('Using in-memory SQLite as fallback...');

  // Fallback to in-memory SQLite for testing/emergency situations
  sequelize = new Sequelize('sqlite::memory:', {
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
}

// Initialize models with error handling
let User, Vehicle, Delivery, Tracking;

try {
  User = require('./user.model')(sequelize);
  Vehicle = require('./vehicle.model')(sequelize);
  Delivery = require('./delivery.model')(sequelize);
  Tracking = require('./tracking.model')(sequelize);

  // Associations with error handling
  try {
    User.hasMany(Delivery, { foreignKey: 'driverId', as: 'driverDeliveries' });
    User.hasMany(Delivery, { foreignKey: 'customerId', as: 'customerDeliveries' });

    Vehicle.hasMany(Delivery, { foreignKey: 'vehicleId' });
    Delivery.belongsTo(User, { foreignKey: 'driverId', as: 'driver' });
    Delivery.belongsTo(User, { foreignKey: 'customerId', as: 'customer' });
    Delivery.belongsTo(Vehicle, { foreignKey: 'vehicleId', as: 'vehicle' });

    Tracking.belongsTo(Delivery, { foreignKey: 'deliveryId' });
    Delivery.hasMany(Tracking, { foreignKey: 'deliveryId', as: 'tracks' });

    console.log('✅ Models and associations initialized successfully');
  } catch (associationError) {
    console.error('❌ Error setting up model associations:', associationError.message);
  }

} catch (modelError) {
  console.error('❌ Error initializing models:', modelError.message);
  console.error('Backend may not function properly without models');
}

module.exports = {
  sequelize,
  User,
  Vehicle,
  Delivery,
  Tracking
};
