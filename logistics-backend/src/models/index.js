const Sequelize = require('sequelize');
const sequelize = require('../config/db');

const User = require('./user.model')(sequelize);
const Vehicle = require('./vehicle.model')(sequelize);
const Delivery = require('./delivery.model')(sequelize);
const Tracking = require('./tracking.model')(sequelize);

// Associations
User.hasMany(Delivery, { foreignKey: 'driverId', as: 'driverDeliveries' });
User.hasMany(Delivery, { foreignKey: 'customerId', as: 'customerDeliveries' });

Vehicle.hasMany(Delivery, { foreignKey: 'vehicleId' });
Delivery.belongsTo(User, { foreignKey: 'driverId', as: 'driver' });
Delivery.belongsTo(User, { foreignKey: 'customerId', as: 'customer' });
Delivery.belongsTo(Vehicle, { foreignKey: 'vehicleId', as: 'vehicle' });

Tracking.belongsTo(Delivery, { foreignKey: 'deliveryId' });
Delivery.hasMany(Tracking, { foreignKey: 'deliveryId', as: 'tracks' });

module.exports = {
  sequelize,
  User,
  Vehicle,
  Delivery,
  Tracking
};
