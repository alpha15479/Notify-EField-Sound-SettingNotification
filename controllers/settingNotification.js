const SettingNotificationService = require('../services/settingNotificationService');
const { check, validationResult } = require('express-validator');

const validate = (method) => {
  switch (method) {
    case 'createSettingNotification': {
      return [
        check('custom_key', 'custom_key is required').not().isEmpty(),
        check('text', 'text is required').not().isEmpty(),
        check('email_notification', 'email_notification is required').not().isEmpty(),
        check('line_notification', 'line_notification is required').not().isEmpty(),
        check('iot_notification', 'iot_notification is required').not().isEmpty(),
      ];
    }
    default:
      return [];
  }
}

const getAllSettingNotifications = async (req, res, next) => {
  try {
    const settingNotifications = await SettingNotificationService.getAllSettingNotifications();
    res.status(200).json(settingNotifications);
  } catch (error) {
    next(error);
  }
};

const getSettingNotificationById = async (req, res, next) => {
  try {
    const settingNotification = await SettingNotificationService.getSettingNotificationById(req.params.id);
    if (!settingNotification) {
      return res.status(204).json({ message: 'Setting notification data not found' });
    }
    res.status(200).json(settingNotification);
  } catch (error) {
    next(error);
  }
};

const createSettingNotification = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const newSettingNotification = await SettingNotificationService.createSettingNotification(req.body);
    res.status(201).json(newSettingNotification);
  } catch (error) {
    next(error);
  }
};

const updateSettingNotificationById = async (req, res, next) => {
  try {
    const notification = await SettingNotificationService.getSettingNotificationById(req.params.id);
    if (!notification) {
      return res.status(204).json({ message: 'Setting notification not found' });
    }

    const updatedSettingNotification = await SettingNotificationService.updateSettingNotificationById(req.params.id, req.body);
    res.status(200).json(updatedSettingNotification);
  } catch (error) {
    next(error);
  }
};

const deleteSettingNotificationById = async (req, res, next) => {
  try {
    const notification = await SettingNotificationService.getSettingNotificationById(req.params.id);
    if (!notification) {
      return res.status(204).json({ message: 'Setting notification not found' });
    }

    const deletedSettingNotification = await SettingNotificationService.deleteSettingNotificationById(req.params.id);
    res.status(204).json(deletedSettingNotification);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  validate,
  getAllSettingNotifications,
  getSettingNotificationById,
  createSettingNotification,
  updateSettingNotificationById,
  deleteSettingNotificationById,
};