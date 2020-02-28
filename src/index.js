require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const podcasts = require('./routes/podcasts.js');
const users = require('./routes/users');
const auth = require('./routes/auth.js');
const PORT = 5000;

mongoose.connect(process.env.CONNECTION_STRING);
let db = mongoose.connection;

db.on('error', err => console.log(err));
db.once('open', () => console.log('connected to db'));

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/podcasts', podcasts);
app.use('/auth', auth);
app.use('/users', users);

app.listen(process.env.PORT || PORT, () =>
  console.log(`podcast-api is running`)
);
