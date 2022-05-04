const express = require('express');
const authController = require('../controllers/authController');
const { validator } = require('../utils/validator');

const authRouter = express.Router();

authRouter.post('/signup', validator, authController.signUp);
authRouter.post('/signin', validator, authController.signIn);

module.exports = authRouter;