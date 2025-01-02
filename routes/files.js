const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { filesize } = require("filesize");
const { removeFile } = require("../utils/");
const prisma = require("../db/client");
const multer = require("multer");
const { Router } = require("express");
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs/promises");
const { postValidation, getValidation, putValidation, deleteValidation } = require("../middleware/validation/files");
const { redirectIfNotAuthenticated } = require("../middleware");
require("dotenv").config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
);

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

router.use(redirectIfNotAuthenticated);

router.post("/", upload.single("uploaded_file"), postValidation, async (req, res) => {
  try {
    const filePath = path.relative(
      process.cwd(),
      "./public/uploads/" + req.file.filename
    );

    const buffer = await fs.readFile(filePath);

    const { data, error } = await supabase.storage
      .from("Files")
      .upload(filePath, buffer, { contentType: req.file.mimetype });
      
    if (error) {
      console.error("Error uploading file:", error);
      return res.status(500).send(error);
    }
  } catch (e) {
    console.error(e);
    throw e;
  } finally {
    removeFile(req.file.filename);
  }

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

router.get("/:fileId/download", getValidation, async (req, res) => {
  const file = await prisma.file.findUnique({
    where: { id: req.params.fileId },
  });

  try {
    const { data, error } = await supabase.storage.from("Files").download(`public/uploads/${file.id}`);
    
    if (error) {
      console.error("Error downloading file:", error);
      return res.status(500).send(error);
    }

    const filePath = path.relative(process.cwd(), "./public/uploads/" + file.name);
    const buffer = Buffer.from( await data.arrayBuffer() );
    await fs.writeFile(filePath, buffer);
    res.download(filePath, file.name, function (err) {
      if (err) {
        console.error(err);
      } else {
        removeFile(file.name);
      }
    });
  } catch (e) {
    res.status(500).send(e);
    console.error(e);
  } 
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
  await supabase.storage.from("Files").remove(`public/uploads/${fileId}`);
  await prisma.file.delete({ where: { id: fileId } });
  res.sendStatus(200);
});

module.exports = router;
