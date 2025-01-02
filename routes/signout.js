const { Router } = require("express");
const { redirectIfNotAuthenticated } = require("../middleware");
const router = Router();

router.use(redirectIfNotAuthenticated);

router.get("/", (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  })
});

module.exports = router;
