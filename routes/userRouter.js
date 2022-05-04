const express = require('express');
const userController = require('../controllers/userController');
const { checkToken } = require('../utils/checkToken');
const { validator } = require('../utils/validator');

const userRouter = express.Router();

userRouter.get('/all', checkToken, userController.getAllUsers);
userRouter.get('/:id', checkToken, userController.getUser);
userRouter.delete('/:id', checkToken, userController.deleteUser);
userRouter.patch('/:id', checkToken, validator, userController.updateUser);

module.exports = userRouter;