const { v4: uuidv4 } = require("uuid");
const { filesize } = require("filesize");
const prisma = require("../db/client");
const { Router } = require("express");
const { createClient } = require("@supabase/supabase-js");
const { postValidation, getValidation, putValidation, deleteValidation } = require("../middleware/validation/files");
const { redirectIfNotAuthenticated, uploadFile } = require("../middleware");
const stream = require("stream");
require("dotenv").config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
);

const router = Router();

router.use(redirectIfNotAuthenticated);

router.post("/", uploadFile, postValidation, async (req, res) => {
  const fileId = uuidv4();
  try {
    const { error } = await supabase.storage
      .from("Files")
      .upload(`./public/uploads/${fileId}`, req.file.buffer, { contentType: req.file.mimetype });
      
    if (error) {
      console.error("Error uploading file:", error);
      return res.status(500).send(error);
    }
  } catch (err) {
    console.error(err);
    return next(err);
  }

  const newFile = await prisma.file.create({
    data: {
      id: fileId,
      name: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      user: { connect: { id: req.user.id } },
    },
  });

  if (req.body.parentFolderId !== undefined) {
    await prisma.file.update({
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

    const buffer = Buffer.from(await data.arrayBuffer());  
    const readStream = new stream.PassThrough();
    readStream.end(buffer);

    res.set("Content-disposition", "attachment; filename=" + file.name);
    res.set("Content-Type", file.mimetype);
    readStream.pipe(res);
  } catch (e) {
    if (res.headersSent) {
      return next(err);
    }
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
