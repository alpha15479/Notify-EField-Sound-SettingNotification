const nodemailer = require('nodemailer');
require('dotenv').config();

const {EMAIL_USER, EMAIL_PASSWORD} = process.env
const imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/1/1e/Kumwell.png';
class EmailService {
  async sendEmail(email, message) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASSWORD
        }
      });

      const mailOptions = {
        from: EMAIL_USER,
        to: email,
        subject: 'Notification From Kumwell Alarm Viewer!',
        html: `
          <html>
            <head>
              <style>
                .card {
                  border: 1px solid #ccc;
                  border-radius: 5px;
                  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.3);
                  margin: 10px;
                  padding: 10px;
                  min-width: 400px;
                }
                .card img {
                  display: block;
                  margin: 0 auto;
                  max-width: 100%;
                  height: auto;
                }
              </style>
            </head>
            <body>
              <div class="card">
                <h1>You've receive notification from Kumwell Alarm Viewer.</h1>
                <p>from: ${EMAIL_USER}</p>
                <img src="${imageUrl}" alt="Image" />
                <h1>Hello!</h1>
                <p>${message}</p>
              </div>
            </body>
          </html>
        `
      };

      const result = await transporter.sendMail(mailOptions);

      return
    } catch (error) {
      console.log(error);
      throw new Error('Failed to send email');
    }
  }
}

module.exports = new EmailService();