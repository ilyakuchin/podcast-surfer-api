const express = require('express');
const User = require('../models/user.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwtKey = process.env.JWT_KEY;
const { check, validationResult } = require('express-validator');

const auth = express.Router();

auth.post(
  '/register',
  [
    check('username').notEmpty(),
    check('username').isLength({ min: 3 }),
    check('username').matches('^[a-zA-Z0-9_.-]*$'),
    check('password').notEmpty(),
    check('password').isLength({ min: 3 }),
    check('confirmPassword').notEmpty(),
    check('confirmPassword').custom(
      (value, { req }) => value === req.body.password
    )
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(401).json({ error: 'Registration error' });
    } else {
      User.findOne({ username: req.body.username })
        .exec()
        .then(() => bcrypt.genSalt(10))
        .then(salt => bcrypt.hash(req.body.password, salt))
        .then(hash => {
          new User({
            username: req.body.username,
            password: hash
          }).save();
        })
        .then(() => res.status(200).json({ message: 'Registered' }))
        .catch(() => res.status(400).json({ error: 'Registration error' }));
    }
  }
);

auth.post(
  '/login',
  [check('username').notEmpty(), check('password').notEmpty()],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(401).json({ errors: 'Authentication error' });
    } else {
      User.findOne({ username: req.body.username })
        .exec()
        .then(obj => bcrypt.compare(req.body.password, obj.password))
        .then(result => {
          if (result === true) {
            jwt.sign(
              { username: req.body.username },
              jwtKey,
              { expiresIn: '24h' },
              (err, token) => {
                if (err) {
                  res.status(401).json({ error: 'Authentication error' });
                } else {
                  res.status(200).json({ message: 'Successful login', token });
                }
              }
            );
          } else {
            res.status(401).json({ errors: 'Invalid password' });
          }
        })
        .catch(() => res.status(401).json({ error: 'Authentication error' }));
    }
  }
);

module.exports = auth;
