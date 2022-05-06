const { User } = require('../models');
const { responseHandler } = require('../utils/responseHandler');
const { notFound } = require('../utils/errorCreator');

module.exports.checkIsAdmin = async (id) => {
  try {
    const user = await User.findByPk(id);
    if (!user) {
      throw notFound('user not found');
    };
    return user.role === 'admin';
  } catch (error) {
    responseHandler(res, error.code, 'Error: can not check user role');
  };
};