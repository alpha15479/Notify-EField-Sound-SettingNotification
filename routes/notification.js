const express = require('express');
const router = express.Router();
const { getDataFromDatabase } = require('../services/notification');
const notificationController = require('../controllers/notification');

router.get('/', (req, res) => {
  getDataFromDatabase((err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error retrieving data from database');
    } else {
      res.send(results);
    }
  });
});

router.post('/email-notification', notificationController.email);
router.post('/line-notification', notificationController.line);

module.exports = router;