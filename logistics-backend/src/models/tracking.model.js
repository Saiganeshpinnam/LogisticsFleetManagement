const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Tracking = sequelize.define('Tracking', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    deliveryId: { type: DataTypes.INTEGER, allowNull: false },
    lat: { type: DataTypes.DECIMAL(10,7), allowNull: false },
    lng: { type: DataTypes.DECIMAL(10,7), allowNull: false }
  }, {
    tableName: 'tracking'
  });

  return Tracking;
};
