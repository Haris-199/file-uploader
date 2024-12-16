const { Router } = require("express");
const router = Router();

router.get("/", (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  })
});

module.exports = router;
