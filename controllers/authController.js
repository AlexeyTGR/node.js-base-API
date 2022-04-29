const { User } = require('../models');
const { hashPassword } = require('../utils/hashPassword');
const { verifyPassword } = require('../utils/verifyPassword');
const jwt = require('jsonwebtoken');
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

    const hashedPassword = await hashPassword(password);

    const newUser = {
      role: 'user',
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: hashedPassword,
      dateOfBirth: dateOfBirth,
    };

    const user = await User.findOne({ where: { email: email } });
    if (user) {
      throw forbidden('User with this email already exist');
    };

    const result = await User.create(newUser);
    if (!result) { throw notFound('Something going wrong...') };
    const token = jwt.sign({ id: result.id }, privateKey);
    delete result.dataValues.password;

    responseHandler(res, 'Welcome, friend!', result, token);
  } catch (error) {
    console.error('registration error:', error);
    errorHandler(res, error.code, error.message);
  };
};

exports.signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email: email } });

    if (!user) {
      throw notFound('User with this email not found');
    };

    const varifyPasswords = await verifyPassword(password, user.password);
    delete user.dataValues.password;
    if (!varifyPasswords) {
      throw unauthorized('Wrong password');
    };

    const token = jwt.sign({ id: user.id }, privateKey);
    responseHandler(res, 'You are signed in', user, token);
  } catch (error) {
    console.error('authentication error:', error);
    errorHandler(res, error.code, error.message);
  };
};