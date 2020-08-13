const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Article = require('./models/article');

// App Init
const app = express();
const port = process.env.PORT || 5000;
const db = mongoose.connection;

// Database connection
mongoose.connect('mongodb://localhost:27017/article_project', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Database check
db.once('open', () => {
  console.log('Connected to MongoDB!');
});

db.on('error', (err) => {
  console.log(err);
});

// Pug Template Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// GET Home Page
app.get('/', (req, res) => {
  Article.find({}, (err, articles) => {
    if (err) {
      console.log(err);
    } else {
      res.render('index', {
        title: 'Articles',
        articles: articles,
      });
    }
  });
});

// GET Add Page
app.get('/articles/add', (req, res) => {
  res.render('add_article', {
    title: 'Add Article',
  });
});

// POST Add Page Function request
app.post('/articles/add', (req, res) => {
  let { title, author, body } = req.body;
  let article = new Article();
  article.title = title;
  article.author = author;
  article.body = body;

  article.save((err) => {
    if (err) {
      console.log(err);
      return;
    } else {
      res.redirect('/');
    }
  });
});

app.listen(port, () =>
  console.log(`App listening at http://localhost:${port}`)
);
