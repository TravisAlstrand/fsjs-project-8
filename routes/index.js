var express = require('express');
const res = require('express/lib/response');
var router = express.Router();
const { Op } = require("sequelize");
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

  // variables parsed to INTs from url query page & size
  const pageAsNumber = Number.parseInt(req.query.page);
  const sizeAsNumber = Number.parseInt(req.query.size);

  // variables to determine limit & offset default values
  let page = 0;
  let size = 15;

  // check if page value from query is a number & not negative
  if (!Number.isNaN(pageAsNumber) && pageAsNumber > 0) {
    page = pageAsNumber;
  };

  // check if size value from query is a number & not negative & not larger than 15
  if (!Number.isNaN(sizeAsNumber) && sizeAsNumber > 0 && sizeAsNumber < 15) {
    size = sizeAsNumber;
  }

  const books = await bookModel.findAndCountAll({
    // how many objects to show per page
    limit: size,
    // how many objects to skip (ex. page 0(1st) * 10perpage = skip 0, page 1(2nd) * 10perpage = skip 10)
    offset: page * size
  });
  res.render('index', { books: books.rows, 
                        currentPage: page,
                        totalPages: Math.ceil(books.count / size), 
                        title: 'Books' });
}));

/* GET new book form page */
router.get('/books/new', asyncHandler(async (req, res) => {
  res.render('new-book');
}));

/* POST new book to db */
router.post('/books/new', asyncHandler(async (req, res) => {
  let book;
  try {
    // try to create new book
    book = await bookModel.create(req.body);
    res.redirect('/books');
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      // if there error is book validation, reload form showing errors
      book = await bookModel.build(req.body);
      res.render('new-book', { book, errors: error.errors });
    } else {
      // if not validation, throw the error to handler
      throw error;
    }
  }
}));

/* GET update book form page */
router.get('/books/update/:id', asyncHandler(async (req, res, next) => {
  const book = await bookModel.findByPk(req.params.id);
  if (book) {
    res.render('update-book', { book })
  } else {
    const error = new Error("Book not found in database");
    error.status = 404;
    next(error);
  }
}));

/* POST updated info for book */
router.post('/books/update/:id', asyncHandler(async (req, res, next) => {
  let book;
  try {
    book = await bookModel.findByPk(req.params.id);
    if (book) {
      await book.update(req.body);
      res.render('book-updated', { book });
    } else {
      const error = new Error("Book not found in database");
      error.status = 404;
      next(error);
    }
  }
  catch (error) {
    if (error.name === 'SequelizeValidationError') {
      book = await bookModel.build(req.body);
      book.id = req.params.id;
      res.render('update-book', { book, errors: error.errors });
    } else {
      throw error;
    }
  }
}));

/* GET delete book page */
router.get('/books/:id/delete', asyncHandler(async (req, res, next) => {
  const book = await bookModel.findByPk(req.params.id);
  if (book) {
    res.render('delete-confirm', { book });
  } else {
    const error = new Error("Book not found in database");
    error.status = 404;
    next(error);
  }
})); 

/* DELETE book from db */
router.post('/books/:id/delete', asyncHandler(async (req, res, next) => {
  const book = await bookModel.findByPk(req.params.id);
  if (book) {
    const bookTitle = book.title;
    await book.destroy();
    res.render('book-deleted', { bookTitle });
  } else {
    const error = new Error("Book not found in database");
    error.status = 404;
    next(error);
  }
}));

/* search attempt */
router.get('/books/index', asyncHandler(async (req, res) => {
  const userQuery = req.query.term;
  const newBooks = await bookModel.findAll({
    where: {
      [Op.or]: [
        { title: { [Op.like]: `%${userQuery}%` } },
        { author: { [Op.like]: `%${userQuery}%` } },
        { genre: { [Op.like]: `%${userQuery}%` } },
        { year: { [Op.like]: `%${userQuery}%` } } 
      ]
    }
  });
  res.render('index', { title: `Search for '${userQuery}'`, books: newBooks, search: true})
}));

module.exports = router;