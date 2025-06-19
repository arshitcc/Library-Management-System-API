import { validationResult } from "express-validator";
import { ApiError } from "../utils/api-error.js";

export const validate = (req, _, next) => {

  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  throw new ApiError(
    400,
    "Validation Failed",
    errors.array()[0],
    false,
    errors.array(),
  );
};
