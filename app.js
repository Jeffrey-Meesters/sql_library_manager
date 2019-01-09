const express = require('express');
const sequelize = require('./models').sequelize;

const app = express();
const host ='localhost';
const port = 3000;

app.use('/static', express.static('public'));
app.set('view engine', 'pug');

app.get('/', (req, res) => {
    res.render('index')
});

sequelize.sync().then(function() {
    app.listen(port, () => {
        console.log(`app is running on: http://${host}:${port}/`);
    });
}).catch(function(error) {
    console.log(error);
});