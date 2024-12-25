const bcrypt = require("bcryptjs");
const prisma = require("../db/client");

const { Router } = require("express");
const router = Router();

router.get("/", (req, res) => {
  res.render(".", {
    view: "signup-form",
    title: "Sign Up"
  });
});

router.post("/", async (req, res, next) => {
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
