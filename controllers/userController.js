const { User } = require('../models');
const hashPassword = require('../utils/hashPassword');
const { notFound, badRequest } = require('../utils/errorCreator')

exports.getAllUsers = async (req, res) => {
  const users = await User.findAll({ attributes: { exclude: ['password'] } });
  res.json(users);
};

exports.getUser = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findByPk(userId, { attributes: { exclude: ['password'] } });

    if (!user) {
      throw notFound('user not found');
    };

    return res.status(200).json(user);
  } catch (error) {
    console.error('get user Id error:', error);
    res.status(error.code).json({ message: `Error: ${error.message}`});
  };
};

exports.deleteUser = async (req, res) => {
  const userId = req.params.id;
  try {
    const isUserExist = await User.findByPk(userId);
    if (!isUserExist) {
      throw notFound('user not found');
    };
    await User.destroy({ where: { id: userId } });
    
    return res.json(`User with id ${userId} deleted`);
  } catch (error) {
    console.error('delete error:', error);
    res.status(error.code).json({ message: `Error: ${error.message}`});
  };
};

exports.updateUser = async (req, res) => {
  if (!req.body) { throw badRequest('missing request body') };
  const userId = req.params.id;

  try {
    const isUserExist = await User.findByPk(userId);
    if (!isUserExist) {
      throw notFound('user not found');
    }

    if (Object.keys(req.body).includes('password')) {
      const hashedPassword = await hashPassword.hashPassword(req.body.password);
      req.body.password = hashedPassword;
    }

    const updatedUser = await User.update(req.body, { where: { id: userId } });
    return res.json(updatedUser);
  } catch (error) {
    console.error('update user error:', error);
    res.status(error.code).json({ message: `Error: ${error.message}`});
  };
};