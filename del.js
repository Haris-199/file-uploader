const prisma = require("./db/client");

(async () => {
  const str = "87e113ba-ee0c-40c9-abd9-4940969e01d7";
  let file = await prisma.file.findUnique({ where: { id: str }, include: { user: true, parentFolder: true } });
console.log(file);

  // const folderId = 18;
  // const context = {};
  // const folder = await prisma.folder.findUnique({ where: { id: folderId } });
  // context.folderId = folderId;
  // context.parentFolderId = folder.parentFolderId;
  // console.log(folder);
  // console.log(context);
  
})();
