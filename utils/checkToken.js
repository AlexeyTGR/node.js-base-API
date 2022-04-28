require('dotenv').config();
const db = require('../models');
const jwt = require('jsonwebtoken');
const key =  process.env.PRIVATE_KEY;

const promisifiedVerify = async (token, key) => {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token.split(' ')[1],
      key,
      (err, decoded) => {
        if (err) {
          return reject(err)
        }
        return resolve(decoded)
      }
    );
  });
}

const isAdmin = async (id) => {
  const user = await db.User.findByPk(id);
  if (!user) return res.status(404).json('user not found');
  return user.role === 'admin';
}

module.exports.checkToken = async (req, res, next) => {
  const token = req.headers?.authorization || null;
  if (token) {
    const result = await promisifiedVerify(token, key);
    const admin = await isAdmin(result.id);
    if (admin) { return next() };

    if (req.params.id) {
      if (result.id !== +req.params.id) {
        return res.status(403).json({ message: 'you are not allowed to access this data' })
      }
      return next();
    }
    return res.status(403).json({ message: 'you are not allowed to access this data' })
  }
}