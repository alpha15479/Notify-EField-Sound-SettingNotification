const axios = require('axios');
const nodemailer = require('nodemailer');
const moment = require('moment');
const {logger} = require('../config/lineNotificationLogger');
const fs = require('fs');
const path = require('path');

async function getSettingNotifications(config) {
  const response = await axios.get('http://localhost:3000/api/v1/setting-notifications/', config);
  return response.data;
}

async function getLightningWarning(config) {
  const warning = await axios.get('http://103.225.27.60:8081/api/v1/lightningWarning', config);
  return warning.data;
}

async function getUsers(config) {
  const userData = await axios.get('http://103.225.27.60:8082/api/v1/organizations/', config);
  return userData.data;
}

const sendEmail = async (email, text) => {
    try {
      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: EMAIL_USER,
          pass: EMAIL_PASSWORD
        }
      });
  
      let info = await transporter.sendMail({
        from: EMAIL_USER,
        to: email,
        subject: 'Notification From Kumwell Alarm Viewer',
        text: text
      });
  
      console.log('Email sent: ' + info.response);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
};

const emailNotification = async (req, token) => {
    try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        
        const response = await axios.get('http://localhost:3000/api/v1/setting-notifications/', config);
        const data = response.data;

        const allEmail = [];

        const warning = await axios.get('http://103.225.27.60:8081/api/v1/lightningWarning', config)
        const warningData = warning.data;

        const userData = await axios.get('http://103.225.27.60:8080/api/v1/users/', config)
        const users = userData.data;

        for (let i = 0; i < data.length; i++) {
          if (data[i].email_notification === true) {
              const text = data[i].text;
              console.log('Text : ' + text);
              const matchingUser = warningData.find(warning => warning.keyName === data[i].custom_key);
              console.log('matchingUser : ' + matchingUser)
              if (matchingUser) {
                users.forEach(user => {
                  const org = user.organization
                  if (org) {
                    if (org.keyName === data[i].custom_key) {
                      console.log('Key names match:', org.keyName);
                      console.log('Line token:', org.keyLine);
                    }
                  } else{
                    console.log("No organization data")
                  }
                });
                const email = matchingUser.email;
                console.log("User Email :", email);
                try {
                    await sendEmail(email, text);
                    allEmail.push(email);
                } catch(err) {
                    throw new Error(err);
                }
              }
          }
        }
        return allEmail;
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
};

module.exports = { emailNotification };