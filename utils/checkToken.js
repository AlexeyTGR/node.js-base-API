const privateKey = '';
const db = require('../models')
const { User } = require('../models/user');
const jwt = require('jsonwebtoken');


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
  if (user.role === 'admin') {
    return true
  } else {
    return false
  }
}

module.exports.checkToken = async (req, res, next) => {
  const token = req.headers?.authorization || null;
  if (token) {
    const result = await promisifiedVerify(token, privateKey);
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