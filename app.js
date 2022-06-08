var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

/* routers */
var indexRouter = require('./routes/index');

/* import index sequelize instance */
const index = require('./models/index');
const { sequelize } = require('./models/index');

var app = express();

/* view engine setup */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

/* check connection with library database */
sequelize.authenticate()
  .then(() => {
    console.log('Connection to database successfull!');
  })
  .catch(err => {
    console.error('Unable to connect to database', err);
});

/* sync models */
sequelize.sync()
  .then(() => {
    console.log('Models synced successfully!');
  })
  .catch(err => {
    console.error('Unable to sync models', err);
});

/* catch 404 and forward to error handler */
app.use((req, res, next) => {
  const err = new Error('Ruh Roh! That page does not exist!');
  err.status = 404;
  res.render('page-not-found', { err });
});

/* error handler */
app.use(function(err, req, res, next) {
  // check if error is a 404 first
  if (err.status === 404) {
    err.message = err.message || 'Ruh Roh! That page does not exist!';
    res.render('page-not-found', { err });
  } else {
    err.message = err.message || 'Ruh Roh! There was a server error!';
    err.status = err.status || 500;
    console.log(err.status + err.message);
    res.render('error', { err });
  }
});

module.exports = app;
