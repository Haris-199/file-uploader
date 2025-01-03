const prisma = require("../db/client");
const { Router } = require("express");
const { filesize } = require("filesize");
const { redirectIfNotAuthenticated } = require("../middleware");
const { getValidation, postValidation, putValidation, deleteValidation } = require("../middleware/validation/folders");

const router = Router();

router.use(redirectIfNotAuthenticated);

router.get("/:folderId?", getValidation, async (req, res) => {
  const { user } = req;
  const folderId = +req.params.folderId || null;

  const files = await prisma.file.findMany({
    where: { userId: user.id, parentFolderId: folderId },
  });
  const folders = await prisma.folder.findMany({
    where: { userId: user.id, parentFolderId: folderId },
  });
  
  const context = { view: "folder", title: "My Drive", user, files, filesize, folders};

  if (folderId !== null) {
    const folder = await prisma.folder.findUnique({ where: { id: folderId } });
    context.folderName = folder.name;
    context.folderId = folderId;
    context.parentFolderId = folder.parentFolderId;
  }

  res.render(".", context);
});

router.post("/:folderId?", postValidation, async (req, res) => {
  const { folder_name, parentFolderId } = req.body;
  
  const newFolder = await prisma.folder.create({
    data: {
      name: folder_name,
      user: { connect: { id: req.user.id } },
    },
  });

  let redirectRoute = "/folders";
  if (parentFolderId !== undefined) {
    await prisma.folder.update({
      where: { id: newFolder.id },
      data: {
        parentFolder: { connect: { id: Number(parentFolderId) } },
      },
    });
    redirectRoute += "/" + parentFolderId;
  }
  res.redirect(redirectRoute);
});

router.put("/:folderId", putValidation, async (req, res) => {
  await prisma.folder.update({
    where: { id: req.body.folderId },
    data: { name: req.body.newName },
  });

  res.sendStatus(200);
});

router.delete("/:folderId", deleteValidation, async (req, res) => {
  await prisma.folder.delete({ where: { id: Number(req.params.folderId) } });
  res.sendStatus(200);
});

module.exports = router;
