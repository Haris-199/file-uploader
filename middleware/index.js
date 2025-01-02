const redirectIfAuthenticated = (req, res, next) => {
  if (req.user) {
    return res.redirect("/folders");
  }
  next();
};

const redirectIfNotAuthenticated = (req, res, next) => {
  if (!req.user) {
    return res.redirect("/signin");
  }
  next();
};

module.exports = { redirectIfAuthenticated, redirectIfNotAuthenticated };
