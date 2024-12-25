const prisma = require("../db/client");
const { Router } = require("express");
const { filesize } = require("filesize");

const router = Router();

router.get("/:folderId?", async (req, res) => {
  const { user } = req;
  if (!user) res.redirect("/");
  
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

    if (folder.userId !== user.id) {
      const errContext = {
        view: "error",
        code: "403",
        title: "403 Error",
        detail: "Forbidden",
        message: "You don’t have permission to access this resource.",
      };
      return res.status(403).render(".", errContext);
    }
  }

  res.render(".", context);
});

router.post("/:folderId?", async (req, res) => {
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

router.put("/:folderId", async (req, res) => {
  if (Number(req.params.folderId) !== req.body.folderId) {
    res.sendStatus(400);
  }

  await prisma.folder.update({
    where: { id: req.body.folderId },
    data: { name: req.body.newName },
  });

  res.sendStatus(200);
});

router.delete("/:folderId", async (req, res) => {
  await prisma.folder.delete({ where: { id: Number(req.params.folderId) } });
  res.sendStatus(200);
});

module.exports = router;
