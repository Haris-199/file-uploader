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

router.get("*", (req, res) => {
  res.status(404).render(".", {
    view: "error",
    title: "404 Error",
    code: 404,
    detail: "Not Found",
    message: "Page not found.",
  });
});

module.exports = router;
