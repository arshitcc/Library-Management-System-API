import { body } from "express-validator";

const addNewAuthorValidators = () => {
  return [
    body("bio")
      .optional()
      .isString()
      .withMessage("Bio must be a string")
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Bio cannot exceed 1000 characters"),

    body("nationality")
      .optional()
      .trim()
      .isLength({ min: 2, max: 30 })
      .withMessage("Nationality must be between 2 and 30 characters"),

    body("genres")
      .optional()
      .isArray()
      .withMessage("Genres must be an array of strings")
      .bail()
      .custom((arr) =>
        arr.every((t) => typeof t === "string" && t.trim().length > 0),
      )
      .withMessage("Each genre must be a non-empty string"),
  ];
};

const updateAuthorValidators = () => {
  return [
    body("bio")
      .optional()
      .isString()
      .withMessage("Bio must be a string")
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Bio cannot exceed 1000 characters"),

    body("nationality")
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Nationality must be between 2 and 100 characters"),

    body("genres")
      .optional()
      .isArray()
      .withMessage("Genres must be an array of strings")
      .bail()
      .custom((arr) =>
        arr.every((t) => typeof t === "string" && t.trim().length > 0),
      )
      .withMessage("Each genre must be a non-empty string"),
  ];
};

export { addNewAuthorValidators, updateAuthorValidators };
