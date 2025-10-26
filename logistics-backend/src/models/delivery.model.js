const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Delivery = sequelize.define('Delivery', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    pickupAddress: { type: DataTypes.STRING, allowNull: false },
    dropAddress: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.ENUM('unassigned','pending','assigned','on_route','delivered'), defaultValue: 'unassigned' },
    scheduledStart: { type: DataTypes.DATE },
    scheduledEnd: { type: DataTypes.DATE },

    // Assignment fields
    driverId: { type: DataTypes.INTEGER, allowNull: true },
    vehicleId: { type: DataTypes.INTEGER, allowNull: true },

    // Geocoding fields for pickup address
    pickupLatitude: { type: DataTypes.DECIMAL(10, 8) },
    pickupLongitude: { type: DataTypes.DECIMAL(11, 8) },
    pickupFormattedAddress: { type: DataTypes.TEXT },
    pickupPlaceId: { type: DataTypes.STRING },

    // Geocoding fields for drop address
    dropLatitude: { type: DataTypes.DECIMAL(10, 8) },
    dropLongitude: { type: DataTypes.DECIMAL(11, 8) },
    dropFormattedAddress: { type: DataTypes.TEXT },
    dropPlaceId: { type: DataTypes.STRING },

    // Product metadata (optional)
    productUrl: { type: DataTypes.TEXT },
    productTitle: { type: DataTypes.STRING },
    productImage: { type: DataTypes.TEXT },
    productPrice: { type: DataTypes.STRING },

    // Logistics and pricing
    logisticType: { type: DataTypes.ENUM('standard', 'express', 'economy'), defaultValue: 'standard' },
    vehicleType: { type: DataTypes.ENUM('two_wheeler', 'four_wheeler', 'six_wheeler'), defaultValue: 'two_wheeler' },
    logisticCategory: { type: DataTypes.ENUM('home_shifting', 'goods_shifting', 'materials_shifting', 'other'), defaultValue: 'goods_shifting' },
    distanceKm: { type: DataTypes.DECIMAL(10, 2), defaultValue: 1.0 },
    unitPrice: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    totalPrice: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 }
  }, {
    tableName: 'deliveries'
  });

  return Delivery;
};
