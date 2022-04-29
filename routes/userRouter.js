const express = require('express');
const userController = require('../controllers/userController');
const userRouter = express.Router();
const { checkToken } = require('../utils/checkToken');
const { validator } = require('../utils/validator');

userRouter.get('/all', checkToken, userController.getAllUsers);

userRouter.get('/:id', checkToken, userController.getUser);

userRouter.delete('/:id/delete', checkToken, userController.deleteUser);

userRouter.patch('/:id/update', checkToken, validator, userController.updateUser);

module.exports = userRouter;