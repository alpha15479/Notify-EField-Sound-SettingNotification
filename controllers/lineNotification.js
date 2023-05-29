const {
  lineNotification,
} = require("../services/lineService");

const line = async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const data = await lineNotification(req, token);
    res.status(200).json({ status: 200, message: "Sending Line Successfully", data: data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { line };