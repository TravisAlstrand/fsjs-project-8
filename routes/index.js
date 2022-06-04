var express = require('express');
const res = require('express/lib/response');
var router = express.Router();
const bookModel = require('../models').Book;

/* Handler function to wrap each route */
function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
      // Forward error to the global error handler
      next(error);
    }
  }
}

/* GET home page - redirect to full books list */
router.get('/', (req, res, next) => {
  res.redirect('/books');
});

/* GET full books list */
router.get('/books', asyncHandler(async (req, res, next) => {
  const books = await bookModel.findAll();
  res.render('books', { books, title: 'Books' });
}));

module.exports = router;
