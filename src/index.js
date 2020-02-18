require('dotenv').config();
const express = require('express');
const cors = require('cors');
const getPodcasts = require('./getPodcasts.js');
const { getPodcast, getEpisode } = require('./getPodcast.js');
const getTopPodcasts = require('./getTopPodcasts');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const User = require('./models/user.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const jwtKey = process.env.JWT_KEY;
const PORT = 5000;
mongoose.connect(process.env.CONNECTION_STRING);
let db = mongoose.connection;
db.on('error', err => console.log(err));
db.once('open', () => console.log('connected to db'));

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.listen(process.env.PORT || PORT, () =>
  console.log(`podcast-api is running`)
);

app.get('/podcasts', verifyToken, (req, res) => {
  jwt.verify(req.token, jwtKey, (err, authData) => {
    if (err) {
      console.log(err);
      res.sendStatus(403);
    } else {
      getPodcasts(req.query.name).then(podcasts => res.send(podcasts));
    }
  });
});

app.get('/podcast', verifyToken, (req, res) => {
  jwt.verify(req.token, jwtKey, (err, authData) => {
    if (err) {
      console.log(err);
      res.sendStatus(403);
    } else {
      getPodcast(req.query.rss).then(podcast => res.send(podcast));
    }
  });
});

app.get('/episode', verifyToken, (req, res) => {
  jwt.verify(req.token, jwtKey, (err, authData) => {
    if (err) {
      console.log(err);
      res.sendStatus(403);
    } else {
      getEpisode(req.query.rss, req.query.episodeId).then(episode =>
        res.send(episode)
      );
    }
  });
});

app.post('/register', (req, res) => {
  const saltRounds = 10;
  if (!req.body.username) {
    res.status(401).send('Username field is required');
  } else if (!req.body.username.match('^[a-zA-Z0-9_.-]*$')) {
    res.status(401).send('Username must contain only letters and numbers');
  } else if (req.body.username.length < 3) {
    res.status(401).send('Username must be at least 3 characters long');
  } else if (!req.body.password) {
    res.status(401).send('Password field is required');
  } else if (req.body.password.length < 3) {
    res.status(401).send('Password must be at least 3 characters long');
  } else if (!req.body.confirmPassword) {
    res.status(401).send('Confirm password field is required');
  } else if (req.body.password !== req.body.confirmPassword) {
    res.status(401).send('Password and confirm password does not match');
  } else {
    User.findOne({ username: req.body.username }, (err, obj) => {
      if (!obj) {
        bcrypt.genSalt(saltRounds, (err, salt) =>
          bcrypt.hash(req.body.password, salt, (err, hash) => {
            const user = new User({
              username: req.body.username,
              password: hash
            });
            user.save(err => {
              if (err) {
                res.status(500).send('Could not save user in database');
              } else {
                res.sendStatus(200);
              }
            });
          })
        );
      } else {
        res.status(401).send('Username already exists');
      }
    });
  }
});

function verifyToken(req, res, next) {
  const bearerHeader = req.headers['authorization'];

  console.log('verifyToken');
  console.log(bearerHeader);

  if (typeof bearerHeader !== undefined) {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];
    req.token = bearerToken;
    next();
  } else {
    res.sendStatus(401);
  }
}

app.post('/login', (req, res) => {
  if (!req.body.username) {
    res.status(401).send('Username field is required');
  } else if (!req.body.password) {
    res.status(401).send('Password field is required');
  } else {
    User.findOne({ username: req.body.username }, (err, obj) => {
      if (obj) {
        bcrypt.compare(req.body.password, obj.password, (err, r) => {
          if (r === true) {
            jwt.sign({ username: req.body.username }, jwtKey, (err, token) => {
              res.json({ token });
            });
          } else {
            res.status(401).send('Invalid password');
          }
        });
      } else {
        res.status(401).send('There is no user with such username');
      }
    });
  }
});

app.get('/popular', (req, res) => {
  getTopPodcasts().then(topPodcasts => res.send(topPodcasts));
});

app.get('/subscriptions', verifyToken, (req, res) => {
  jwt.verify(req.token, jwtKey, (err, authData) => {
    User.findOne({ username: req.query.username }, (err, obj) => {
      if (obj) {
        res.status(200).send(obj.subscriptions);
      } else {
        res.status(401).send('There is no user with such username');
      }
    });
  });
});

app.post('/addSubscription', (req, res) => {
  User.findOne({ username: req.body.username }, (err, obj) => {
    if (obj) {
      User.update(
        { username: req.body.username },
        {
          $set: { subscriptions: [...obj.subscriptions, req.body.podcastUrl] }
        }
      )
        .exec()
        .then(result => {
          res.status(200).send(result.subscriptions);
        });
    } else {
      res.status(401).send('There is no user with such username');
    }
  });
});

app.post('/deleteSubscription', (req, res) => {
  User.findOne({ username: req.body.username }, (err, obj) => {
    if (obj) {
      const index = obj.subscriptions.indexOf(req.body.podcastUrl);
      if (index !== -1) {
        User.update(
          { username: req.body.username },
          {
            $set: {
              subscriptions: [
                ...obj.subscriptions.slice(0, index),
                ...obj.subscriptions.slice(index + 1)
              ]
            }
          }
        )
          .exec()
          .then(result => res.status(200).send(result.subscriptions));
      }
    } else {
      res.status(401).send('There is no user with such username');
    }
  });
});
