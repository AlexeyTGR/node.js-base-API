const validation = require('validator');
const { badRequest } = require('../utils/errorCreator');
const { errorHandler } = require('../utils/responseHandler');

module.exports.validator = async (req, res, next) => {
  console.log('path >>>>>>', req.route.path);
  try {
    if (Object.keys(req.body).length === 0) {
      throw badRequest('bad request');
    };

    if (req.body.email) {
      const email = req.body.email;
      if (!validation.isEmail(email)) {
        throw badRequest('Wrong email');
      };
    };

    return next();
  } catch (error) {
    console.error('valitadion error:', error);
    errorHandler(res, error.code, error.message);
  };
};