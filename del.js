const prisma = require("./db/client");

(async () => {
  let files = await prisma.file.findMany({ include: { user: true } });
  // users = await prisma.user.findFirst({
  //   where: { username: "Haris" },
  //   include: { files: true },
  // });
  await prisma.file.deleteMany();
  console.log(files);
})();
