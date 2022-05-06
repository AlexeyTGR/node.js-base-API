const dayjs = require('dayjs');
const { Op } = require('sequelize');
const { User } = require('../models');
const hashPassword = require('../utils/hashPassword');
const { notFound, badRequest } = require('../utils/errorCreator');
const { responseHandler, errorHandler } = require('../utils/responseHandler');

exports.getAllUsers = async (req, res) => {
  try {
    const page = +req.query.page || 1;
    const limit = +req.query.limit || 100;
    const filterValue = req.query.filter;
    const filterDate = req.query.date;
    let order = req.query.order || 'id';
    let orderDirection = req.query.orderDir || 'ASC';
    const offset = limit * (page - 1) || 0;

    const findAllAttributes = {
      where: {},
      order: [[order, orderDirection]],
      offset,
      limit,
    };

    if (filterValue) {
      const searchRequestData = {
        [Op.iLike]: `%${filterValue}%`
      };
      findAllAttributes.where = {
        [Op.or]: [
          {
            firstName: searchRequestData
          },
          {
            lastName: searchRequestData
          },
          {
            email: searchRequestData
          },
        ]
      };
    };

    if (filterDate) {
      const startOfDay = dayjs(filterDate).startOf('day');
      const endOfDay = startOfDay.clone().endOf('day');

      findAllAttributes.where.dateOfBirth = {
        [Op.between]: [startOfDay.toDate(), endOfDay.toDate()]
      };
    };
    const users = await User.findAll(findAllAttributes);

    responseHandler(res, 'All users list:', users);
  } catch (error) {
    errorHandler(res, error.code, error.message);
  };
};

exports.getUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByPk(userId);
    if (!user) {
      throw notFound('user not found');
    };

    responseHandler(res, 'user data ', user);
  } catch (error) {
    errorHandler(res, error.code, error.message);
  };
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByPk(userId);
    if (!user) {
      throw notFound('user not found');
    };
    await user.destroy();

    responseHandler(res, `User with id ${userId} deleted`);
  } catch (error) {
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
    await User.update(req.body, { where: { id: userId }, returns: true });
    const updatedUser = await User.findByPk(userId);

    responseHandler(res, 'user updated', updatedUser);
  } catch (error) {
    errorHandler(res, error.code, error.message);
  };
};