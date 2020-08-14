const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Article = require('./models/article');
const session = require('express-session');
const config = require('./config/database');
const passport = require('passport');
const articles_router = require('./routes/articles');
const users_router = require('./routes/users');

// App Init
const app = express();
const port = process.env.PORT || 5000;
const db = mongoose.connection;

// Database connection
mongoose.connect(config.database, {
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

// Express Session Middleware
app.use(
  session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
  })
);

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Passport config
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Public folder
app.use(express.static(path.join(__dirname, 'public')));

// User Login Logout "Global variable"
app.get('*', (req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

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

// Router
app.use('/articles', articles_router);
app.use('/users', users_router);

app.listen(port, () =>
  console.log(`App listening at http://localhost:${port}`)
);
