const express = require('express');
const { User } = require('./models');

const PORT = 3000;
const app = express();
app.use(express.json());

app.get('/users', async (req, res) => {
  const users = await User.findAll();
  res.json(users);
});

app.get('/users/:id', async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findByPk(userId);
    return res.json(user);
  } catch (error) {
    console.error('get user Id error:', error);
    return res.status(400).json({ message: error.message });
  };
});

app.post('/registration', async (req, res) => {
  if (!req.body) return res.sendStatus(400);

  const {
    firstName,
    lastName,
    email,
    password,
    dob
  } = req.body;

  const newUser = {
    firstName: firstName,
    lastName: lastName,
    email: email,
    password: password,
    dateOfBirth: dob,
  };

  try {
    const result = await User.create(newUser);
    return res.json(result);
  } catch (error) {
    console.error('registration error:', error);
    return res.status(400).json({ message: error.message });
  };
})

app.delete('/delete/:id', (req, res) => {
  const userId = req.params.id;
  try {
    User.destroy({ where: { id: userId } })
    return res.json(`User with id ${userId} deleted`);
  } catch (error) {
    console.error('delete error:', error);
    return res.status(500).json({ message: error.message });
  };
});

app.patch('/update/:id', async (req, res) => {
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
