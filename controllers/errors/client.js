const { validationResult } = require("express-validator");

const getErrorContext = (msg) => {
  const errorResponses = {
    "Folder not found.": {
      code: 404,
      detail: "Not Found",
    },
    "You don’t have permission to access this resource.": {
      code: 403,
      detail: "Forbidden",
    },
    "Invalid folder ID.": {
      code: 400,
      detail: "Bad Request",
    },
    "Param's folderId does not match body's parentFolderId.": {
      code: 400,
      detail: "Bad Request",
    },
    "Name is required.": {
      code: 400,
      detail: "Bad Request",
    },
    "No file chosen.": {
      code: 400,
      detail: "Bad Request",
    },
    "Parameter ID does not match body ID.": {
      code: 400,
      detail: "Bad Request",
    },
  };

  const errorContext = {
    ...(errorResponses[msg] || {
      code: 400,
      detail: "Bad Request",
    }),
  };

  errorContext.view = "error";
  errorContext.title = `${errorContext.code} Error`;
  errorContext.message = msg;

  return errorContext;
};

const renderError = () => {
  return (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const msg = errors.array()[0].msg;
      const errorContext = getErrorContext(msg);
      return res.status(errorContext.code).render(".", errorContext);
    }
    next();
  };
};

const sendValidationErrors = () => {
  return (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send(errors);
    }
    next();
  };
};

const sendErrorsHandler = (code, errors) => {
  return (req, res, next) => {
    return res.status(code).send(errors);
  };
};

const signupErrorsHandler = () => {
  return (req, res, next) => {
    const errors = validationResult(req).array();
  
    if (errors.length > 0) {
      const errorContext = {
        view: "signup-form",
        title: "Sign Up",
        username: req.body.username,
        usernameErrors: [],
        passwordErrors: [],
      };

      errors.forEach((error) => {
        if (error.path === "username") {
          errorContext.usernameErrors.push(error.msg);
        } else if (error.path === "password") {
          errorContext.passwordErrors.push(error.msg);
        } else if (error.path === "confirm_password") {
          errorContext.confirmPasswordError = error.msg;
        }
      });
      return res.render(".", errorContext);
    }
    next();
  };
};

module.exports = { renderError, sendValidationErrors, sendErrorsHandler, signupErrorsHandler };
