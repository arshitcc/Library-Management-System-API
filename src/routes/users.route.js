import { Router } from "express";
import {
  authenticateUser,
  verifyPermission,
} from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import {
  registerNewUserValidators,
  userAssignRoleValidators,
  userLoginValidators,
} from "../middleware/validators/users.validator.js";
import {
  getAllUsers,
  registerNewUser,
  userLogin,
  userLogout,
  getUserById,
  updateUserById,
  deleteUserById,
  uploadUserProfilePicture,
  assignRole,
} from "../controllers/users.controller.js";
import { UserRolesEnum } from "../models/users.model.js";

const router = Router();

router
  .route("/")
  .get(getAllUsers)
  .post(registerNewUserValidators(), validate, registerNewUser);

router.route("/login").post(userLoginValidators(), validate, userLogin);
router.route("/logout").post(authenticateUser, userLogout);

router
  .route("/upload-profile-picture")
  .patch(
    authenticateUser,
    upload.single("profilePicture"),
    uploadUserProfilePicture,
  );

router
  .route("/:id")
  .get(authenticateUser, getUserById)
  .put(authenticateUser, updateUserById)
  .patch(
    authenticateUser,
    verifyPermission([UserRolesEnum.ADMIN]),
    userAssignRoleValidators(),
    validate,
    assignRole,
  )
  .delete(
    authenticateUser,
    deleteUserById,
  );

export default router;
