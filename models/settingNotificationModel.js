const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SettingNotification = sequelize.define('SettingNotification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  custom_key: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  text: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email_notification: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  line_notification: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  iot_notification: {
    type: DataTypes.BOOLEAN,
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
  tableName: 'setting_notifications',
  timestamps: true, 
  createdAt: 'created_at', 
  updatedAt: 'updated_at' 
});

module.exports = SettingNotification;