'use strict';
const crypto = require('crypto');
const { salt } = require('../config/config');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    role: {
      type: DataTypes.ENUM('user', 'admin'),
      defaultValue: 'admin',
    },
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: DataTypes.STRING,
    password: {
      type: DataTypes.STRING,
      set(value) {
        const hash = crypto.pbkdf2Sync(value, salt,
          100, 64, `sha512`).toString(`hex`);
        this.setDataValue('password', hash);
      },
    },
    dateOfBirth: DataTypes.DATEONLY,
  }, {
    defaultScope: {
      attributes: { exclude: ['password'] },
    },
    scopes: {
      withPassword: {
      },
    },
  });

  return User;
};
