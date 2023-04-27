const { Sequelize } = require('sequelize');
require('dotenv').config();

const {MYSQL_HOSTNAME, MYSQL_USERNAME, MYSQL_PASSWORD, MYSQL_DB} = process.env

const sequelize = new Sequelize(MYSQL_DB, MYSQL_USERNAME, MYSQL_PASSWORD, {
  host: MYSQL_HOSTNAME,
  dialect: 'mysql', 
});

sequelize.sync().then(() => {
  console.log('Table created successfully');
}).catch((err) => {
  console.error('Unable to create table', err);
});

module.exports = sequelize;