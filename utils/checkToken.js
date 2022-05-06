require('dotenv').config();
const jwt = require('jsonwebtoken');
const { responseHandler } = require('../utils/responseHandler');
const { forbidden } = require('../utils/errorCreator');
const { checkIsAdmin } = require('./checkIsAdmin')
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

module.exports.checkToken = async (req, res, next) => {
  try {
    const bearerToken = req.headers?.authorization || null;
    if (bearerToken) {
      const token = bearerToken.split(' ')[1]
      const result = await promisifiedVerify(token, privateKey);
      const admin = await checkIsAdmin(result.id);
      if (admin) {
        return next();
      };
      if (req.params.id) {
        if (result.id !== +req.params.id) {
          throw forbidden('you are not allowed to access this data');
        };
        return next();
      };
      throw forbidden('you are not allowed to access this data');
    };
  } catch (error) {
    responseHandler(res, error.code, 'Error: can not check token');
  };
};