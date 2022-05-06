const crypto = require('crypto');
const { salt } = require('../config/config');

module.exports.verifyPassword = async (password, hash) => {
  const hashedPassword = crypto.pbkdf2Sync(password,
    salt, 100, 64, `sha512`).toString(`hex`);
  return hashedPassword === hash;
};