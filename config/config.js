require('dotenv').config();

const config = {
  "username": process.env.DB_USERNAME,
  "password": process.env.DB_PASSWORD,
  "database": process.env.DB_NAME,
  "host": "127.0.0.1",
  "dialect": "postgres",
};

const salt = process.env.SALT;

module.exports = { config, salt };
