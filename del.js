// grep -nr --exclude-dir=node_modules "console.error"
const prisma = require("./db/client");

(async () => {
  console.log(await prisma.file.findMany());
  
  // console.log(await prisma.user.findUnique({
  //   where: { username: "a" },
  // }));
})();
