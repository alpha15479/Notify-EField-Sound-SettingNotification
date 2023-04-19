const { emailNotification, lineNotification } = require('../services/notification');

const email = async (req, res) => {
  try {
    const data = await emailNotification();
    res.status(200).json({ 'message': 'Sending Email Successfully', 'data': data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const line = async (req, res) => {
  try {
    const data = await lineNotification();
    res.status(200).json({ 'message': 'Sending Email Successfully', 'data': data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = { email, line };