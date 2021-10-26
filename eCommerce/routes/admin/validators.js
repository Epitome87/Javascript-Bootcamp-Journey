const { check } = require('express-validator');
const usersRepository = require('../../repositories/users');

module.exports = {
  requireEmail: check('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .custom(async (email) => {
      const existingUser = await usersRepository.getOneBy({ email });
      if (existingUser) throw new Error('Email already in use');
    }),

  requirePassword: check('password')
    .trim()
    .isLength({ min: 5, max: 20 })
    .withMessage('Password must be between 5 and 20 characters'),

  requirePasswordConfirmation: check('passwordConfirmation')
    .trim()
    .isLength({ min: 5, max: 20 })
    .withMessage('Password must be between 5 and 20 characters')
    .custom(async (passwordConfirmation, { req }) => {
      if (req.body.password !== passwordConfirmation)
        throw new Error('Passwords do not match');
    }),

  requireEmailExists: check('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Must provide a valid email address')
    .custom(async (email) => {
      const user = await usersRepository.getOneBy({ email });
      if (!user) throw new Error('Email not found');
    }),

  requireValidPasswordForUser: check('password')
    .trim()
    .custom(async (password, { req }) => {
      const user = await usersRepository.getOneBy({ email: req.body.email });
      if (!user) throw new Error('Invalid password');

      const isValidPassword = await usersRepository.comparePasswords(
        user.password,
        password
      );
      if (!isValidPassword) throw new Error('Invalid password');
    }),

  requireProductTitle: check('title')
    .trim()
    .isLength({ min: 5, max: 40 })
    .withMessage('Product title must be between 5 and 40 characters'),

  requireProductPrice: check('price')
    .trim()
    .toFloat()
    .isFloat({ min: 1 })
    .withMessage('Please enter a valid price'),
};
