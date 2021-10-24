const { response } = require('express');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// Route Handlers
app.get('/', (request, response) => {
  response.send(`
    <div>
        <form method="POST">
            <input name="email" placeholder="email" />
            <input name="password" placeholder="password" />
            <input name="passwordConfirmation" placeholder="password confirmation" />
            <button>Sign Up</button>
        </form>
    </div>
    `);
});

app.post('/', (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);
  res.send('Post request received on home');
});

// Start listening to incoming network requests
app.listen(3000, () => {
  console.log('Listening on Port 3000');
});

// // Middleware for parsing the request body
// function bodyParser(req, res, next) {
//   // We only want to run this Middleware on POST requests
//   if (req.method === 'POST') {
//     req.on('data', (data) => {
//       const parsed = data.toString('utf8').split('&');

//       const formData = {};

//       for (let pair of parsed) {
//         const [key, value] = pair.split('=');
//         formData[key] = value;
//       }

//       req.body = formData;
//       console.log(formData);
//       next();
//     });
//   }
//   // Signal that we are done, and Express can continue
//   else next();
// }
