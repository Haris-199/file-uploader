const prisma = require("./db/client");

(async () => {
  let files = await prisma.file.findMany({ include: { user: true } });
  // users = await prisma.user.findFirst({
  //   where: { username: "Haris" },
  //   include: { files: true },
  // });
  await prisma.file.deleteMany();
  // console.log(files);

  const folderId = 18;
  const context = {};
  const folder = await prisma.folder.findUnique({ where: { id: folderId } });
  context.folderId = folderId;
  context.parentFolderId = folder.parentFolderId;
  console.log(folder);
  console.log(context);
  
})();
