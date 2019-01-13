const express = require('express');
const router = express.Router();
const Book = require("../models").Book;

// Redirect root route to /books
router.get('/', (req, res, next) => {
    res.redirect('/books')
});

// /books render books table
router.get('/books', (req, res, next) => {
    Book.findAll({ order: [['createdAt', 'DESC']] }).then((books) => {
        if (books) {
            res.render('index', {books: books, title: 'Books', headTitle: 'Books' });
        } else {
            res.render('book-not-found', { title: 'Book Not Found', headTitle: 'Book Not Found'});
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
            // then redirect to spcific book route
            res.redirect("/books/" + book.id)
        } else {
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

// /books/:id render book with requested id
router.get('/books/:id', (req, res, next) => {
    // Sequelize find book by id
    Book.findByPk(req.params.id).then((book) => {
        if (book) {    
            // then render update book from
            res.render('update-book', { book: book, title: 'Update book', headTitle: book.title });
        } else {
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
            return book.update(req.body);
        } else {
            res.render('book-not-found', { title: 'Book Not Found', headTitle: 'Book Not Found'});
        }
    }).then((book) => {
        // Then redirect to /books/:id route
        res.redirect('/books/' + book.id);
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
            res.render('book-not-found', { title: 'Book Not Found', headTitle: 'Book Not Found'});
        }
    }).then((book) => {
        // then redirect to /books route
        res.redirect('/books');
    }).catch((error) => { return next(500); });
});

// this middleware catches if non of the routes above are a\matched
router.use((req, res, next) => {
    // Create a new error
    const error = new Error("Book Not Found");
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