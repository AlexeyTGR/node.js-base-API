require('dotenv').config();
const jwt = require('jsonwebtoken');
const db = require('../models');
const { errorHandler } = require('../utils/responseHandler');
const { forbidden, notFound } = require('../utils/errorCreator');

const privateKey = process.env.PRIVATE_KEY;

const promisifiedVerify = async (token, key) => {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      key,
      (err, decoded) => {
        if (err) {
          return reject(err);
        };
        return resolve(decoded);
      }
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
    const bearerToken = req.headers?.authorization || null;
    if (bearerToken) {
      const token = bearerToken.split(' ')[1]
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
    errorHandler(res, error.code, error.message);
  };
};