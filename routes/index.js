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

    // set offset to 0
    let offset = 0;
    // set limit to 10
    const limit = 10;
    // get current page from the page param
    // make sure it is a number
    const currentPage = Number(req.params.page);

    // if the page params is equal or greater then 1
    if (req.params.page >= 1) {
        // change the offset to the current page times the limit minus the limit
        // I did not want to have a page 0 thats weird
        // so page one will have an offset of 0
        // page 2 will have an offset of (( 2 * 10 ) - 10) = 10
        // etc. 
        offset = ((currentPage * limit) - limit);
    }

    // In the sequelize docs I found we can return count when using findAndCountAll
    // gif the search a limit, offset and an descending order based on creation date
    Book.findAndCountAll({ limit: [[limit]], offset: [[offset]], order: [['createdAt', 'DESC']] }).then((books) => {
        // Decide how many pages there should be based on the count devided by the limit
        // So if book count is 44 then the pages should be 4.4 ... but that is not possible
        // Ceil rounds it up to the nearest whole integer and we get 5
        const numberOfPages = Math.ceil(books.count / limit);

        // If there are books
        // And if currentPage is not 0
        // And if current page is smaller or equal to numberOfpages
        // render the booklist
        if (books.rows.length > 0 && currentPage !== 0 && currentPage <= numberOfPages ) {
            res.render('index', {books: books.rows, title: 'Books', headTitle: 'Books', totalPages: numberOfPages });
        } else {
            // If the user decides to alter the url and change the pagenumber to a non existend page
            // render the booklist, but with the noBooks message
            console.log(`/books: books not found` )
            res.render('index', {title: 'Books', headTitle: 'Books', totalPages: numberOfPages, noBooks: true });
        }

        // an catch block which returns a 500 number via next will stop the script and throw a 500 error
    }).catch((error) => { return next(500); });
});

// /books/new render new book form
router.get('/books/new', (req, res, next) => {
    // Get the model ready with .build()
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
        // This catch block will be triggered by a Models validation error
        // the name key in the error object will have the value SequelizeValidationError
        if (error.name === "SequelizeValidationError") {
            // render error
            res.render('new-book', { 
                book: Book.build(req.body), 
                title: 'New book', 
                headTitle: 'New book', 
                errors: error.errors
            });
        } else {
            // Else something else went wrong so throw error here
            console.log('error in /book/new when creating a new book')
            throw error;
        }
    }).catch((error) => { return next(500); });
});

router.post('/books/search', (req, res, next) => {
    // the form has an input with name=search
    // so interpolate that inputs value to have percentsymbols on both sides
    // this is needed so the search will look before and after the string
    const searchTerm = `%${req.body.search}%`;

    Book.findAll({
        // This took me quite a while to figure out
        // the docs say: PG only.. but didn't realize what PG was: postgress
        // like is case insensitive in sqlite by default:
        // https://github.com/sequelize/sequelize/issues/4384
        // Op is defined at the start of this script
        // Op.or is to tell that the search is for every column listed below
        // Op.like is equal to LIKE in SQL, but in this case is caseinsensitive
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
            // If there are books render the search part of the bookList view
            res.render('index', {books: books, title: 'Books', headTitle: 'Books', search: true });
        } else {
            // Else render book not found view
            res.render('book-not-found', { title: 'Book Not Found', headTitle: 'Book Not Found', search: true});
        }
    }).catch((error) => { return next(500) })
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
    // The server console was warning for an deprecation of findById and that I should replace it by findByPk so i did.
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
        // This catch block will be triggered by a Models validation error
        // the name key in the error object will have the value SequelizeValidationError        
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
    Book.findByPk(req.params.id).then((book) => {
        if (book) {
            // Sequelize Destroy book
            return book.destroy();
        } else {
            // else the id is wrong so the book was not found
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

// export router so we can incluse it in app.js
module.exports = router;