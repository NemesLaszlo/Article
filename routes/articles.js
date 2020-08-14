const express = require('express');
const router = express.Router();
const flash = require('connect-flash');
const { check, validationResult } = require('express-validator');
const Article = require('../models/article');
const User = require('../models/user');

// Access Control
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash('danger', 'Please login!');
    res.redirect('/users/login');
  }
};

// GET Add Page
router.get('/add', ensureAuthenticated, (req, res) => {
  res.render('add_article', {
    title: 'Add Article',
  });
});

// POST Add Page Function request
router.post(
  '/add',
  [
    check('title').isLength({ min: 1 }).trim().withMessage('Title required'),
    check('body').isLength({ min: 1 }).trim().withMessage('Body required'),
  ],
  (req, res) => {
    let { title, body } = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log(errors);
      res.render('add_article', {
        errors: errors.mapped(),
      });
    } else {
      let article = new Article({
        title,
        body,
      });
      article.author = req.user._id;

      article.save((err) => {
        if (err) throw err;
        req.flash('success', 'Article Added');
        res.redirect('/');
      });
    }
  }
);

// GET Get id specific article
router.get('/:id', (req, res) => {
  let { id } = req.params;
  Article.findById(id, (err, article) => {
    User.findById(article.author, (err, user) => {
      res.render('article', {
        article,
        author: user.name,
      });
    });
  });
});

// GET Get Edit Page
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
  let { id } = req.params;
  Article.findById(id, (err, article) => {
    if (article.author != req.user._id) {
      req.flash('danger', 'Not Authorized!');
      res.redirect('/');
    }
    res.render('edit_article', {
      title: 'Edit Article',
      article,
    });
  });
});

// POST Edit Page Function request
router.post(
  '/edit/:id',
  [
    check('title').isLength({ min: 1 }).trim().withMessage('Title required'),
    check('body').isLength({ min: 1 }).trim().withMessage('Body required'),
  ],
  (req, res) => {
    let { id } = req.params;
    let { title, body } = req.body;
    let article = {};

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log(errors);
      Article.findById(id, (err, article) => {
        res.render('edit_article', {
          title: 'Edit Article',
          article,
          errors: errors.mapped(),
        });
      });
    } else {
      article.title = title;
      article.author = req.user._id;
      article.body = body;

      let query = { _id: req.params.id };

      Article.update(query, article, (err) => {
        if (err) throw err;
        req.flash('success', 'Article Updated');
        res.redirect('/');
      });
    }
  }
);

// DELETE Delete single article by id
router.delete('/:id', (req, res) => {
  if (!req.user._id) {
    res.status(500).send();
  }

  let query = { _id: req.params.id };

  Article.findById(req.params.id, (err, article) => {
    if (article.author != req.user._id) {
      res.status(500).send();
    } else {
      Article.remove(query, (err) => {
        if (err) {
          console.log(err);
        }
        res.send('Success');
      });
    }
  });
});

module.exports = router;
