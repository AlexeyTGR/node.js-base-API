const express = require('express');
const userController = require('../controllers/userController');
const { checkToken } = require('../utils/checkToken');
const { validator } = require('../utils/validator');

const userRouter = express.Router();

userRouter.use(checkToken);
userRouter.get('/all', userController.getAllUsers);
userRouter.get('/:id', userController.getUser);
userRouter.delete('/:id', userController.deleteUser);
userRouter.patch('/:id', validator, userController.updateUser);

module.exports = userRouter;