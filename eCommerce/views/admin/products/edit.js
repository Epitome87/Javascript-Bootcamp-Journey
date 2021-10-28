const layout = require('../layout');

module.exports = ({ product }) => {
  const content = `
    <form method="POST">
        <input name="title" value="${product.title}" />
        <input name="price" value="${product.price}" />
        <input name="image" type="file" />
        <button>Submit</button>
    </form>
  `;

  return layout({ content });
};
