const express = require('express');
const { User } = require('./models');
const jwt = require('jsonwebtoken');

const PORT = 3000;
const app = express();
app.use(express.json());

const privateKey = 'q1W2e3R4t5Y6u7I8';

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

    if (admin) {
      console.log('admin ???????', admin);
      return next()
    };

    if (req.params.id) {
      if (result.id !== +req.params.id) {
        return res.status(403).json('you are not allowed to access this data')
      }
      return next();
    }
  }
}

app.get('/users', checkToken, async (req, res) => {

  const users = await User.findAll();
  res.json(users);
});

app.get('/users/:id', checkToken, async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findByPk(userId);
    return res.status(200).json(user);
  } catch (error) {
    console.error('get user Id error:', error);
    return res.status(400).json({ message: error.message });
  };
});

app.post('/registration', async (req, res) => {
  if (!req.body) { return res.sendStatus(400) };

  const {
    firstName,
    lastName,
    email,
    password,
    dateOfBirth
  } = req.body;

  const newUser = {
    role: 'user',
    firstName: firstName,
    lastName: lastName,
    email: email,
    password: password,
    dateOfBirth: dateOfBirth,
  };


  try {
    const result = await User.create(newUser);
    const token = jwt.sign({ id: result.id }, privateKey);
    return res.json({
      result,
      token
    });
  } catch (error) {
    console.error('registration error:', error);
    return res.status(400).json({ message: error.message });
  };
})

app.delete('/delete/:id', checkToken, (req, res) => {
  const userId = req.params.id;
  try {
    User.destroy({ where: { id: userId } })
    return res.json(`User with id ${userId} deleted`);
  } catch (error) {
    console.error('delete error:', error);
    return res.status(500).json({ message: error.message });
  };
});

app.patch('/update/:id', checkToken, async (req, res) => {
  if (!req.body) { return res.sendStatus(400); }
  const userId = req.params.id;

  try {
    const isUserExist = await User.findByPk(userId);
    if (!isUserExist) { return res.status(404).json({ message: 'User is not found' }); }
    console.log('req.body', req.body);
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
