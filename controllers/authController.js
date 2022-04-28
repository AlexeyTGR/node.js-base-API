const { User } = require('../models');
const hashPassword = require('../utils/hashPassword');
const verifyPassword = require('../utils/verifyPassword');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const privateKey = process.env.PRIVATE_KEY;

exports.signUp = async (req, res) => {
  if (!req.body) { return res.sendStatus(400) };

  const {
    firstName,
    lastName,
    email,
    password,
    dateOfBirth
  } = req.body;

  const hashedPassword = await hashPassword.hashPassword(password);

  if (!validator.isEmail(email)) {
    return res.status(406).json({ message: 'Wrong email' });
  };

  const newUser = {
    role: 'user',
    firstName: firstName,
    lastName: lastName,
    email: email,
    password: hashedPassword,
    dateOfBirth: dateOfBirth,
  };

  try {
    const result = await User.create(newUser);
    const token = jwt.sign({ id: result.id }, privateKey);
    delete result.dataValues.password;

    return res.json({
      result,
      token
    });
  } catch (error) {
    console.error('registration error:', error);
    return res.status(400).json({ message: error.message });
  };
};

exports.signIn = async (req, res) => {
  if (!req.body) { return res.sendStatus(400) };
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email: email } });

    if (!user) {
      return res.status(404).json('User with this email not found');
    };

    const varifyPasswords = await verifyPassword.verifyPassword(password, user.password);

    delete user.dataValues.password;

    if (varifyPasswords) {

      const token = jwt.sign({ id: user.id }, privateKey);
      return res.status(200).json({
        message: 'You are signed in',
        user,
        token
      });
    }
    return res.status(401).json({ message: 'Wrong password' });
  } catch (error) {
    console.error('authentication error:', error);
    return res.status(400).json({ message: error.message });
  };
};