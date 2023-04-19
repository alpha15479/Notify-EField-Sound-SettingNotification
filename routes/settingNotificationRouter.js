const express = require('express');
const router = express.Router();
const settingNotificationController = require('../controllers/settingNotification');

router.get('/', settingNotificationController.getAllSettingNotifications);
router.get('/:id', settingNotificationController.getSettingNotificationById);
router.post('/', settingNotificationController.validate('createSettingNotification'), settingNotificationController.createSettingNotification);
router.put('/:id', settingNotificationController.updateSettingNotificationById);
router.delete('/:id', settingNotificationController.deleteSettingNotificationById);

module.exports = router;