const path = require("path");
const { cwd } = require("node:process");
const { v4: uuidv4 } = require("uuid");
const { filesize } = require("filesize");
const { removeFile } = require("../utils/");
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
    return res.redirect(`/folders/${req.body.parentFolderId}`);
  }
  res.redirect("/folders");
});

router.get("/:fileId/download", async (req, res) => {
  const file = await prisma.file.findUnique({
    where: { id: req.params.fileId },
  });

  if (!file) {
    const errContext = {
      view: "error",
      code: "404",
      title: "404 Error",
      detail: "Not Found",
      message: "File not found.",
    };
    return res.status(404).render(".", errContext);
  }

  const filePath = path.relative(cwd(), "./public/uploads/" + file.id);
  res.download(filePath, file.name);
});

router.get("/:fileId", async (req, res) => {
  const file = await prisma.file.findUnique({
    where: { id: req.params.fileId },
    include: { user: true, parentFolder: true },
  });

  if (!file) {
    const errContext = {
      view: "error",
      code: "404",
      title: "404 Error",
      detail: "Not Found",
      message: "File not found.",
    };
    return res.status(404).render(".", errContext);
  }
  if (file.user.id !== req.user.id) {
    const errContext = {
      view: "error",
      code: "403",
      title: "403 Error",
      detail: "Forbidden",
      message: "You don’t have permission to access this resource.",
    };
    return res.status(403).render(".", errContext);
  }

  const context = {
    view: "file",
    file,
    filesize,
    username: file.user.username,
    folder: file.parentFolder,
  };

  res.render(".", context);
});

router.put("/:fileId", async (req, res) => {
  if (req.params.fileId !== req.body.fileId) {
    res.sendStatus(400);
  }

  await prisma.file.update({
    where: { id: req.body.fileId },
    data: { name: req.body.newName },
  });

  res.sendStatus(200);
});

router.delete("/:fileId", async (req, res) => {
  const { fileId } = req.params;
  removeFile(fileId);
  await prisma.file.delete({ where: { id: fileId } });
  res.sendStatus(200);
});

module.exports = router;
