const Repository = require('./repository');

class ProductsRepository extends Repository {}

// Export an instance of ProductsRepository
module.exports = new ProductsRepository('products.json');
