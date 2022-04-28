const { User } = require('../models');

exports.getAllUsers = async (req, res) => {
  const users = await User.findAll({ attributes: { exclude: ['password'] } });
  res.json(users);
};

exports.getUser = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findByPk(userId, { attributes: { exclude: ['password'] } });
    return res.status(200).json(user);
  } catch (error) {
    console.error('get user Id error:', error);
    return res.status(400).json({ message: error.message });
  };
};

exports.deleteUser = async (req, res) => {
  const userId = req.params.id;
  try {
    await User.destroy({ where: { id: userId } })
    return res.json(`User with id ${userId} deleted`);
  } catch (error) {
    console.error('delete error:', error);
    return res.status(500).json({ message: error.message });
  };
};

exports.updateUser = async (req, res) => {
  if (!req.body) { return res.sendStatus(400); }
  const userId = req.params.id;

  try {
    const isUserExist = await User.findByPk(userId);
    if (!isUserExist) {
      return res.status(404).json({ message: 'User is not found' });
    }

    if (Object.keys(req.body).includes('password')) {
      const hashedPassword = await hashPassword(req.body.password);
      req.body.password = hashedPassword;
    }

    const updatedUser = await User.update(req.body, { where: { id: userId } });
    return res.json(updatedUser);
  } catch (error) {
    console.error('get user Id error:', error);
    return res.status(500).json({ message: error.message })
  };
};