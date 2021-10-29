const express = require('express');
const multer = require('multer');

const { handleErrors, requireAuthentication } = require('./middlewares');
const productsRepository = require('../../repositories/products');
const productsNewTemplate = require('../../views/admin/products/new');
const productsIndexTemplate = require('../../views/admin/products/index');
const productsEditTemplate = require('../../views/admin/products/edit');
const { requireProductTitle, requireProductPrice } = require('./validators');
const products = require('../../repositories/products');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

//  ***** Route Handlers *****

// Admin/Products route
router.get('/admin/products', requireAuthentication, async (req, res) => {
  const products = await productsRepository.getAll();

  res.send(productsIndexTemplate({ products }));
});

// Admin/Products/New
router.get('/admin/products/new', requireAuthentication, (req, res) => {
  res.send(productsNewTemplate({}));
});

router.post(
  '/admin/products/new',
  requireAuthentication,
  upload.single('image'),
  [requireProductTitle, requireProductPrice],
  handleErrors(productsNewTemplate),
  async (req, res) => {
    const image = req.file.buffer.toString('base64');
    const { title, price } = req.body;

    const newProduct = await productsRepository.create({ image, title, price });

    res.redirect('/admin/products');
  }
);

router.get('/admin/products/:id/edit', async (req, res) => {
  const productId = req.params.id;
  const productToEdit = await productsRepository.getOne(productId);

  if (!productToEdit) {
    return res.send('Product with that ID not found');
  }

  res.send(productsEditTemplate({ product: productToEdit }));
});

router.post(
  '/admin/products/:id/edit',
  requireAuthentication,
  upload.single('image'),
  [requireProductTitle, requireProductPrice],
  handleErrors(productsEditTemplate),
  async (req, res) => {
    const productEdits = req.body;

    if (req.file) productEdits.image = req.file.buffer.toString('base64');

    try {
      await productsRepository.update(req.params.id, productEdits);
    } catch (error) {
      return res.send('Could not find item');
    }

    res.redirect('/admin/products');
  }
);

router.post(
  '/admin/products/:id/delete',
  requireAuthentication,
  async (req, res) => {
    await productsRepository.delete(req.params.id);
    res.redirect('/admin/products');
  }
);

module.exports = router;
