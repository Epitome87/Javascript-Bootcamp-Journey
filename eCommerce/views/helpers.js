module.exports = {
  getError(errors, property) {
    try {
      /* 
        errors.mapped() gives an object back, that looks like:
        { email: { value, msg, param, location }, password: { value, msg, param, location }, passwordConfirmation: { ditto }
        Then errors.mapped()[prop] gives us the sub-object named "prop" (so the "email" object, "password" object, etc. )
        Finally, errors.mapped()[prop].msg gives us the actual property we care about ('msg')
        */
      return errors.mapped()[property].msg;
    } catch (error) {
      return '';
    }
  },
};
