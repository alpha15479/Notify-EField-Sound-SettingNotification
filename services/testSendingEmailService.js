const nodemailer = require('nodemailer');

class EmailService {
  async sendEmail(email, message) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'phutthinan.mo.62@ubu.ac.th',
            pass: 'rkeT6357'
        }
      });

      const mailOptions = {
        from: 'phutthinan.mo.62@ubu.ac.th', 
        to: email, 
        subject: 'Test Email',
        text: message 
      };

      const result = await transporter.sendMail(mailOptions);
      console.log(result);

      return result;
    } catch (error) {
      console.log(error);
      throw new Error('Failed to send email');
    }
  }
}

module.exports = new EmailService();