const request = require('request');

const url_line_notification = "https://notify-api.line.me/api/notify";

function sendLineNotification(token, message, image) {
  request({
    method: 'POST',
    uri: url_line_notification,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    auth: {
      bearer: token,
    },
    formData: {
      message: message,
    },
  }, (err, httpResponse, body) => {
    if (err) {
      console.error(err);
    } else {
      console.log(body);
    }
  });
}

module.exports = { sendLineNotification };