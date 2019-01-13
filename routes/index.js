const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('index')
});

router.get('/new_book', (req, res) => {
    res.render('new_book')
});

router.post('/new_book', (req, res) => {
    console.log(req.params)
});

module.exports = router;