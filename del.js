const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
    }
  })
  console.log(!users);
})();
