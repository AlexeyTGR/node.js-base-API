'use strict';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    role: DataTypes.STRING,
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    dateOfBirth: DataTypes.DATEONLY,
  }, {  
    defaultScope: {
    attributes: { exclude: ['password'] }
  }});

  return User;
};
