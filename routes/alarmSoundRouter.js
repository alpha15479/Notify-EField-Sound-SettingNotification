const express = require('express');
const router = express.Router();
const { uploadMiddleware } = require('../middlewares/uploadMiddleware');
const { validate, uploadAlarmSound, updateAlarmSound, getAllAlarm, getAlarmById, deleteAlarmSound } = require('../controllers/alarmSound');

router.get('/', getAllAlarm);
router.get('/:id', getAlarmById);
router.post('/', uploadMiddleware, validate(), uploadAlarmSound);
router.put('/:id', uploadMiddleware, validate(), updateAlarmSound);
router.delete('/:id', deleteAlarmSound)

module.exports = router;