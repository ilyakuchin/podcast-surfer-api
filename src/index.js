require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const podcasts = require('./routes/podcasts.js');
const users = require('./routes/users');
const auth = require('./routes/auth.js');
const PORT = 5000;

mongoose.set('useCreateIndex', true);

mongoose.connect(process.env.CONNECTION_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
let db = mongoose.connection;

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/podcasts', podcasts);
app.use('/auth', auth);
app.use('/users', users);

app.listen(process.env.PORT || PORT);
