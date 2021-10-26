const express = require('express');
const { check, validationResult } = require('express-validator');

const usersRepo = require('../../repositories/users');
const signupTemplate = require('../../views/admin/auth/signup');
const signinTemplate = require('../../views/admin/auth/signin');
const {
  requireEmail,
  requirePassword,
  requirePasswordConfirmation,
  requireEmailExists,
  requireValidPasswordForUser,
} = require('./validators');

const router = express.Router();

// Route Handlers
router.get('/', (req, res) => {
  res.send('Welcome to Home!');
});

router.get('/signup', (request, response) => {
  response.send(signupTemplate({ request }));
});

router.post(
  '/signup',
  [requireEmail, requirePassword, requirePasswordConfirmation],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.send(signupTemplate({ req, errors }));
    }

    const { email, password } = req.body;

    // Create a user in our User Repo to represent this person
    const user = await usersRepo.create({ email, password });

    // Store the id of that user inside the user's cookie
    req.session.userId = user.id;

    res.send('Account Created!');
  }
);

router.get('/signout', (req, res) => {
  // Forget the current session object. Cookie-Session will handle the rest!
  req.session = null;

  res.redirect('/');
});

router.get('/signin', (req, res) => {
  res.send(signinTemplate({}));
});

router.post(
  '/signin',
  [requireEmailExists, requireValidPasswordForUser],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.send(signinTemplate({ errors }));
    }

    const { email } = req.body;
    const user = await usersRepo.getOneBy({ email });

    // At this point, user is valid: Sign in!
    req.session.userId = user.id;

    res.send('You are signed in!');
  }
);

module.exports = router;

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
