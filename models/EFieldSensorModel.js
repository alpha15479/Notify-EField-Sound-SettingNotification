const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EFieldSensor = sequelize.define('EFieldSensor', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  warning_point_id: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  e_field_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  lat: {
    type: DataTypes.FLOAT(10,4),
    allowNull: false
  },
  lon: {
    type: DataTypes.FLOAT(10,4),
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'e_field_sensor',
  timestamps: true, 
  createdAt: 'created_at', 
  updatedAt: 'updated_at' 
});

module.exports = EFieldSensor;