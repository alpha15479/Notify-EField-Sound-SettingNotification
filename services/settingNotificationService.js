const SettingNotification = require('../models/settingNotificationModel');

const getAllSettingNotifications = async () => {
  const settingNotifications = await SettingNotification.findAll();
  return settingNotifications;
};

const getOne = async () => {
  const settingNotifications = await SettingNotification.findOne();
  return settingNotifications;
};

const getSettingNotificationById = async (id) => {
  const settingNotification = await SettingNotification.findByPk(id);
  return settingNotification;
};

const createSettingNotification = async (newSettingNotification) => {
  const settingNotification = await SettingNotification.create(newSettingNotification);
  return settingNotification;
};

const updateSettingNotificationById = async (id, updatedSettingNotification) => {
  const settingNotification = await SettingNotification.findByPk(id);
  await settingNotification.update(updatedSettingNotification);
  return settingNotification;
};

const deleteSettingNotificationById = async (id) => {
  const settingNotification = await SettingNotification.findByPk(id);
  await settingNotification.destroy();
};

module.exports = {
  getOne,
  getAllSettingNotifications,
  getSettingNotificationById,
  createSettingNotification,
  updateSettingNotificationById,
  deleteSettingNotificationById
};