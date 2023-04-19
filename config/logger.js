const { createLogger, format, transports } = require('winston');
const path = require('path');
const ip = require('ip');
const ipv4 = ip.address();
const ipv6 = ip.address('public', 'ipv6');

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.label({ label: path.basename(process.mainModule.filename) }),
    format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
    format.printf(info => `IPv4: ${ipv4}, IPv6: ${ipv6} -- ${info.timestamp} [${info.level}] (${info.label}) message : ${info.message}`)
  ),
  transports: [
    // new transports.Console(),
    new transports.File({ filename: 'logs/eField.log' }),
  ]
});

module.exports = {logger};