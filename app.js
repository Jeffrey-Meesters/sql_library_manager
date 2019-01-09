const express = require('express');

const app = express();
const host ='localhost';
const port = 3000;

app.use('/static', express.static('public'));
app.set('view engine', 'pug');

app.get('/', (req, res) => {
    res.render('index')
});

app.listen(port, () => {
    console.log(`app is running on: http://${host}:${port}/`);
});