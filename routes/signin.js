const prisma = require("../db/client");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const express = require("express");
const router = express.Router();


passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: { username: username },
      });

      if (user === null) {
        return done(null, false, { message: "Incorrect username or user does not exist" });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return done(null, false, { message: "Incorrect password" });
      }

      return done(null, user);
    } catch (err) {
      return done(err, false);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: id } });
    done(null, user);
  } catch (err) {
    done(err);
  }
});

router.get("/", (req, res) => {
  res.render("signin-form");
});

router.post(
  "/",
  passport.authenticate("local", {
    successRedirect: "/drive",
    failureRedirect: "/signin",
  })
);

module.exports = router;
