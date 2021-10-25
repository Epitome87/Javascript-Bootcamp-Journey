const { response } = require('express');
const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const usersRepo = require('./repositories/users');

const app = express();

// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

app.use(
  cookieSession({
    keys: ['euab74n39bnopqldkew83blaejyvctq7adjlke3'],
  })
);

// Route Handlers
app.get('/', (req, res) => {
  res.send('Welcome to Home!');
});

app.get('/signup', (request, response) => {
  response.send(`
    <div>
    ${request.session.userId}
        <form method="POST">
            <input name="email" placeholder="email" />
            <input name="password" placeholder="password" />
            <input name="passwordConfirmation" placeholder="password confirmation" />
            <button>Sign Up</button>
        </form>
    </div>
    `);
});

app.post('/signup', async (req, res) => {
  const { email, password, passwordConfirmation } = req.body;
  console.log(req.body);

  const existingUser = await usersRepo.getOneBy({ email });
  if (existingUser) return res.send('Email already in use');

  if (password !== passwordConfirmation)
    return res.send('Passwords do not match');

  // Create a user in our User Repo to represent this person
  const user = await usersRepo.create({ email, password });

  // Store the id of that user inside the user's cookie
  req.session.userId = user.id;

  res.send('Post request received on home');
});

app.get('/signout', (req, res) => {
  // Forget the current session object. Cookie-Session will handle the rest!
  req.session = null;

  res.redirect('/');
});

app.get('/signin', (req, res) => {
  res.send(`
  <div>
    <form method="POST">
        <input name="email" placeholder="email" />
        <input name="password" placeholder="password" />
        <button>Sign In</button>
    </form>
    </div>`);
});

app.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  const user = await usersRepo.getOneBy({ email });

  // Does a user with this email even exist?
  if (!user) {
    return res.send('Email not found');
  }

  // Does the password provided match that of the user's?
  // if (user.password !== password) {
  const isValidPassword = await usersRepo.comparePasswords(
    user.password,
    password
  );
  if (!isValidPassword) return res.send('Invalid password');

  // At this point, user is valid: Sign in!
  req.session.userId = user.id;

  res.send('You are signed in!');
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
