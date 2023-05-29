const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/lineNotification');

router.post('/', notificationController.line);

module.exports = router;