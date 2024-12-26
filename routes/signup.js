const bcrypt = require("bcryptjs");
const prisma = require("../db/client");

const { Router } = require("express");
const { postValidation } = require("../middleware/validation/signup");
const { validationResult } = require("express-validator");
const router = Router();

router.get("/", (req, res) => {
  res.render(".", {
    view: "signup-form",
    title: "Sign Up"
  });
});

router.post("/", postValidation, async (req, res, next) => {
  const errors = validationResult(req).array();

  if (errors.length > 0) {
    const errorContext = {
      view: "signup-form",
      title: "Sign Up",
      username: req.body.username,
      usernameErrors: [],
      passwordErrors: [],
    };

    errors.forEach((error) => {
      if (error.path === "username") {
        errorContext.usernameErrors.push(error.msg);
      } else if (error.path === "password") {
        errorContext.passwordErrors.push(error.msg);
      } else if (error.path === "confirm_password") {
        errorContext.confirmPasswordError = error.msg;
      }
    });
    return res.render(".", errorContext);
  }

  try {
    bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
      if (err) {
        return next(err);
      }

      await prisma.user.create({
        data: {
          username: req.body.username,
          password: hashedPassword,
        },
      });
    });
    
    res.redirect("/");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
