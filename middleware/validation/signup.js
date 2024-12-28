const prisma = require("../../db/client");
const { body } = require("express-validator");

const postValidation = [
  body("username")
    .trim()
    .isLength({ min: 1 }).withMessage("Username must be at least 1 character.")
    .custom(async (value) => { 
      const user = await prisma.user.findUnique({ where: { username: value } });
      if (user !== null) { 
        throw new Error("Username already exists.");
      }
      return true;
    }),
  body("password")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long.")
    .matches(/[A-Z]/).withMessage("Password must contain an uppercase letter.")
    .matches(/[a-z]/).withMessage("Password must contain a lowercase letter.")
    .matches(/\d/).withMessage("Password must contain a digit.")
    .matches(/[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/).withMessage("Password must contain a special character."),
  body("confirm_password")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match.");
      }
      return true;
    }),
];

module.exports = { postValidation };
