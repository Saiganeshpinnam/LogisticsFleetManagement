const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Delivery = sequelize.define('Delivery', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    pickupAddress: { type: DataTypes.STRING, allowNull: false },
    dropAddress: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.ENUM('pending','on_route','delivered'), defaultValue: 'pending' },
    scheduledStart: { type: DataTypes.DATE },
    scheduledEnd: { type: DataTypes.DATE },
    
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
    productPrice: { type: DataTypes.STRING }
  }, {
    tableName: 'deliveries'
  });

  return Delivery;
};
