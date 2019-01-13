const express = require('express');
const router = express.Router();
const Book = require("../models").Book;

// Redirect root route to /books
router.get('/', (req, res) => {
    res.redirect('/books')
});

// /books render books table
router.get('/books', (req, res) => {
    Book.findAll({ order: [['createdAt', 'DESC']] }).then((books) => {
        if (books) {
            res.render('index', {books: books, title: 'books' });
        } else {
            res.sendStatus(404);
        }
    }).catch((error) => res.sendStatus(500));
});

// /books/new render new book form
router.get('/books/new', (req, res) => {
    res.render('new-book', { book: Book.build(), title: 'New book' });
});

// Create new book
// When a post method comes in on the /books/new route
router.post('/books/new', (req, res) => {
    // Sequelize create book with the data in req.body
    Book.create(req.body).then( (book)=> {
        if (book) {
            // then redirect to spcific book route
            res.redirect("/books/" + book.id)
        } else {
            res.sendStatus(404);
        }
    }).catch((error) => {
        if (error.name === "SequelizeValidationError") {
            // render error
            res.render('new-book', { book: Book.build(), title: 'New book', error: error });
        } else {
            throw error;
        }
    }).catch((error) => res.sendStatus(500));
});

// /books/:id render book with requested id
router.get('/books/:id', (req, res) => {
    // Sequelize find book by id
    Book.findByPk(req.params.id).then((book) => {
        if (book) {    
            // then render update book from
            res.render('update-book', { book: book, title: 'Update book' });
        } else {
            res.sendStatus(404);
        }
    }).catch((error) => res.sendStatus(500));
});

// Update book
// When a post methiod comes in on the /books/:id route
router.post('/books/:id', (req, res) => {
    // Sequelize find book by id
    Book.findByPk(req.params.id).then((book) => {
        if (book) {
            //  Sequelize update the book
            return book.update(req.body);
        } else {
            res.sendStatus(404);
        }
    }).then((book) => {
        // Then redirect to /books/:id route
        res.redirect('/books/' + book.id);
    }).catch((error) => {
        if (error.name === "SequelizeValidationError") {
            Book.findByPk(req.params.id).then((book) => {
                // render error
                res.render('update-book', { book: book, title: 'Update book', error: error });
            });
        } else {
            throw error;
        }
    }).catch((error) => res.sendStatus(500));
});

// Delete book
router.post('/books/:id/delete', (req, res) => {
    //  Sequelize find book by id
    Book.findById(req.params.id).then((book) => {
        if (book) {
            // Sequelize Destroy book
            return book.destroy();
        } else {
            res.sendStatus(404);
        }
    }).then((book) => {
        // then redirect to /books route
        res.redirect('/books');
    }).catch((error) => res.sendStatus(500));
});

module.exports = router;