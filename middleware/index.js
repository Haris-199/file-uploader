const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
}).single("uploaded_file");

const uploadFile = async (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error(err);
      throw err;
    }
    next();
  });
};

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

module.exports = { redirectIfAuthenticated, redirectIfNotAuthenticated, uploadFile };
