require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const uuid = require('uuid');

const { NODE_ENV } = require('./config');
const mockData = require('./mockData');

const app = express();
app.use(express.json());

const morganOption = NODE_ENV === 'production' ? 'tiny' : 'common';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

let DATA = [...mockData];

app.use('/address', (req, res, next) => {
  next();
});

app.get('/', (req, res) => {
  res.send('Express boilerplate initialized!');
});

app.get('/address', (req, res) => {
  res.json(DATA);
});

app.post('/address', (req, res) => {
  res.send('Express boilerplate initialized!');
});

app.delete('/address/:userId', (req, res) => {
  const id = req.params.userId;

  const validate = DATA.length;
  DATA = DATA.filter(ad => ad.id !== parseInt(id));

  if (DATA.length === validate) {
    return res.status(400).send('Adress not found!');
  }

  res.json(DATA);
});

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app;
