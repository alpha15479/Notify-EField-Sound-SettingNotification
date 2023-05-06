const SettingNotificationService = require('../services/settingNotificationService');
const { check, validationResult } = require('express-validator');
const {logger} = require('../config/settingNotificationLogger');

const validate = (method) => {
  switch (method) {
    case 'createSettingNotification': {
      return [
        check('custom_key', 'custom_key is required').not().isEmpty(),
        check('text', 'text is required').not().isEmpty(),
        check('custom_key').custom(async (value, { req }) => {
          const existingSetting = await SettingNotificationService.findOne({ custom_key: value });
          if (existingSetting) {
            logger.error(`Method(POST), custom_key is required!.`);
            return Promise.reject('Custom key already exists');
          }
        }),
        // check('email_notification', 'email_notification is required').not().isEmpty(),
        // check('line_notification', 'line_notification is required').not().isEmpty(),
        // check('iot_notification', 'iot_notification is required').not().isEmpty(),
      ];
    }
    default:
      return [];
  }
}

const getAllSettingNotifications = async (req, res, next) => {
  try {
    const settingNotifications = await SettingNotificationService.getAllSettingNotifications();
    logger.info(`Method(GET), Get all setting notifications data.`);
    res.status(200).json(settingNotifications);
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

const getSettingNotificationById = async (req, res, next) => {
  try {
    const settingNotification = await SettingNotificationService.getSettingNotificationById(req.params.id);
    if (!settingNotification) {
      logger.error(`Method(GET), Setting notification with ID ${req.params.id} not found.`);
      return res.status(204).json({ message: 'Setting notification data not found' });
    }
    logger.info(`Method(GET), Get setting notification with ID ${req.params.id}.`);
    res.status(200).json(settingNotification);
  } catch (error) {
    logger.error(error);
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
    logger.info(`Method(POST), Create setting notification successfully.`);
    res.status(201).json(newSettingNotification);
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

const updateSettingNotificationById = async (req, res, next) => {
  try {
    const notification = await SettingNotificationService.getSettingNotificationById(req.params.id);
    if (!notification) {
      logger.error(`Method(PUT), Setting notification with ID ${req.params.id} not found.`);
      return res.status(204).json({ message: 'Setting notification not found' });
    }

    const updatedSettingNotification = await SettingNotificationService.updateSettingNotificationById(req.params.id, req.body);
    logger.info(`Method(PUT), Update setting notification with ID ${req.params.id}.`);
    res.status(200).json(updatedSettingNotification);
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

const deleteSettingNotificationById = async (req, res, next) => {
  try {
    const notification = await SettingNotificationService.getSettingNotificationById(req.params.id);
    if (!notification) {
      logger.error(`Method(DELETE), Setting notification with ID ${req.params.id} not found.`);
      return res.status(204).json({ message: 'Setting notification not found' });
    }

    const deletedSettingNotification = await SettingNotificationService.deleteSettingNotificationById(req.params.id);
    logger.info(`Method(DELETE), Delete setting notification with ID ${req.params.id}.`);
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