const validation = require('validator');
const { badRequest } = require('../utils/errorCreator');
const { responseHandler } = require('../utils/responseHandler');

module.exports.validator = async (req, res, next) => {
  try {
    if (Object.keys(req.body).length === 0) {
      throw badRequest('bad request');
    };

    if (req.body.email) {
      if (!validation.isEmail(req.body.email)) {
        throw badRequest('Wrong email');
      };
    };

    return next();
  } catch (error) {
    responseHandler(res, error.code, 'Error: can not check email');
  };
};