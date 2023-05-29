const axios = require('axios');
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

const lineNotification = async (req, token) => {
  console.log("Here is check in line service.")
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const data = await getSettingNotifications(config);
    const warningData = await getLightningWarning(config);
    const users = await getUsers(config);
    const allTokens = [];

    const logFilePath = path.join(__dirname, '../logs', 'lineNotificationLog.log');
    const idValues = await new Promise((resolve, reject) => {
      fs.readFile(logFilePath, 'utf8', (err, data) => {
        if (err) {
          console.error('Failed to read log file:', err);
          reject(err);
          return;
        }

        const logLines = data.split('\n');
        const infoLines = logLines.filter(line => line.includes('[info]'));
        const idValues = [];

        infoLines.forEach(line => {
          const idIndex = line.indexOf('id');
          if (idIndex !== -1) {
            const idValue = line.substring(idIndex + 3).trim().replace('.', '');
            idValues.push(parseInt(idValue));
          }
        });

        resolve(idValues);
      });
    });

    const lineLoggerId = idValues
    console.log('All id from Line logger file:', lineLoggerId);

    for (let i = 0; i < data.length; i++) {
      if (data[i].line_notification === true) {
        const text = data[i].text;
        const matchingUser = warningData.filter(user => user.keyName === data[i].custom_key);
        
        if (matchingUser.length > 0) {
          const lastUser = matchingUser[matchingUser.length - 1];
        
          const latestDate = lastUser.DAT
          const latestId = lastUser.id
          const latestZone = lastUser.zone
          const latestKeyName = lastUser.keyName

          const currentDate = new Date();
          const latestDateObj = new Date(latestDate);
        
          if (latestDateObj < currentDate) {
            console.log('----------หมดเวลา----------');
          } else {
            const isIdExist = lineLoggerId.includes(latestId);
            if (isIdExist === true) {
              console.log(`---------เคยแจ้งเตือนไปแล้วจ้า---------- ID ล่าสุด ${latestId} exists in lineLoggerId: ${isIdExist}`);
            } else {
              console.log(`---------ยังไม่เคยจ้า---------- ID ล่าสุด ${latestId} not exists in lineLoggerId: ${isIdExist}`);
              for (const user of users) {
                if (user.keyName === data[i].custom_key) {
                  let message = ''
  
                  if (latestZone === 'R') {
                    message = `ข้อความแจ้งเตือน "${text}" -- "ขณะนี้มีการตรวจจับสัญญาณฟ้าผ่าในพื้นที่ 0-5 กิโลเมตร ระดับที่ 1 โซนสีแดง ขอให้พนักงาานทุกท่านหยุดการปฏิบัติงาน" (The lightning warning system has been detected in 0-5 km. Level 1, Red Alert. All employees are requested to stop working.)`;
                  } else if (latestZone === 'A') {
                    message = `ข้อความแจ้งเตือน "${text}" -- "ขณะนี้มีการตรวจจับสัญญาณฟ้าผ่าในพื้นที่ 5-10 กิโลเมตร ระดับที่ 2 โซนสีเหลือง ขอให้พนักงาานทุกท่านปฏิบัติงานตามปกติด้วยความระมัดระวัง" (The lightning warning system has been detected in 5-10 km. Level 2 - Yellow Alert. The field work can proceed with carefully.)`;
                  } else if (latestZone === 'B') {
                    message = `ข้อความแจ้งเตือน "${text}" -- "ขณะนี้มีการตรวจจับสัญญาณฟ้าผ่าในพื้นที่ 10-15 กิโลเมตร ระดับที่ 3 โซนสีเขียว ขอให้พนักงาานทุกท่านปฏิบัติงานตามปกติ" (The lightning warning system has been detected in 10-15 km. Level 3, Green Alert. Please instruct the employees to resume their work as usual.)`;
                  } else {
                    message = `ข้อความแจ้งเตือน "${text}" -- "สถานการณ์ฟ้าผ่าได้เข้าสู่ภาวะปกติ ขอให้ทุกท้่านพิจารณากลับเข้าทำงานได้ตามปกติ" (The lightning situation is back to normal, please consider resume to normal duties.)`;
                    break; 
                  }
  
                  const notifyResponse = await axios.post(`https://notify-api.line.me/api/notify?message=${message}`, {}, {
                    headers: {
                      'Authorization': `Bearer ${user.keyLine}`
                    }
                  });
  
                  if (notifyResponse.data.status === 401) {
                    console.log("Invalid access token for user:", lastUser);
                  }
                  
                  const resMessage = `User: ${lastUser.keyName}, Token: ${user.keyLine}`
                  allTokens.push(resMessage);
                  console.log('LINE Notify response:', notifyResponse.data);
                  logger.info(`Method(POST), Sending line notification with data id ${latestId} keyName: '${latestKeyName}'.`);
                }
              }
            }
          }
        }
      }
    }
    return allTokens;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

module.exports = { lineNotification };