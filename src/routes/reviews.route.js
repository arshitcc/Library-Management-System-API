import { Router } from "express";
import {
  authenticateUser,
} from "../middleware/auth.middleware.js";
import {
  addNewReviewValidators,
  updateReviewValidators,
} from "../middleware/validators/reviews.validator.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  getAllReviewsOfBookbyBookId,
  addNewReviewToBookbyBookId,
  updateReviewById,
  deleteReviewById,
} from "../controllers/reviews.controller.js";

const router = Router({ mergeParams: true });

router
  .route("/")
  .get(authenticateUser, getAllReviewsOfBookbyBookId)
  .post(
    authenticateUser,
    addNewReviewValidators(),
    validate,
    addNewReviewToBookbyBookId,
  );

router
  .route("/:reviewId")
  .put(
    authenticateUser,
    updateReviewValidators(),
    validate,
    updateReviewById,
  )
  .delete(
    authenticateUser,
    deleteReviewById,
  );

export default router;
