const express = require('express');
const userRouter = require('./routes/userRouter');
const authRouter = require('./routes/authRouter');
const app = express();
const PORT = 3000;

app.use(express.json());

app.use('/user', userRouter);
app.use('/auth', authRouter);

app.use((req, res) => {
  res.status(404).send('Not Found');
});

app.listen(PORT, () => {
  console.log(`Server is waiting for a connection on a port ${PORT}`);
});
