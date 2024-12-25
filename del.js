const prisma = require("./db/client");

(async () => {
  console.log(await prisma.folder.findMany());
})();
