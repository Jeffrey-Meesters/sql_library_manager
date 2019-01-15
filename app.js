const express = require('express');
const sequelize = require('./models').sequelize;
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({extended: false}));

const host ='localhost';
const port = 3000;

// Host all public files via express static
app.use('/static', express.static('public'));
// We're using pug so set the view engine to pug
app.set('view engine', 'pug');

// Because I've made all the routes in .route/index we don't need to specify the path further
const routes = require('./routes');
// Let app use the routes to start routing
app.use(routes);

// Call sync on sequelize before starting the server
// So the Database gets initialized
sequelize.sync().then(function() {
    app.listen(port, () => {
        console.log(`app is running on: http://${host}:${port}/`);
    })
}).catch(function(error) {
    console.log('sequelize.sync error in app.js', error);
});
