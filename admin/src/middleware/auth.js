const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.adminId) {
    return next();
  }
  res.redirect('/login');
};

const isNotAuthenticated = (req, res, next) => {
  if (req.session && req.session.adminId) {
    return res.redirect('/dashboard');
  }
  next();
};

module.exports = {
  isAuthenticated,
  isNotAuthenticated
};
