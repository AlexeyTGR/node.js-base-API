const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { verifyPassword } = require('../utils/verifyPassword');
const { notFound, forbidden, unauthorized } = require('../utils/errorCreator');
const { responseHandler, errorHandler } = require('../utils/responseHandler');
const privateKey = process.env.PRIVATE_KEY;

exports.signUp = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      dateOfBirth
    } = req.body;

    const newUser = {
      firstName,
      lastName,
      email,
      password,
      dateOfBirth,
    };

    const user = await User.findOne({ where: { email } });
    if (user) {
      throw forbidden('User with this email already exist');
    };

    let createdUser = await User.create(newUser);
    createdUser = createdUser.toJSON();
    delete createdUser.password;
    if (!createdUser) { throw notFound('Something going wrong...') };
    const token = jwt.sign({ id: createdUser.id }, privateKey);

    responseHandler(res, 'Welcome, friend!', createdUser, token);
  } catch (error) {
    console.error(error);
    errorHandler(res, error.code, error.message);
  };
};

exports.signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.scope('withPassword').findOne({
      where: { email }
    });
    if (!user) {
      throw notFound('User with this email not found');
    };
    const varifyPasswords = await verifyPassword(password, user.password);
    if (!varifyPasswords) {
      throw unauthorized('Wrong password');
    };
    user = user.toJSON();
    delete user.password;
    const token = jwt.sign({ id: user.id }, privateKey);
    responseHandler(res, 'You are signed in', user, token);
  } catch (error) {
    console.error(error);
    errorHandler(res, error.code, error.message);
  };
};