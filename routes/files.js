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

router.post("/", upload.single("uploaded_file"), async (req, res) => {
  let newFile = await prisma.file.create({
    data: {
      id: req.file.filename,
      name: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      user: { connect: { id: req.user.id } },
    },
  });

  if (req.body.parentFolderId !== undefined) {
    newFile = await prisma.file.update({
      where: { id: newFile.id },
      data: {
        parentFolder: { connect: { id: Number(req.body.parentFolderId) } },
      },
    });
  }

  if (req.body.parentFolderId) {
    res.redirect(`/folders/${req.body.parentFolderId}`);
  } else {
    res.redirect("/folders");
  }
});

module.exports = router;
