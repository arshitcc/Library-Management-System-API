import { body } from "express-validator";
import { isValidObjectId } from "mongoose";

const addNewLoanValidators = () => {
  return [
    body("bookIds")
      .isArray({ min: 1 })
      .withMessage("At least one book is required")
      .bail()
      .custom((arr) =>
        arr.every((t) => typeof t === "string" && isValidObjectId(t)),
      ),
  ];
};

export { addNewLoanValidators };
