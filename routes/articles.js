const express = require('express');
const router = express.Router();
const flash = require('connect-flash');
const { check, validationResult } = require('express-validator');
const Article = require('../models/article');

// GET Add Page
router.get('/add', (req, res) => {
  res.render('add_article', {
    title: 'Add Article',
  });
});

// POST Add Page Function request
router.post(
  '/add',
  [
    check('title').isLength({ min: 1 }).trim().withMessage('Title required'),
    check('author').isLength({ min: 1 }).trim().withMessage('Author required'),
    check('body').isLength({ min: 1 }).trim().withMessage('Body required'),
  ],
  (req, res) => {
    let { title, author, body } = req.body;
    let article = new Article({
      title,
      author,
      body,
    });

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log(errors);
      res.render('add_article', {
        errors: errors.mapped(),
      });
    } else {
      article.title = title;
      article.author = author;
      article.body = body;

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
    res.render('article', {
      article,
    });
  });
});

// GET Get Edit Page
router.get('/edit/:id', (req, res) => {
  let { id } = req.params;
  Article.findById(id, (err, article) => {
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
    check('author').isLength({ min: 1 }).trim().withMessage('Author required'),
    check('body').isLength({ min: 1 }).trim().withMessage('Body required'),
  ],
  (req, res) => {
    let { id } = req.params;
    let { title, author, body } = req.body;
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
      article.author = author;
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
  let query = { _id: req.params.id };
  Article.remove(query, (err) => {
    if (err) {
      console.log(err);
    }
    res.send('Success');
  });
});

module.exports = router;
