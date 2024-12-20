const { Router } = require("express");
const homeRouter = require("./home");
const signupRouter = require("./signup");
const signinRouter = require("./signin");
const signoutRouter = require("./signout");
const foldersRouter = require("./folders");
const filesRouter = require("./files");

const router = Router();

router.use("/",  homeRouter);
router.use("/signup",  signupRouter);
router.use("/signin",  signinRouter);
router.use("/signout",  signoutRouter);
router.use("/folders",  foldersRouter);
router.use("/files",  filesRouter);

module.exports = router;
