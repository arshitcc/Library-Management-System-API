import jwt from "jsonwebtoken";
import { User } from "../models/users.model.js";
import asyncHandler from "../utils/async-handler.js";
import { ACCESS_TOKEN_SECRET } from "../utils/env.js";
import { ApiError } from "../utils/api-error.js";

const authenticateUser = asyncHandler(async (req, _, next) => {
  const token =
    req.cookies?.accessToken ||
    req.headers.authorization?.replace("Bearer ", "");

  if (!token?.trim()) {
    throw new ApiError(401, "Unauthorized request");
  }

  const decodedToken = jwt.verify(token, ACCESS_TOKEN_SECRET);

  if (!decodedToken) {
    throw new ApiError(401, "Unauthorized Token");
  }

  const user = await User.findById(decodedToken._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry -forgotPasswordToken -forgotPasswordExpiry -profilePicture",
  );

  if (!user) {
    throw new ApiError(404, "Account doesn't exist");
  }

  req.user = user;
  next();
});

const verifyPermission = (roles = []) =>
  asyncHandler(async (req, res, next) => {
    if (!req.user?._id) {
      throw new ApiError(401, "Unauthorized request");
    }
    if (roles.includes(req.user.role)) {
      next();
    } else {
      throw new ApiError(403, "Unauthorized action");
    }
  });

export { authenticateUser, verifyPermission };
