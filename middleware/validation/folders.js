const prisma = require("../../db/client");
const { body, param, validationResult } = require("express-validator");

const getValidation = [
  param("folderId")
    .optional()
    .isInt({ min: 1 }).withMessage("Folder not found.")
    .custom(async (value, { req }) => {
      const folder = await prisma.folder.findUnique({
        where: { id: Number(value) },
        include: { user: true },
      });
      if (!folder) {
        throw new Error("Folder not found.");
      }
      if (folder.user.id !== req.user.id) {
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
        case "Folder not found.":
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

const postValidation = [
  param("folderId")
    .optional()
    .isInt({ min: 1 }).withMessage("Folder not found.")
    .custom(async (value, { req }) => {
      const folder = await prisma.folder.findUnique({
        where: { id: Number(value) },
        include: { user: true },
      });
      if (!folder) {
        throw new Error("Folder not found.");
      }
      if (folder.user.id !== req.user.id) {
        throw new Error("You don’t have permission to access this resource.");
      }
      return true;
    })
    .custom(async (value, { req }) => {
      if (value !== req.body.parentFolderId) {
        throw new Error("Param's folderId does not match body's parentFolderId.");
      }
      return true;
    }),
  body("parentFolderId")
    .optional()
    .isInt({ min: 1 }).withMessage("Folder not found.")
    .custom(async (value, { req }) => {
      if (value !== req.params.folderId) {
        throw new Error("Param's folderId does not match body's parentFolderId.");
      }
      return true;
    }),
  body("folder_name")
    .isLength({ min: 1 }).withMessage("Folder name not provided."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const msg = errors.array()[0].msg;
      const errorContext = {
        view: "error",
        message: msg,
      };
      switch (msg) {
        case "Folder not found.":
          errorContext.detail = "Not Found";
          res.status(404);
          break;
        case "You don’t have permission to access this resource.":
          errorContext.detail = "Forbidden";
          res.status(403);
          break;
        default:
          errorContext.detail = "Bad Request.";
          res.status(400);
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
  body("folderId")
    .custom(async (value, { req }) => {
      if (!Number.isInteger(value) || value < 1) {
        throw new Error("Invalid folder ID.");
      }
      const folder = await prisma.folder.findUnique({
        where: { id: value },
        include: { user: true },
      });
      if (!folder) {
        throw new Error("Folder not found.");
      }
      if (folder.userId !== req.user?.id) {
        throw new Error("You don’t have permission to access this resource.");
      }
      if (value !== Number(req.params.folderId)) {
        throw new Error("Param's folderId does not match body's folderId.");
      }
      return true;
    }),
  body("newName")
    .isLength({ min: 1 }).withMessage("Folder name is required."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send(errors);
    }
    next();
  },
];

const deleteValidation = [
  param("folderId")
    .custom(async (value, { req }) => {
      if (!Number(value) || value < 1) {
        throw new Error("Invalid folder ID.");
      }
      const folder = await prisma.folder.findUnique({
        where: { id: Number(value) },
      });
      if (!folder) {
        throw new Error("Folder not found.");
      }
      if (folder.userId !== req.user?.id) {
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
