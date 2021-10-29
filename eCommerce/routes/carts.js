const express = require('express');
const productsRepository = require('../repositories/products');
const cartsRepository = require('../repositories/carts');
const cartShowTemplate = require('../views/carts/show');

const router = express.Router();

// Receive a POST request to add an item to a cart
router.post('/cart/products', async (req, res) => {
  const { productId } = req.body;

  // Figure out the Cart! (Make one? Retrieve one?)
  let cart = undefined;

  if (!req.session.cartId) {
    // We don't have a Cart; need to create one!
    // And store the Cart ID on the req.session.cartId property
    cart = await cartsRepository.create({ items: [] });

    // Assign our Cart session with this newly-created Cart's id.
    req.session.cartId = cart.id;
  } else {
    // We have a Cart; let's get it from the Carts Repo!
    cart = await cartsRepository.getOne(req.session.cartId);
  }

  // Either increment quantity for existing product
  // OR add new Product to the product array
  const existingItem = cart.items.find((item) => item.id === productId);

  if (existingItem) {
    console.log('Item already in Cart; incrementing quantity!');
    existingItem.quantity++;
  } else {
    console.log('Item not in Cart already; adding it!');
    cart.items.push({ id: productId, quantity: 1 });
  }

  // Update the Carts repository with its new items state
  await cartsRepository.update(cart.id, { items: cart.items });

  console.log(cart);

  res.redirect('/cart');
});

// Receive a GET request to show all items in cart
router.get('/cart', async (req, res) => {
  // Redirect if user does not have a Cart
  if (!req.session.cartId) {
    return res.redirect('/');
  }

  const cart = await cartsRepository.getOne(req.session.cartId);
  for (let item of cart.items) {
    const product = await productsRepository.getOne(item.id);
    // Just attach a new key onto our cart item (we won't be saving it back to the database)
    item.product = product;
  }

  console.log('cart.items', cart.items);

  res.send(cartShowTemplate({ items: cart.items }));
});

// Receive a POST request to delete an item from a cart
router.post('/cart/products/delete', async (req, res) => {
  const { itemId } = req.body;
  const cart = await cartsRepository.getOne(req.session.cartId);

  // Only keep items that DO NOT equal the ID of what we want to remove
  const items = cart.items.filter((item) => itemId !== item.id);

  await cartsRepository.update(req.session.cartId, { items });

  res.redirect('/cart');
});

module.exports = router;
