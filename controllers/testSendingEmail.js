const emailService = require('../services/testSendingEmailService');

class EmailController {
  async sendEmail(req, res) {
    try {
      const { email, message } = req.body;

      if (!email) {
        res.status(400).json({ message: 'email is required!' });
        return;
      }

      const result = await emailService.sendEmail(email, message);

      res.status(200).json({ 'message': 'Sending Email Successfully', 'data': result });
    } catch (error) {
      console.log(error);
      res.status(500).json({ 'message': 'Failed to send email', 'data': error });
    }
  }
}

module.exports = new EmailController();