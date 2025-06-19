import { Router } from "express";
import {
  authenticateUser,
  verifyPermission,
} from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import {
  addNewBookValidators,
  updateBookValidators,
} from "../middleware/validators/books.validator.js";
import {
  addNewBook,
  getAllBooks,
  getBookById,
  updateBookById,
  deleteBookById,
  uploadBookCoverImage,
} from "../controllers/books.controller.js";
import { UserRolesEnum } from "../models/users.model.js";
import reviewRouter from "../routes/reviews.route.js";

const router = Router();

router
  .route("/")
  .get(getAllBooks)
  .post(
    authenticateUser,
    verifyPermission([UserRolesEnum.AUTHOR]),
    addNewBookValidators(),
    validate,
    addNewBook,
  );

router
  .route("/:id")
  .get(authenticateUser, getBookById)
  .put(
    authenticateUser,
    verifyPermission([UserRolesEnum.AUTHOR]),
    updateBookValidators(),
    validate,
    updateBookById,
  )
  .delete(
    authenticateUser,
    verifyPermission([UserRolesEnum.ADMIN, UserRolesEnum.AUTHOR]),
    deleteBookById,
  );

router
  .route("/:id/upload-cover")
  .patch(
    authenticateUser,
    verifyPermission([UserRolesEnum.AUTHOR]),
    upload.single("coverImage"),
    uploadBookCoverImage,
  );

router.use("/:id/reviews", reviewRouter);

export default router;
