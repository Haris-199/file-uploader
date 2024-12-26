const prisma = require("./db/client");

(async () => {
  console.log(await prisma.user.findUnique({
    where: { username: "a" },
  }));
})();
