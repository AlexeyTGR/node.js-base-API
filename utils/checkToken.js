require('dotenv').config();
const db = require('../models');
const jwt = require('jsonwebtoken');
const privateKey = process.env.PRIVATE_KEY;
const { errorHandler } = require('../utils/responseHandler');
const { forbidden, notFound } = require('../utils/errorCreator');

const promisifiedVerify = async (token, key) => {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token.split(' ')[1],
      key,
      (err, decoded) => {
        if (err) {
          return reject(err);
        };
        return resolve(decoded);
      },
    );
  });
};

const isAdmin = async (id) => {
  try {
    const user = await db.User.findByPk(id);
    if (!user) { throw notFound('user not found') };

    return user.role === 'admin';
  } catch (error) {
    errorHandler(res, error.code, error.message);
  };
};

module.exports.checkToken = async (req, res, next) => {
  try {
    const token = req.headers?.authorization || null;
    if (token) {
      const result = await promisifiedVerify(token, privateKey);
      const admin = await isAdmin(result.id);
      if (admin) { return next() };

      if (req.params.id) {
        if (result.id !== +req.params.id) {
          throw forbidden('you are not allowed to access this data');
        };
        return next();
      };
      throw forbidden('you are not allowed to access this data');
    };
  } catch (error) {
    console.error('check token error:', error);
    errorHandler(res, error.code, error.message);
  };
};