const { User } = require('../models');
const hashPassword = require('../utils/hashPassword');
const { notFound, badRequest } = require('../utils/errorCreator');
const { responseHandler, errorHandler } = require('../utils/responseHandler');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ['password'] } });
    if (!users) {
      throw notFound('users not found');
    };
    responseHandler(res, 'All users list:', users);
  } catch (error) {
    console.error('get all users error:', error);
    errorHandler(res, error.code, error.message);
  };
};

exports.getUser = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      throw badRequest('bad request');
    };

    const user = await User.findByPk(userId, { attributes: { exclude: ['password'] } });
    if (!user) {
      throw notFound('user not found');
    };

    responseHandler(res, 'user data ', user);
  } catch (error) {
    console.error('get user Id error:', error);
    errorHandler(res, error.code, error.message);
  };
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      throw badRequest('bad request');
    };
    const isUserExist = await User.findByPk(userId);
    if (!isUserExist) {
      throw notFound('user not found');
    };
    await User.destroy({ where: { id: userId } });
    responseHandler(res, `User with id ${userId} deleted`);
  } catch (error) {
    console.error('delete error:', error);
    errorHandler(res, error.code, error.message);
  };
};

exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      throw badRequest('bad request');
    };
    const user = await User.findByPk(userId);
    if (!user) {
      throw notFound('user not found');
    };
    if (Object.keys(req.body).includes('password')) {
      const hashedPassword = await hashPassword.hashPassword(req.body.password);
      req.body.password = hashedPassword;
    };
    await User.update(req.body, { where: { id: userId } });
    const updatedUser = await User.findByPk(userId, { attributes: { exclude: ['password'] } });

    responseHandler(res, 'user updated', updatedUser);
  } catch (error) {
    console.error('update user error:', error);
    errorHandler(res, error.code, error.message);
  };
};