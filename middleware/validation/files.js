const prisma = require("../../db/client");
const { body, param, validationResult } = require("express-validator");

const postValidation = [
  body("uploaded_file").custom((value, { req }) => {
    if (!req.file) {
      throw new Error("No file chosen.");
    }
    return true;
  }),
  (req, res, next) => {
    const errors = validationResult(req).array();
    if (errors.length > 0) {
      return res.status(400).render(".", {
        view: "error",
        code: "400",
        title: "400 Error",
        detail: "Bad Request",
        message: errors[0].msg,
      });
    }
    next();
  },
];

const getValidation = [
  param("fileId")
    .custom(async (value, { req }) => {
      const file = await prisma.file.findUnique({
        where: { id: value },
        include: { user: true },
      });
      if (!file) {
        throw new Error("File not found.");
      }
      if (file.user.id !== req.user.id) {
        throw new Error("You don’t have permission to access this resource.");
      }
      return true;
    }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const msg = errors.array()[0].msg;
      const errorContext = {
        view: "error",
        message: msg,
      };
      switch (msg) {
        case "File not found.":
          errorContext.detail = "Not Found";
          res.status(404);
          break;
        case "You don’t have permission to access this resource.":
          errorContext.detail = "Forbidden";
          res.status(403);
          break;
      }
      return res.render(".", {
        ...errorContext,
        code: res.statusCode,
        title: `${res.statusCode} Error`,
      });
    }
    next();
  },
];

const putValidation = [
  body("fileId")
    .isUUID(4).withMessage("Invalid file ID.")
    .custom(async (value, { req }) => {
      if (value !== req.body.fileId) {
        throw new Error("Parameter ID does not match body ID.");
      }
      const file = await prisma.file.findUnique({
        where: { id: value },
      });
      if (!file) {
        throw new Error("File not found.");
      }
      if (file.userId !== 12) {
        throw new Error("You don’t have permission to access this resource.");
      }
      return true;
    }),
  body("newName")
    .trim()
    .isLength({ min: 1 }).withMessage("Name is required."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send(errors);
    }
    next();
  },
];

const deleteValidation = [
  param("fileId")
    .isUUID(4).withMessage("Invalid file ID.")
    .custom(async (value, { req }) => {
      const file = await prisma.file.findUnique({
        where: { id: value },
      });
      if (!file) { 
        throw new Error("File not found.");
      }
      if (file.userId !== req.user?.id) {
        throw new Error("You don’t have permission to access this resource.");
      }
      return true;
    }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send(errors);
    }
    next();
  },
];

module.exports = { postValidation, getValidation, putValidation, deleteValidation};
