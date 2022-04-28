const express = require('express');
const { User } = require('./models');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const crypto = require('crypto');

const PORT = 3000;
const app = express();
app.use(express.json());

const privateKey = '';

const userRouter = express.Router();


const hashPassword = async (password) => {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');

    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(salt + ':' + derivedKey.toString('hex'))
    });
  });
};

const verifyPassword = async (password, hash) => {
  return new Promise((resolve, reject) => {
    const [salt, key] = hash.split(':');
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(key === derivedKey.toString('hex'))
    });
  });
};


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
  const user = await User.findByPk(id);
  if (!user) return res.status(404).json('user not found');
  if (user.role === 'admin') {
    return true
  } else {
    return false
  }
}

const checkToken = async (req, res, next) => {
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

app.get('/user/all', checkToken, async (req, res) => {

  const users = await User.findAll({ attributes: { exclude: ['password'] } });
  res.json(users);
});

app.get('/user/:id', checkToken, async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findByPk(userId, { attributes: { exclude: ['password'] } });
    return res.status(200).json(user);
  } catch (error) {
    console.error('get user Id error:', error);
    return res.status(400).json({ message: error.message });
  };
});

app.post('/signup', async (req, res) => {
  if (!req.body) { return res.sendStatus(400) };

  const {
    firstName,
    lastName,
    email,
    password,
    dateOfBirth
  } = req.body;

  const hashedPassword = await hashPassword(password);

  if (!validator.isEmail(email)) {
    return res.status(406).json({ message: 'Wrong email' })
  }

  const newUser = {
    role: 'user',
    firstName: firstName,
    lastName: lastName,
    email: email,
    password: hashedPassword,
    dateOfBirth: dateOfBirth,
  };

  try {
    const result = await User.create(newUser);
    const token = jwt.sign({ id: result.id }, privateKey);
    delete result.dataValues.password;

    return res.json({
      result,
      token
    });
  } catch (error) {
    console.error('registration error:', error);
    return res.status(400).json({ message: error.message });
  };
})

app.get('/signin', async (req, res) => {
  if (!req.body) { return res.sendStatus(400) };
  const { email, password } = req.body;
  
  try {
    const user = await User.findOne({where: { email: email }});

    if (!user) {
      return res.status(404).json('User with this email not found')
    };

    const varifyPasswords = await verifyPassword(password, user.password);

    delete user.dataValues.password;
    
    if (varifyPasswords) {
      
      const token = jwt.sign({ id: user.id }, privateKey);
      return res.status(200).json({
        message: 'You are signed in',
        user,
        token
      });
    } else {
      return res.status(401).json({ message: 'Wrong password' })
    }
  } catch (error) {
    console.error('authentication error:', error);
    return res.status(400).json({ message: error.message });
  }
})

app.delete('/user/:id/delete', checkToken, (req, res) => {
  const userId = req.params.id;
  try {
    User.destroy({ where: { id: userId } })
    return res.json(`User with id ${userId} deleted`);
  } catch (error) {
    console.error('delete error:', error);
    return res.status(500).json({ message: error.message });
  };
});

app.patch('/user/:id/update', checkToken, async (req, res) => {
  if (!req.body) { return res.sendStatus(400); }
  const userId = req.params.id;

  try {
    const isUserExist = await User.findByPk(userId);
    if (!isUserExist) { return res.status(404).json({ message: 'User is not found' }); }
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
})

app.listen(PORT, function () {
  console.log("Сервер ожидает подключения на порту " + PORT);
});
