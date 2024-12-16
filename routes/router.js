const { Router } = require("express");
const homeRouter = require("./home");
const signupRouter = require("./signup");
const signinRouter = require("./signin");
const signoutRouter = require("./signout");

const router = Router();

router.use("/",  homeRouter);
router.use("/signup",  signupRouter);
router.use("/signin",  signinRouter);
router.use("/signout",  signoutRouter);

module.exports = router;
