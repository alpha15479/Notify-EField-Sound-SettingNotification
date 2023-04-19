const express = require('express');
const router = express.Router();
const { sendLineNotification } = require('../services/sendingLine');

router.post('/', (req, res) => {
  const { token, message} = req.body;

  if (!token || !message) {
    res.status(400).json({ message: 'Invalid request parameters' });
    return;
  }

  sendLineNotification(token, message);
  res.status(200).json({ message: 'Sending line successfully' });
});

module.exports = router;