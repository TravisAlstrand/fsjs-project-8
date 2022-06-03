var express = require('express');
var router = express.Router();
const book = require('../models').Book;

/* Handler function to wrap each route. */
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

/* GET home page. */
router.get('/', asyncHandler(async (req, res, next) => {
  const allBooks = await book.findAll();
  res.render('index', {books: allBooks, title: "Library Assistant"});
}));

module.exports = router;
