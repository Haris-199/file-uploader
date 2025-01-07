const prisma = require("../db/client");
require("dotenv").config();

const createGuestUser = () => {
  let done = false;
  return async (req, res, next) => {
    if (done) {
      return next();
    }
    try {
      await prisma.user.create({
        data: {
          username: "guest",
          password: process.env.SECRET,
        }
      });
    } catch (err) {
      if (err.code === "P2002") {
        done = true;
        return next();
      }
      return next(err);
    }
    done = true;
    next();
  }
};

const setLocalsUser = (req, res, next) => {
  if (req.user) {
    res.locals.user = req.user;
  }
  next();
};

module.exports = [createGuestUser(), setLocalsUser];
