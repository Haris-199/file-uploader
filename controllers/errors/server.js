const { Prisma } = require("@prisma/client");

const serverErrorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    return res.status(500).render(".", {
      view: "error",
      title: "500 Error",
      code: 500,
      detail: "Internal Server Error",
      message: "Something went wrong with the database.",
      messages: ["Please try again later."],
    });
  }
  res.status(500).render(".", {
    view: "error",
    title: "500 Error",
    code: 500,
    detail: "Internal Server Error",
    message: "Something went wrong.",
  });
};

module.exports = { serverErrorHandler };
