import { Router } from "express";
import {
  authenticateUser,
  verifyPermission,
} from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  addNewAuthorValidators,
  updateAuthorValidators,
} from "../middleware/validators/authors.validator.js";
import {
  addNewAuthor,
  getAllAuthors,
  getAuthorById,
  updateAuthorById,
  deleteAuthorById,
} from "../controllers/authors.controller.js";
import { UserRolesEnum } from "../models/users.model.js";

const router = Router();

router
  .route("/")
  .get(authenticateUser, getAllAuthors)
  .post(authenticateUser, addNewAuthorValidators(), validate, addNewAuthor);

router
  .route("/:id")
  .get(authenticateUser, getAuthorById)
  .put(
    authenticateUser,
    verifyPermission([UserRolesEnum.AUTHOR]),
    updateAuthorValidators(),
    validate,
    updateAuthorById,
  )
  .delete(
    authenticateUser,
    verifyPermission([UserRolesEnum.ADMIN, UserRolesEnum.AUTHOR]),
    deleteAuthorById,
  );

export default router;
