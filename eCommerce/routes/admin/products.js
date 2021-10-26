const express = require('express');
const { validationResult } = require('express-validator');
const productsRepository = require('../../repositories/products');
const productsNewTemplate = require('../../views/admin/products/new');
const { requireProductTitle, requireProductPrice } = require('./validators');

const router = express.Router();

//  Route Handlers

// Admin/Products route
router.get('/admin/products', (req, res) => {});

// Admin/Products/New
router.get('/admin/products/new', (req, res) => {
  res.send(productsNewTemplate({}));
});

router.post(
  '/admin/products/new',
  [requireProductTitle, requireProductPrice],
  (req, res) => {
    const errors = validationResult(req);

    console.log(errors);
    res.send('Submitted');
  }
);

module.exports = router;
