const {
  emailNotification,
  lineNotification,
} = require("../services/notification");

const email = async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const data = await emailNotification(req, token);
    res.status(200).json({ message: "Sending Email Successfully", data: data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const line = async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const data = await lineNotification(req, token);
    res.status(200).json({ status: 200, message: "Sending Line Successfully", data: data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { email, line };
