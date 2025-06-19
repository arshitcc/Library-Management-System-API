import { body } from "express-validator";
import { AvailableBookLanguages } from "../../models/books.model.js";

const addNewBookValidators = () => {
  return [
    body("isbn")
      .trim()
      .notEmpty()
      .withMessage("ISBN is required")
      .isString()
      .withMessage("ISBN must be a string"),
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Title is required")
      .isLength({ min: 2, max: 200 })
      .withMessage("Title must be between 2 and 200 characters"),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("Description is required")
      .isLength({ min: 10 })
      .withMessage("Description must be at least 10 characters"),
    body("categories")
      .isArray({ min: 1 })
      .withMessage("Categories must be a non-empty array")
      .bail()
      .custom((arr) =>
        arr.every((t) => typeof t === "string" && t.trim().length > 0),
      )
      .withMessage("Each tag must be a non-empty string"),
    body("edition")
      .trim()
      .notEmpty()
      .withMessage("Edition is required")
      .isString()
      .withMessage("Edition must be a string"),
    body("price")
      .notEmpty()
      .withMessage("Price is required")
      .isFloat({ min: 0 })
      .withMessage("Price must be a non-negative number"),
    body("availableStock")
      .notEmpty()
      .withMessage("availableStock is required")
      .isInt({ min: 0 })
      .withMessage("availableStock must be a non-negative integer"),
    body("publishedDate")
      .notEmpty()
      .withMessage("publishedDate is required")
      .isISO8601()
      .withMessage("publishedDate must be a valid ISO 8601 date")
      .toDate(),
    body("pages")
      .notEmpty()
      .withMessage("Pages is required")
      .isInt({ min: 1 })
      .withMessage("Pages must be an integer >= 1"),
    body("availableInLanguages")
      .optional()
      .isArray()
      .withMessage("availableInLanguages must be an array")
      .bail()
      .custom((arr) =>
        arr.every((lang) => AvailableBookLanguages.includes(lang)),
      )
      .withMessage(
        `Each language must be one of: ${AvailableBookLanguages.join(", ")}`,
      ),
  ];
};

const updateBookValidators = () => {
  return [
    body("isbn")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("ISBN cannot be empty")
      .isString()
      .withMessage("ISBN must be a string"),
    body("title")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Title cannot be empty")
      .isLength({ min: 2, max: 200 })
      .withMessage("Title must be between 2 and 200 characters"),
    body("description")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Description cannot be empty")
      .isLength({ min: 10 })
      .withMessage("Description must be at least 10 characters"),
    body("categories")
      .optional()
      .isArray({ min: 1 })
      .withMessage("Categories must be a non-empty array")
      .bail()
      .custom((arr) =>
        arr.every((t) => typeof t === "string" && t.trim().length > 0),
      )
      .withMessage("Each tag must be a non-empty string"),
    body("edition")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Edition cannot be empty")
      .isString()
      .withMessage("Edition must be a string"),
    body("price")
      .optional()
      .notEmpty()
      .withMessage("Price cannot be empty")
      .isFloat({ min: 0 })
      .withMessage("Price must be a non-negative number"),
    body("availableStock")
      .optional()
      .notEmpty()
      .withMessage("availableStock cannot be empty")
      .isInt({ min: 0 })
      .withMessage("availableStock must be a non-negative integer"),

    body("publishedDate")
      .optional()
      .notEmpty()
      .withMessage("publishedDate cannot be empty")
      .isISO8601()
      .withMessage("publishedDate must be a valid ISO 8601 date")
      .toDate(),
    body("pages")
      .optional()
      .notEmpty()
      .withMessage("Pages cannot be empty")
      .isInt({ min: 1 })
      .withMessage("Pages must be an integer >= 1"),
    body("availableInLanguages")
      .optional()
      .isArray()
      .withMessage("availableInLanguages must be an array")
      .bail()
      .custom((arr) =>
        arr.every((lang) => AvailableBookLanguages.includes(lang)),
      )
      .withMessage(
        `Each language must be one of: ${AvailableBookLanguages.join(", ")}`,
      ),
  ];
};

export { addNewBookValidators, updateBookValidators };
