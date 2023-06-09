const express = require('express');
const app = express();
require('dotenv').config();

const {PORT} = process.env
const settingNotificationRouter = require('./routes/settingNotificationRouter');
const eFieldSensorRouter = require('./routes/eFieldSensorRouter');
const alarmSoundRouter = require('./routes/alarmSoundRouter');
const testSendingLineRouter = require('./routes/testSendingLine');
const notificationRouter = require('./routes/notification');
const emailRoutes = require('./routes/testSendingEmail');
const lineNotificationRouter = require('./routes/lineRouter');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/api/v1/setting-notifications', settingNotificationRouter);
app.use('/api/v1/e-field-sensor', eFieldSensorRouter);
app.use('/api/v1/alarm-sound', alarmSoundRouter);
app.use('/api/v1/test-sending-line', testSendingLineRouter);
app.use('/api/v1/notification', notificationRouter);
app.use('/api/v1/test-sending-email', emailRoutes);

app.use('/api/v1/sending-line-notification', lineNotificationRouter);
setInterval(async () => {
  try {
    console.log('Sending LINE notification...');
    const token = req.headers.authorization.split(' ')[1];
    await lineNotification(req, token);
    console.log('LINE notification sent successfully');
  } catch (error) {
    console.error(error);
  }
}, 60000);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong' , err});
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});