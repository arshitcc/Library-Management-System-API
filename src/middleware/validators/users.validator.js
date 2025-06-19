import { body, param } from "express-validator";
import { AvailableUserRoles } from "../../models/users.model.js";

const registerNewUserValidators = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Please enter a valid email")
      .normalizeEmail(),

    body("fullname")
      .trim()
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ min: 2, max: 100 })
      .withMessage("Name must be between 2 and 100 characters"),

    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 8, max: 50 })
      .withMessage("Password must be between 8 and 50 characters")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter")
      .matches(/[a-z]/)
      .withMessage("Password must contain at least one lowercase letter")
      .matches(/\d/)
      .withMessage("Password must contain at least one number")
      .matches(/[!@#$%^&*]/)
      .withMessage("Password must contain at least one special character"),

    body("username")
      .trim()
      .notEmpty()
      .withMessage("Username is required")
      .isLength({ min: 5, max: 60 })
      .withMessage("Username must be between 5 and 60 characters"),
  ];
};

const userLoginValidators = () => {
  return [
    body("user")
      .trim()
      .notEmpty()
      .withMessage("Username or Email is required")
      .isLength({ min: 5, max: 60 })
      .withMessage("Username or Email must be between 5 and 60 characters"),

    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 8, max: 50 })
      .withMessage("Password must be minimum 8 characters"),
  ];
};

const userAssignRoleValidators = () => {
  return [
    body("role").isIn(AvailableUserRoles).withMessage("Invalid Role requested"),
    param("id").isMongoId().withMessage("Invalid User ID"),
  ];
};

export {
  registerNewUserValidators,
  userLoginValidators,
  userAssignRoleValidators,
};
