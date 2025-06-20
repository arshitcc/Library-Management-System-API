import { Router } from "express";
import {
  authenticateUser,
  verifyPermission,
} from "../middleware/auth.middleware.js";
import { UserRolesEnum } from "../models/users.model.js";
import { addNewLoanValidators } from "../middleware/validators/loans.validator.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  getAllLoans,
  createNewLoan,
  updateLoanById,
  deleteLoanById,
} from "../controllers/loans.controller.js";

const router = Router();

router
  .route("/")
  .get(authenticateUser, verifyPermission([UserRolesEnum.ADMIN]), getAllLoans)
  .post(authenticateUser, addNewLoanValidators(), validate, createNewLoan);

router
  .route("/:id")
  .put(
    authenticateUser,
    verifyPermission([UserRolesEnum.ADMIN]),
    updateLoanById,
  )
  .delete(
    authenticateUser,
    verifyPermission([UserRolesEnum.ADMIN]),
    deleteLoanById,
  );

export default router;
