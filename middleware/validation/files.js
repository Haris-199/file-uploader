const { renderError, sendValidationErrors } = require("../../controllers/errors/client");
const prisma = require("../../db/client");
const { body, param } = require("express-validator");

const postValidation = [
  body("uploaded_file").custom((value, { req }) => {
    if (!req.file) {
      throw new Error("No file chosen.");
    }
    // Larger than 1MB
    if (req.file.size > 1048576) {
      throw new Error("File is too large.");
    }
    return true;
  }),
  renderError(),
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
  renderError(),
];

const putValidation = [
  param("fileId")
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
      if (file.userId !== req.user?.id) {
        throw new Error("You don’t have permission to access this resource.");
      }
      return true;
    }),
  body("newName")
    .trim()
    .isLength({ min: 1 }).withMessage("Name is required."),
  sendValidationErrors(),
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
  sendValidationErrors(),
];

module.exports = { postValidation, getValidation, putValidation, deleteValidation};
