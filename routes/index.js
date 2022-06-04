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
router.get('/', (req, res) => {
  res.redirect('/books');
});

/* GET full books list */
router.get('/books', asyncHandler(async (req, res) => {
  const books = await bookModel.findAll();
  res.render('books', { books, title: 'Books' });
}));

/* GET new book form page */
router.get('/books/new', asyncHandler(async (req, res) => {
  res.render('new');
}));

/* POST new book to db */
router.post('/books/new', asyncHandler(async (req, res) => {
  let book;
  try {
    // try to create new book
    book = await bookModel.create(req.body);
    res.redirect('/books/' + book.id);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      // if there error is book validation, reload form showing errors
      book = await bookModel.build(req.body);
      res.render('new', { book, errors: error.errors });
    } else {
      // if not validation, throw the error to handler
      throw error;
    }
  }
}));

/* GET book detail page */
router.get('/books/info/:id', asyncHandler(async (req, res) => {
  res.render('book-info', { bookId: req.params.id });
}));

/* GET update book form page */
router.get('/books/update/:id', asyncHandler(async (req, res) => {
  const book = await bookModel.findByPk(req.params.id);
  if (book) {
    res.render('update', { book })
  } else {
    res.sendStatus(404);
  }
}));

/* POST updated info for book */
router.post('/books/update/:id', asyncHandler(async (req, res) => {
  let book;
  try {
    book = await bookModel.findByPk(req.params.id);
    if (book) {
      await book.update(req.body);
      res.redirect('/books/info/' + book.id);
    } else {
      res.sendStatus(404);
    }
  }
  catch (error) {
    if (error.name === 'SequelizeValidationError') {
      book = await bookModel.build(req.body);
      book.id = req.params.id;
      res.render('update', { book, errors: error.errors });
    } else {
      throw error;
    }
  }
}));

/* GET delete book page */
router.get('/books/:id/delete', asyncHandler(async (req, res) => {
  const book = await bookModel.findByPk(req.params.id);
  if (book) {
    res.render('delete-confirm', { book });
  } else {
    res.sendStatus(404);
  }
})); 

/* DELETE book from db */
router.post('/books/:id/delete', asyncHandler(async (req, res) => {
  const book = await bookModel.findByPk(req.params.id);
  if (book) {
    await book.destroy();
    res.render('/books/deleted', { book });
  } else {
    res.sendStatus(404);
  }
}));

module.exports = router;