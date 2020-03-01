const express = require('express');
const User = require('../models/user');
const users = express.Router();
const { check, validationResult } = require('express-validator');

const jwt = require('jsonwebtoken');
const jwtKey = process.env.JWT_KEY;

users.get('/', verifyToken, (req, res) => {
  jwt.verify(req.token, jwtKey, (err, authData) => {
    if (err) {
      res.status(401).json({ error: 'Unauthorized' });
    } else {
      User.findOne({ username: authData.username })
        .exec()
        .then(result => {
          res.status(200).json({
            user: {
              subscriptions: result.subscriptions,
              username: result.username
            }
          });
        })
        .catch(() => res.status(401).json({ error: 'Bad request' }));
    }
  });
});

users.patch(
  '/',
  [check('subscriptions').isArray(), check('subscriptions.*').isURL()],
  verifyToken,
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: 'Bad request' });
    } else {
      jwt.verify(req.token, jwtKey, (err, authData) => {
        if (err) {
          res.status(401).json({ error: 'Unauthorized' });
        } else {
          User.findOne({ username: authData.username })
            .exec()
            .then(obj =>
              User.update(
                { username: authData.username },
                {
                  $set: {
                    subscriptions: req.body.subscriptions
                  }
                }
              ).exec()
            )
            .then(result => res.status(200).json({ user: result }))
            .catch(() => res.status(400).json({ error: 'Bad request' }));
        }
      });
    }
  }
);

function verifyToken(req, res, next) {
  const bearerHeader = req.headers['authorization'];

  if (typeof bearerHeader !== undefined) {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];
    req.token = bearerToken;
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

module.exports = users;
