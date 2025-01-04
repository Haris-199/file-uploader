const bcrypt = require("bcryptjs");
const prisma = require("../db/client");
const { Router } = require("express");
const { postValidation } = require("../middleware/validation/signup");
const { validationResult } = require("express-validator");
const { redirectIfAuthenticated } = require("../middleware");
const router = Router();

router.use(redirectIfAuthenticated);

router.get("/", (req, res) => {
  res.render(".", {
    view: "signup-form",
    title: "Sign Up"
  });
});

router.post("/", postValidation, async (req, res, next) => {
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
    
    res.redirect("/signin");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
