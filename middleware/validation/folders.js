const { renderError, sendValidationErrors } = require("../../controllers/errors/client");
const prisma = require("../../db/client");
const { body, param } = require("express-validator");

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
  renderError(),
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
    .isLength({ min: 1 }).withMessage("Name is required."),
  renderError(),
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
      if (folder.userId !== 12) {
        throw new Error("You don’t have permission to access this resource.");
      }
      if (value !== Number(req.params.folderId)) {
        throw new Error("Param's folderId does not match body's folderId.");
      }
      return true;
    }),
  body("newName")
    .isLength({ min: 1 }).withMessage("Name is required."),
  sendValidationErrors(),
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
  sendValidationErrors(),
];

module.exports = { postValidation, getValidation, putValidation, deleteValidation};
