const passport = require("passport");
const express = require("express");
const { redirectIfAuthenticated } = require("../middleware");
const router = express.Router();

router.use(redirectIfAuthenticated);

router.get("/", (req, res) => {
  res.render(".", {
    view: "signin-form",
    title: "Sign In",
  });
});

router.post("/", (req, res) => {
  passport.authenticate("local", (err, user, info) => {
    if (user) {
      req.login(user, (error) => {
        if (error) {
          console.error(error);
          return res.send(error);
        }
        return res.redirect("/folders");
      });
    } else {
      const errContext = { view: "signin-form", title: "Sign In", username: req.body.username };
      switch (info.message) {
        case "Incorrect password.":
          errContext.passwordError = info.message;
          break;
        case "Incorrect username or user does not exist.":
          errContext.usernameError = info.message;
          break;
      }
      return res.status(400).render(".", errContext);
    }
  })(req, res);
});

module.exports = router;
