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
    const sortParams = req.query.sort;
    const filterValue = req.query.filter || '';
    
    const filterDate = req.query.date;
    const initialDate = dayjs('0001-01-01');
    // const initialDate = new Date('0000-01-01').getTime();
    const timeDifference = 1000 * 60 * 60 * 24;
    let usersToShow = null;
    let order = 'id';
    let orderDirection = 'ASC';
    console.log('initialDate', initialDate);
    // console.log('filterDate', filterDate);

    switch (sortParams) {
      case 'firstname':
        order = 'firstName';
        break;
      case 'firstnamerev':
        order = 'firstName';
        orderDirection = 'DESC';
        break;
      case 'lastname':
        order = 'lastName';
        break;
      case 'lastnamerev':
        order = 'lastName';
        orderDirection = 'DESC';
        break;
      case 'dob':
        order = 'dateOfBirth';
      case 'dobrev':
        order = 'dateOfBirth';
        orderDirection = 'DESC';
      default:
        break;
    };

    const users = await User.findAll({
      where: {
        [Op.or]: [
          {
            firstName: { [Op.iLike]: `%${filterValue}%` }
          },
          {
            lastName: { [Op.iLike]: `%${filterValue}%` }
          },
          {
            email: { [Op.iLike]: `%${filterValue}%` }
          },
        ],
        dateOfBirth: {
          [Op.gt]: initialDate
          // [Op.or]: {
          //   [Op.gt]: '01-01-01',
          //   [Op.between]: [filterDate, filterDate + timeDifference]
          // }
        }
      },
      attributes: {
        exclude: ['password'],
      },
      order: [[order, orderDirection]]
    });

    if (!users || users.length === 0) {
      throw notFound('users not found');
    };

    let usersArray = Array.from(users);

    if (page) {
      if ((page < 1) || (page > usersArray.length / limit + 1)) {
        throw badRequest('Wrong request params');
      };
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      usersToShow = usersArray.slice(startIndex, endIndex);
    } else {
      usersToShow = usersArray;
    };


    responseHandler(res, 'All users list:', usersToShow);
  } catch (error) {
    console.error('>>>>>>>>>>>>>>>>>', error)
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