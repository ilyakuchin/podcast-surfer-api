require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const podcasts = require('./routes/podcasts');
const users = require('./routes/users');
const auth = require('./routes/auth');
const morgan = require('morgan');
const PORT = 5000;

mongoose.set('useCreateIndex', true);

mongoose.connect(process.env.CONNECTION_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
let db = mongoose.connection;

const app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PATCH, POST, GET');
    return res.status(200).json({});
  }
  next();
});

app.use('/podcasts', podcasts);
app.use('/auth', auth);
app.use('/users', users);

app.listen(process.env.PORT || PORT);

app.use(function(req, res, next) {
  res.status(404).json({ message: 'Not found' });
});
