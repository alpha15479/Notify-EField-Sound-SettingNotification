const express = require('express');
const router = express.Router();
const { sendLineNotification } = require('../services/sendingLine');

router.post('/', (req, res) => {
  const { token, message} = req.body;

  if (!token) {
    res.status(400).json({ message: 'token is required!' });
    return;
  }

  if (!message) {
    res.status(400).json({ message: 'notification message is required!' });
    return;
  }

  sendLineNotification(token, message);
  res.status(200).json({ message: 'Sending line successfully' });
});

module.exports = router;