const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Vehicle = sequelize.define('Vehicle', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    plateNumber: { type: DataTypes.STRING, allowNull: false, unique: true },
    vehicleCode: { type: DataTypes.STRING, allowNull: true, unique: true },
    model: { type: DataTypes.STRING },
    status: { type: DataTypes.ENUM('available','in_service','unavailable'), defaultValue: 'available' }
  }, {
    tableName: 'vehicles'
  });

  return Vehicle;
};
