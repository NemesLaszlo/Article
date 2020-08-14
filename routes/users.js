const express = require('express');
const router = express.Router();
const flash = require('connect-flash');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

// GET Register Page
router.get('/register', (req, res) => {
  res.render('register');
});

// POST Register Process
router.post(
  '/register',
  [
    check('name').isLength({ min: 2 }).trim().withMessage('Name required'),
    check('email')
      .trim()
      .normalizeEmail()
      .isEmail()
      .withMessage('Valid Email required'),
    check('username')
      .isLength({ min: 3 })
      .trim()
      .withMessage('Username required'),
    check('password')
      .isLength({ min: 4 })
      .trim()
      .exists()
      .withMessage('Password required'),
    check(
      'password2',
      'PasswordConfirmation field must have the same value as the password field'
    )
      .isLength({ min: 4 })
      .trim()
      .exists()
      .custom((value, { req }) => value === req.body.password),
  ],
  (req, res) => {
    let { name, email, username, password } = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log(errors);
      res.render('register', {
        errors: errors.mapped(),
      });
    } else {
      let newUser = new User({
        name,
        email,
        username,
        password,
      });
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) {
            console.log(err);
          }
          newUser.password = hash;
          newUser.save((err) => {
            if (err) throw err;
            req.flash('success', 'You are new registered and can log in!');
            res.redirect('/users/login');
          });
        });
      });
    }
  }
);

// GET Login Page
router.get('/login', (req, res) => {
  res.render('login');
});

module.exports = router;
