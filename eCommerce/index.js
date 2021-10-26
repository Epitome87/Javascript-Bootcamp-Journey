const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const authRouter = require('./routes/admin/auth');
const productsRouter = require('./routes/admin/products');

const app = express();

// Use a built-in Express Middelware to serve files
app.use(express.static('public'));
// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  cookieSession({
    keys: ['euab74n39bnopqldkew83blaejyvctq7adjlke3'],
  })
);
// Hook up the Routers we have created
app.use(authRouter);
app.use(productsRouter);

// Start listening to incoming network requests
app.listen(3000, () => {
  console.log('Listening on Port 3000');
});
