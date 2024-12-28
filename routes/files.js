const path = require("path");
const { cwd } = require("node:process");
const { v4: uuidv4 } = require("uuid");
const { filesize } = require("filesize");
const { removeFile } = require("../utils/");
const prisma = require("../db/client");
const multer = require("multer");
const { Router } = require("express");

const { postValidation, getValidation, putValidation, deleteValidation } = require("../middleware/validation/files");

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

router.post("/", postValidation, upload.single("uploaded_file"), async (req, res) => {
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
      return res.redirect(`/folders/${req.body.parentFolderId}`);
    }
    res.redirect("/folders");
  },
);

router.get("/:fileId/download", getValidation,async (req, res) => {
  const file = await prisma.file.findUnique({
    where: { id: req.params.fileId },
  });

  const filePath = path.relative(cwd(), "./public/uploads/" + file.id);
  res.download(filePath, file.name);
});

router.get("/:fileId", getValidation, async (req, res) => {
  const file = await prisma.file.findUnique({
    where: { id: req.params.fileId },
    include: { user: true, parentFolder: true },
  });
  
  const context = {
    view: "file",
    file,
    filesize,
    username: file.user.username,
    folder: file.parentFolder,
  };

  res.render(".", context);
});

router.put("/:fileId", putValidation, async (req, res) => {
  await prisma.file.update({
    where: { id: req.body.fileId },
    data: { name: req.body.newName },
  });

  res.sendStatus(200);
});

router.delete("/:fileId", deleteValidation, async (req, res) => {
  const { fileId } = req.params;
  removeFile(fileId);
  await prisma.file.delete({ where: { id: fileId } });
  res.sendStatus(200);
});

module.exports = router;
