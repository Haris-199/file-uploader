const prisma = require("./db/client");

// await prisma.user.create({
//   data: {
//     username: "haris",
//     password: "password",
//   },
// });

(async () => {
  // const users = await prisma.user.findMany(); 
  const users = await prisma.user.findUnique({
    where: {
      username: "aris",
    },
  })
  console.log(!users);
})();
