'use strict';

// const { DataTypes } = require('sequelize');
// const sequelize = new Sequelize('sqlite::memory:');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    dateOfBirth: DataTypes.DATE,
  }, {});

  return User;
};
