const prisma = require("../db/client");
const { Router } = require("express");

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
  
  const context = { user, files, folders };

  if (folderId !== null) {
    const folder = await prisma.folder.findUnique({ where: { id: folderId } });
    context.folderId = folderId;
    context.parentFolderId = folder.parentFolderId;
  }

  res.render("folder", context);
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

module.exports = router;
