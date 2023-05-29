// const { Sequelize } = require('sequelize');
// require('dotenv').config();

// const {MYSQL_HOSTNAME, MYSQL_USERNAME, MYSQL_PASSWORD, MYSQL_DB} = process.env

// const sequelize = new Sequelize(MYSQL_DB, MYSQL_USERNAME, MYSQL_PASSWORD, {
//   host: MYSQL_HOSTNAME,
//   dialect: 'mysql', 
// });

// sequelize.sync().then(() => {
//   console.log('Table created successfully');
// }).catch((err) => {
//   console.error('Unable to create table', err);
// });

// module.exports = sequelize;

const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');
require('dotenv').config();

const { MYSQL_HOSTNAME, MYSQL_USERNAME, MYSQL_PASSWORD, MYSQL_DB, MYSQL_PORT } = process.env;

const sequelize = new Sequelize(MYSQL_DB, MYSQL_USERNAME, MYSQL_PASSWORD, {
  host: MYSQL_HOSTNAME,
  dialect: 'mysql',
});

async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Connection to the database has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);

    try {
      const connection = await mysql.createConnection({
        host: MYSQL_HOSTNAME,
        user: MYSQL_USERNAME,
        password: MYSQL_PASSWORD,
        database: MYSQL_DB,
        port: MYSQL_PORT,
      });

      await connection.query(`CREATE DATABASE IF NOT EXISTS ${MYSQL_DB}`);
      console.log('Database created successfully.');
    } catch (error) {
      console.error('Error when try to create database:', error);
    }
  }

  sequelize.sync().then(() => {
    console.log('Table created successfully');
  }).catch((err) => {
    console.error('Unable to create table', err);
  });
}

initializeDatabase();

module.exports = sequelize;