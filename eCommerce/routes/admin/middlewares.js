const { validationResult } = require('express-validator');

module.exports = {
  handleErrors(templateFunction) {
    return (req, res, next) => {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.send(templateFunction({ errors }));
      }

      next();
    };
  },

  requireAuthentication(req, res, next) {
    if (!req.session.userId) {
      return res.redirect('/signin');
    }

    next();
  },
};
