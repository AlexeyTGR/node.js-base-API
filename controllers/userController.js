const { User } = require('../models');
const dayjs = require('dayjs');
const hashPassword = require('../utils/hashPassword');
const { notFound, badRequest } = require('../utils/errorCreator');
const { responseHandler, errorHandler } = require('../utils/responseHandler');
const { Op } = require('sequelize');

exports.getAllUsers = async (req, res) => {
  try {
    const page = req.query.page;
    const limit = req.query.limit;
    const filterValue = req.query.filter;
    const filterDate = req.query.date;
    let order = req.query.order || 'id';
    let orderDirection = req.query.orderDir || 'ASC';
    const offset = limit * (page - 1) || 0;
    const attributes = {
      where: {},
      order: [[order, orderDirection]],
      offset: offset,
      limit: limit,
    };

    if (filterValue) {
      const stringForSearch = `%${filterValue}%`;
      const searchRequest = {
        [Op.iLike]: stringForSearch
      };
      const columnToSearch = [
        {
          firstName: searchRequest
        },
        {
          lastName: searchRequest
        },
        {
          email: searchRequest
        },
      ];

      attributes.where = {
        [Op.or]: columnToSearch
      };
    };

    if (filterDate) {
      const startOfDay = dayjs(filterDate).startOf('day');
      const endOfDay = startOfDay.clone().endOf('day');
      const searchingValues = {
        [Op.between]: [startOfDay.toDate(), endOfDay.toDate()]
      };

      attributes.where['dateOfBirth'] = searchingValues;
    };

    const users = await User.findAll(attributes);

    if (!users || users.length === 0) {
      throw notFound('users not found');
    };

    responseHandler(res, 'All users list:', users);
  } catch (error) {
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
    errorHandler(res, error.code, error.message);
  };
};