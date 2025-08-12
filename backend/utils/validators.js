function validateRegister(body) {
    if (!body.name || !body.email || !body.password) return false;
    return true;
  }
  
  module.exports = { validateRegister };