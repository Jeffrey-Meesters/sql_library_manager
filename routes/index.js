const express = require('express');
const router = express.Router();
const Book = require("../models").Book;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

// Redirect root route to /books
router.get('/', (req, res, next) => {
    res.redirect('/books/page/1')
});

// /books render books table
router.get('/books/page/:page', (req, res, next) => {
    let offset = 0;
    const limit = 10;
    const currentPage = Number(req.params.page);

    if (req.params.page >= 1) {
        offset = ((currentPage * limit) - 10);
    }

    Book.findAndCountAll({ limit: [[limit]], offset: [[offset]], order: [['createdAt', 'DESC']] }).then((books) => {
        const numberOfPages = Math.ceil(books.count / limit);
        
        if (books.rows.length > 0 && currentPage !== 0 && currentPage <= numberOfPages ) {
            res.render('index', {books: books.rows, title: 'Books', headTitle: 'Books', totalPages: numberOfPages });
        } else {
            console.log(`/books: books not found` )
            res.render('index', {title: 'Books', headTitle: 'Books', totalPages: numberOfPages, noBooks: true });
        }
    }).catch((error) => { return next(500); });
});

// /books/new render new book form
router.get('/books/new', (req, res, next) => {
    res.render('new-book', { book: Book.build(), title: 'New book', headTitle: 'New Book' });
});

// Create new book
// When a post method comes in on the /books/new route
router.post('/books/new', (req, res, next) => {
    // Sequelize create book with the data in req.body
    Book.create(req.body).then( (book)=> {
        if (book) {
            // then redirect to books listing route
            res.redirect("/books/page/1")
        } else {
            console.log(`book not found id: ${req.params.id}` )
            res.render('book-not-found', { title: 'Book Not Found', headTitle: 'Book Not Found'});
        }
    }).catch((error) => {
        if (error.name === "SequelizeValidationError") {
            // render error
            res.render('new-book', { 
                book: Book.build(req.body), 
                title: 'New book', 
                headTitle: 'New book', 
                errors: error.errors
            });
        } else {
            throw error;
        }
    }).catch((error) => { return next(500); });
});

router.post('/books/search', (req, res, next) => {
    const searchTerm = `%${req.body.search}%`;

    Book.findAll({
        // like is case insensitive in sqlite by default:
        // https://github.com/sequelize/sequelize/issues/4384
        where: {
            [Op.or]: [
              {
                title: {
                  [Op.like]: searchTerm
                }
              },
              {
                author: {
                  [Op.like]: searchTerm
                }
              },
              {
                genre: {
                  [Op.like]: searchTerm
                }
              },
              {
                year: {
                  [Op.like]: searchTerm
                }
              }
            ]
          }
    }).then((books) => {
        if (books.length) {
            res.render('index', {books: books, title: 'Books', headTitle: 'Books', search: true });
        } else {
            res.render('book-not-found', { title: 'Book Not Found', headTitle: 'Book Not Found', search: true});
        }
    })
})

// /books/:id render book with requested id
router.get('/books/:id', (req, res, next) => {
    // Sequelize find book by id
    Book.findByPk(req.params.id).then((book) => {
        if (book) {    
            // then render update book from
            res.render('update-book', { book: book, title: 'Update book', headTitle: book.title });
        } else {
            console.log(`book not found id: ${req.params.id}` )
            res.render('book-not-found', { title: 'Book Not Found', headTitle: 'Book Not Found'});
        }
    }).catch((error) => { return next(500); });
});

// Update book
// When a post methiod comes in on the /books/:id route
router.post('/books/:id', (req, res, next) => {
    // Sequelize find book by id
    Book.findByPk(req.params.id).then((book) => {
        if (book) {
            //  Sequelize update the book
            console.log(1, req.body)
            return book.update(req.body);
        } else {
            console.log(`book not found id: ${req.params.id}` )
            res.render('book-not-found', { title: 'Book Not Found', headTitle: 'Book Not Found'});
        }
    }).then((book) => {
        // Then redirect to books listing route
        res.redirect('/books/page/1');
    }).catch((error) => {
        if (error.name === "SequelizeValidationError") {
            Book.findByPk(req.params.id).then((book) => {
                // render error
                res.render('update-book', { 
                    book: book, 
                    title: 'Update book', 
                    headTitle: 'Update book', 
                    errors: error.errors 
                });
            });
        } else {
            throw error;
        }
    }).catch((error) => { return next(500); });
});

// Delete book
router.post('/books/:id/delete', (req, res, next) => {
    //  Sequelize find book by id
    Book.findById(req.params.id).then((book) => {
        if (book) {
            // Sequelize Destroy book
            return book.destroy();
        } else {
            console.log(`book not found id: ${req.params.id}` )
            res.render('book-not-found', { title: 'Book Not Found', headTitle: 'Book Not Found'});
        }
    }).then((book) => {
        // then redirect to /books route
        res.redirect('/books/page/1');
    }).catch((error) => { return next(500); });
});

// this middleware catches if non of the routes above are a\matched
router.use((req, res, next) => {
    // Create a new error
    const error = new Error("Page Not Found");
    // give the error the 404 status
    error.status = 404;
    // call next with the error so the error handler will be triggered
    // middleware will stop when calling next or sending a response
    next(error);
 });

// Error handler middleware
router.use((error, req, res, next) => {
    if (error.status === 404) {
        res.render('page-not-found', { title: 'Book Not Found', headTitle: 'Page Not Found'});
    }
})

module.exports = router;