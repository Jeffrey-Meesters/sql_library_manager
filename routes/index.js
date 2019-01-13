const express = require('express');
const router = express.Router();
const Book = require("../models").Book;

router.get('/', (req, res) => {
    // FindAll accepts an array of arrays as options
    // This way you can order on multiple columns
    Book.findAll({order: [["createdAt", "DESC"]]}).then((books) => {
        console.log(books);
        res.render('index', { books: books })
    })
});

router.get('/new_book', (req, res) => {
    res.render('new_book', { book: Book.build() });
});

// Create new book
router.post('/new_book', (req, res) => {
    console.log(req.body)
    Book.create(req.body).then( (book)=> {
        console.log(book);
        res.redirect("/book_detail/" + book.id)
    }).catch(error => console.log(error));
});

// Get specific book
router.get('/book_detail/:id', (req, res) => {
    console.log('id', req.params.id);
    Book.findById(req.params.id).then((book) => {
        console.log(book);
        res.render('book_detail', { book: book });
    }).catch((error) => console.log('We got an error', error));
});

// Update
router.post('/book_detail/update/:id', (req, res) => {
    Book.findById(req.params.id).then((book) => {
        return book.update(req.body);
    }).then((book) => {
        res.redirect('/book_detail/' + book.id);
    }).catch((error) => console.log('We got an error', error));
});

// Delete
router.post('/books/:id/delete', (req, res) => {
    Book.findById(req.params.id).then((book) => {
        return book.destroy();
    }).then((book) => {
        res.redirect('/');
    }).catch((error) => console.log('We got an error', error));
});

module.exports = router;