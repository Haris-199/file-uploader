const { v4: uuidv4 } = require("uuid");
const prisma = require("../db/client");
const multer = require("multer");
const { Router } = require("express");

const router = Router();
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "./public/uploads");
    },
    filename: (req, file, cb) => {
      cb(null, uuidv4());
    },
  }),
});

router.get("/", (req, res) => {
  if (!req.user) {
    res.redirect("/");
  }
  console.log(req.user);

  res.render("drive", { user: req.user });
});

router.post("/", upload.single("uploaded_file"), async (req, res) => {
  await prisma.file.create({
    data: {
      id: req.file.filename,
      name: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      user: { connect: { id: req.user.id } },
    },
  });

  res.render("drive", { user: req.user });
});

module.exports = router;
