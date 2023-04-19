const mysql = require('mysql2');
const axios = require('axios');
const nodemailer = require('nodemailer');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'kumwell'
});

connection.connect((err) => {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }
  // console.log('connected as id ' + connection.threadId);
});

function getDataFromDatabase(callback) {
  const query = 'SELECT * FROM user';
  connection.query(query, (err, results) => {
    if (err) {
      console.error(err);
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
}

getDataFromDatabase((err, results) => {
  if (err) {
    console.error(err);
  } 
  // else {
  //   console.log(results);
  // }
});

const sendEmail = async (email, text) => {
    try {
      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'phutthinan.mo.62@ubu.ac.th',
          pass: 'rkeT6357'
        }
      });
  
      let info = await transporter.sendMail({
        from: 'wichuda.ph.62@ubu.ac.th',
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

const emailNotification = async () => {
    try {
        const response = await axios.get('http://localhost:3000/api/v1/setting-notifications/');
        const data = response.data;

        const userResponse = await axios.get('http://localhost:3000/api/v1/notification');
        const users = userResponse.data;
        const allEmail = [];

        for (let i = 0; i < data.length; i++) {
        if (data[i].email_notification === true) {
            console.log('index : ', i);
            const text = data[i].text;
            console.log('Text : ' + text);
            const matchingUser = users.find(user => user.custom_key === data[i].custom_key);
            if (matchingUser) {
            const email = matchingUser.email;
            console.log("User Email :", email);
            try {
                await sendEmail(email, text);
                allEmail.push(email);
            } catch(err) {
                console.log("Error kaa");
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

const lineNotification = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/v1/setting-notifications/');
      const data = response.data;
  
      const userResponse = await axios.get('http://localhost:3000/api/v1/notification');
      const users = userResponse.data;
      const allToken = []
          
      for (let i = 0; i < data.length; i++) {
        if (data[i].line_notification === true) {
            const text = data[i].text
            const matchingUser = users.find(user => user.custom_key === data[i].custom_key);
            if (matchingUser) {
                const token = matchingUser.token
                console.log("User Token :", token);
                console.log("User Text :", text);

                const message = `Notification From Kumwell Alarm Viewer ${text}`;
                const notifyResponse = await axios.post(`https://notify-api.line.me/api/notify?message=${message}`, {}, {
                    headers: {
                    'Authorization': `Bearer ${token}`
                    }
                });

                if (notifyResponse.data.status === 401) {
                    console.log("Invalid access token for user:", matchingUser)
                }
                
                allToken.push(token)
                console.log('LINE Notify response:', notifyResponse.data);
            }
        }
      }

      return allToken;
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
};

module.exports = { getDataFromDatabase, emailNotification, lineNotification };