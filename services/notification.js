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
  const userData = await axios.get('http://103.225.27.60:8080/api/v1/organizations/', config);
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

const lineNotification = async (req, token) => {
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

          console.log('---------Latest ID--------', latestId)
        
          if (latestDateObj < currentDate) {
            console.log('----------หมดเวลา----------');
            console.log('Data ID :', latestId)
            console.log('Zone :', latestZone)
            console.log('Key name in timeout:', latestKeyName)
            console.log('----------ตรวจสอบเวลา----------');
            const thailandTime = moment.utc(currentDate).utcOffset(+7).format('YYYY-MM-DD HH:mm:ss');
            const thailandTime1 = moment.utc(latestDateObj).utcOffset(+7).format('YYYY-MM-DD HH:mm:ss');
            console.log('เวลาในไทยปัจจุบัน:', thailandTime);
            console.log('เวลาล่าสุดของ matchingUser:', thailandTime1);
            logger.error(`Method(POST), Alert time is not current with key name '${latestKeyName}' ID: ${latestId} | Date ${thailandTime1}.`);
          } else {
            const isIdExist = lineLoggerId.includes(latestId);
            if (isIdExist === true) {
              console.log(`---------เคยแจ้งเตือนไปแล้วจ้า---------- ID ล่าสุด ${latestId} exists in lineLoggerId: ${isIdExist}`);
              logger.error(`Method(POST), This ID (${lastUser.id}) has been previously notified.`);
            } else {
              console.log(`---------ยังไม่เคยจ้า---------- ID ล่าสุด ${latestId} not exists in lineLoggerId: ${isIdExist}`);
              console.log('********แจ้งเตือนเลย');
              for (const user of users) {
                if (user.keyName === data[i].custom_key) {
                  let message = ''
                  
                  console.log('Key names match:', user.keyName);
                  console.log('Line token:', user.keyLine);
                  console.log('Data ID :', latestId)
                  console.log('Zone :', latestZone)
  
                  console.log('Current date', currentDate);
                  console.log('Latest Date Obj:', latestDateObj);
                  console.log('Latest Date:', latestDate);
                  console.log('Latest key name:', latestKeyName);
                  
                  const thailandTime = moment.utc(currentDate).utcOffset(+7).format('YYYY-MM-DD HH:mm:ss');
                  const thailandTime1 = moment.utc(latestDateObj).utcOffset(+7).format('YYYY-MM-DD HH:mm:ss');
                  console.log('เวลาในไทยปัจจุบัน:', thailandTime);
                  console.log('เวลาล่าสุดของ matchingUser:', thailandTime1);
  
                  if (latestZone === 'A') {
                    message = `ข้อความแจ้งเตือน "${text}" -- "ขณะนี้มีการตรวจจับสัญญาณฟ้าผ่าในพื้นที่ 0-5 กิโลเมตร ระดับที่ 1 โซนสีแดง ขอให้พนักงาานทุกท่านหยุดการปฏิบัติงาน" (The lightning warning system has been detected in 0-5 km. Level 1, Red Alert. All employees are requested to stop working.)`;
                  } else if (latestZone === 'B') {
                    message = `ข้อความแจ้งเตือน "${text}" -- "ขณะนี้มีการตรวจจับสัญญาณฟ้าผ่าในพื้นที่ 5-10 กิโลเมตร ระดับที่ 2 โซนสีเหลือง ขอให้พนักงาานทุกท่านปฏิบัติงานตามปกติด้วยความระมัดระวัง" (The lightning warning system has been detected in 5-10 km. Level 2 - Yellow Alert. The field work can proceed with carefully.)`;
                  } else if (latestZone === 'C') {
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

module.exports = { emailNotification, lineNotification };

// const lineNotification = async (req, token) => {
//   try {
//     const config = {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     };

//     const data = await getSettingNotifications(config);
//     const warningData = await getLightningWarning(config);
//     const users = await getUsers(config);
//     const allTokens = [];

//     const logFilePath = path.join(__dirname, '../logs', 'lineNotificationLog.log');
//     const idValues = await new Promise((resolve, reject) => {
//       fs.readFile(logFilePath, 'utf8', (err, data) => {
//         if (err) {
//           console.error('Failed to read log file:', err);
//           reject(err);
//           return;
//         }

//         const logLines = data.split('\n');
//         const infoLines = logLines.filter(line => line.includes('[info]'));
//         const idValues = [];

//         infoLines.forEach(line => {
//           const idIndex = line.indexOf('id');
//           if (idIndex !== -1) {
//             const idValue = line.substring(idIndex + 3).trim().replace('.', '');
//             idValues.push(parseInt(idValue));
//           }
//         });

//         resolve(idValues);
//       });
//     });

//     const lineLoggerId = idValues
//     console.log('All id from Line logger file:', lineLoggerId);

//     for (let i = 0; i < data.length; i++) {
//       if (data[i].line_notification === true) {
//         const text = data[i].text;
//         const matchingUser = warningData.filter(user => user.keyName === data[i].custom_key);
        
//         if (matchingUser.length > 0) {
//           let latestDate = matchingUser[0].DAT;
//           let latestKeyName = matchingUser[0].keyName;
//           let latestId = matchingUser[0].id;
//           let latestZone = matchingUser[0].zone;
        
//           const x = matchingUser.length + 1
//           console.log(x, '******************')
//           console.log(matchingUser[matchingUser.length - 1], '******************')
          
//           for (let j = 1; j < matchingUser.length; j++) {
//             const currentDate = matchingUser[j].DAT;
        
//             if (currentDate > latestDate) {
//               latestDate = currentDate;
//               latestKeyName = matchingUser[j].keyName;
//               latestId = matchingUser[j].id;
//               latestZone = matchingUser[j].zone;
//             }
//           }
        
//           const currentDate = new Date();
//           const latestDateObj = new Date(latestDate);

//           console.log('---------Latest ID--------', latestId)
        
//           if (latestDateObj < currentDate) {
//             console.log('----------หมดเวลา----------');
//             console.log('Data ID :', latestId)
//             console.log('Zone :', latestZone)
//             console.log('Key name in timeout:', latestKeyName)
//             console.log('----------ตรวจสอบเวลา----------');
//             const thailandTime = moment.utc(currentDate).utcOffset(+7).format('YYYY-MM-DD HH:mm:ss');
//             const thailandTime1 = moment.utc(latestDateObj).utcOffset(+7).format('YYYY-MM-DD HH:mm:ss');
//             console.log('เวลาในไทยปัจจุบัน:', thailandTime);
//             console.log('เวลาล่าสุดของ matchingUser:', thailandTime1);
//             logger.error(`Method(POST), Alert time is not current with key name '${latestKeyName}' ID: ${latestId} | Date ${thailandTime1}.`);
//           } else {
//             const isIdExist = lineLoggerId.includes(latestId);
//             if (isIdExist === true) {
//               console.log(`---------เคยแจ้งเตือนไปแล้วจ้า---------- ID ล่าสุด ${latestId} exists in lineLoggerId: ${isIdExist}`);
//             } else {
//               console.log(`---------ยังไม่เคยจ้า---------- ID ล่าสุด ${latestId} not exists in lineLoggerId: ${isIdExist}`);
//             }
            // console.log(`ID ${latestId} exists in lineLoggerId: ${isIdExist}`);
            // console.log('********แจ้งเตือนเลย');
            // for (const user of users) {
            //   if (user.keyName === data[i].custom_key) {
            //     let message = ''
                
            //     console.log('Key names match:', user.keyName);
            //     console.log('Line token:', user.keyLine);
            //     console.log('Data ID :', latestId)
            //     console.log('Zone :', latestZone)

            //     console.log('Current date', currentDate);
            //     console.log('Latest Date Obj:', latestDateObj);
            //     console.log('Latest Date:', latestDate);
            //     console.log('Latest key name:', latestKeyName);
                
            //     const thailandTime = moment.utc(currentDate).utcOffset(+7).format('YYYY-MM-DD HH:mm:ss');
            //     const thailandTime1 = moment.utc(latestDateObj).utcOffset(+7).format('YYYY-MM-DD HH:mm:ss');
            //     console.log('เวลาในไทยปัจจุบัน:', thailandTime);
            //     console.log('เวลาล่าสุดของ matchingUser:', thailandTime1);

            //     if (latestZone === 'A') {
            //       message = `ข้อความแจ้งเตือน "${text}" -- "ขณะนี้มีการตรวจจับสัญญาณฟ้าผ่าในพื้นที่ 0-5 กิโลเมตร ระดับที่ 1 โซนสีแดง ขอให้พนักงาานทุกท่านหยุดการปฏิบัติงาน" (The lightning warning system has been detected in 0-5 km. Level 1, Red Alert. All employees are requested to stop working.)`;
            //     } else if (latestZone === 'B') {
            //       message = `ข้อความแจ้งเตือน "${text}" -- "ขณะนี้มีการตรวจจับสัญญาณฟ้าผ่าในพื้นที่ 5-10 กิโลเมตร ระดับที่ 2 โซนสีเหลือง ขอให้พนักงาานทุกท่านปฏิบัติงานตามปกติด้วยความระมัดระวัง" (The lightning warning system has been detected in 5-10 km. Level 2 - Yellow Alert. The field work can proceed with carefully.)`;
            //     } else if (latestZone === 'C') {
            //       message = `ข้อความแจ้งเตือน "${text}" -- "ขณะนี้มีการตรวจจับสัญญาณฟ้าผ่าในพื้นที่ 10-15 กิโลเมตร ระดับที่ 3 โซนสีเขียว ขอให้พนักงาานทุกท่านปฏิบัติงานตามปกติ" (The lightning warning system has been detected in 10-15 km. Level 3, Green Alert. Please instruct the employees to resume their work as usual.)`;
            //     } else {
            //       message = `ข้อความแจ้งเตือน "${text}" -- "สถานการณ์ฟ้าผ่าได้เข้าสู่ภาวะปกติ ขอให้ทุกท้่านพิจารณากลับเข้าทำงานได้ตามปกติ" (The lightning situation is back to normal, please consider resume to normal duties.)`;
            //       break; 
            //     }

            //     const notifyResponse = await axios.post(`https://notify-api.line.me/api/notify?message=${message}`, {}, {
            //       headers: {
            //         'Authorization': `Bearer ${user.keyLine}`
            //       }
            //     });

            //     if (notifyResponse.data.status === 401) {
            //       console.log("Invalid access token for user:", matchingUser);
            //     }

            //     allTokens.push(user.keyLine);
            //     console.log('LINE Notify response:', notifyResponse.data);
            //     logger.info(`Method(POST), Sending line notification with data id ${latestId} keyName: '${latestKeyName}'.`);
            //   }
            // }
//           }
//         }
//       }
//     }
//     return allTokens;
//   } catch (error) {
//     console.log(error);
//     throw new Error(error);
//   }
// };