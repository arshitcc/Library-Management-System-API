import asyncHandler from "../utils/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { User, UserAuthType, UserRolesEnum } from "../models/users.model.js";
import { NODE_ENV } from "../utils/env.js";
import { isValidObjectId } from "mongoose";
import {
  sendEmail,
  emailVerificationTemplate,
} from "../services/users.service.js";
import { uploadFile, deleteFile } from "../utils/cloudinary.js";
import { Author } from "../models/authors.model.js";

const userDetailsNotRequired =
  "-password -refreshToken -emailVerificationToken -emailVerificationExpiry -forgotPasswordToken -forgotPasswordExpiry";

async function generateAccessAndRefreshTokens(user) {
  try {
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Failed to generate tokens");
  }
}

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find();
  if (!users) {
    throw new ApiError(500, "Something Went Wrong");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, true, "Users Fetched Successfully", users));
});

const registerNewUser = asyncHandler(async (req, res) => {
  const { fullname, email, username, password } = req.body;

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "Account with email or username already exists");
  }

  const user = await User.create({
    fullname,
    email,
    username,
    password,
    loginType: UserAuthType.CREDENTIALS,
  });

  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;
  await user.save({ validateBeforeSave: false });
  await sendEmail({
    email,
    subject: "Email Verification",
    template: emailVerificationTemplate({
      username: user.username,
      emailVerificationToken: unHashedToken,
    }),
  });

  const createdUser = await User.findOne({ _id: user._id }).select(
    userDetailsNotRequired,
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        true,
        "Account Registration Successful !! Please verify your email.",
        createdUser,
      ),
    );
});

const userLogin = asyncHandler(async (req, res) => {
  const { user, password } = req.body;

  const existedUser = await User.findOne({
    $or: [{ username: user }, { email: user }],
  });

  if (!existedUser) {
    throw new ApiError(401, "Account doesn't exist");
  }

  if (existedUser.loginType !== UserAuthType.CREDENTIALS) {
    throw new ApiError(
      400,
      "You have previously registered using " +
        existedUser.loginType?.toLowerCase() +
        ". Please use the " +
        existedUser.loginType?.toLowerCase() +
        " login option to access your account.",
    );
  }

  const isPasswordCorrect = await existedUser.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid Credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    existedUser,
  );

  const loggedInUser = await User.findOne({ _id: existedUser._id }).select(
    userDetailsNotRequired,
  );

  const options = {
    httpOnly: true,
    secure: NODE_ENV === "production",
    sameSite: "none",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        true,
        "User Authenticated Successfully",
        loggedInUser,
      ),
    );
});

const userLogout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id.toString(),
    {
      $set: {
        refreshToken: "",
      },
    },
    { new: true },
  );

  const options = {
    httpOnly: true,
    secure: NODE_ENV === "production",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, true, "Logout Successful"));
});

const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid User Id");
  }

  const user = await User.findOne({ _id: id }).select(userDetailsNotRequired);

  if (!user) {
    throw new ApiError(404, "User doesn't exist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, true, "User fetched Successfully", user));
});

const updateUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid User Id");
  }

  if (req.user._id.toString() !== id) {
    throw new ApiError(403, "Unauthorized action");
  }

  const user = await User.findOne({ _id: id }).select(userDetailsNotRequired);

  if (!user) {
    throw new ApiError(404, "User doesn't exist");
  }

  const { fullname, email, username } = req.body;

  const updatedUser = await User.findByIdAndUpdate(
    id,
    {
      $set: {
        fullname,
        email,
        username,
      },
    },
    { new: true },
  ).select(userDetailsNotRequired);

  if (!updatedUser) {
    throw new ApiError(500, "Something went wrong while updating the user");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, true, "User updated Successfully", updatedUser));
});

const deleteUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid User Id");
  }

  if (req.user._id.toString() !== id) {
    throw new ApiError(403, "Unauthorized action");
  }

  await User.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, true, "User deleted Successfully"));
});

const uploadUserProfilePicture = asyncHandler(async (req, res) => {
  if (!req.file || !req.file.path) {
    throw new ApiError(400, "Profile Image is required !!");
  }

  const avatarPath = req.file?.path || "";
  const avatar = await uploadFile(avatarPath);

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id.toString(),
    {
      $set: {
        profilePicture: {
          public_id: avatar.public_id,
          url: avatar.url,
          format: avatar.format,
          resource_type: avatar.resource_type,
        },
      },
    },
    { new: true },
  ).select(userDetailsNotRequired);

  await Author.findOneAndUpdate(
    { userId: req.user._id.toString() },
    {
      $set: {
        profilePicture: {
          public_id: avatar.public_id,
          url: avatar.url,
          format: avatar.format,
          resource_type: avatar.resource_type,
        },
      },
    },
  );

  const { old_avatar_public_id } = req.body;
  if (old_avatar_public_id)
    await deleteFile(old_avatar_public_id, avatar.resource_type);

  return res
    .status(200)
    .json(
      new ApiResponse(200, true, "Avatar updated successfully", updatedUser),
    );
});

const assignRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (id === req.user._id.toString()) {
    throw new ApiError(400, "You can't assign your own role");
  }

  const user = await User.findById(id);

  if (!user) {
    throw new ApiError(404, "Account doesn't exist");
  }
  user.role = role;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, true, "Role assigned successfully!!"));
});

export {
  getAllUsers,
  registerNewUser,
  userLogin,
  userLogout,
  getUserById,
  updateUserById,
  deleteUserById,
  uploadUserProfilePicture,
  assignRole,
};
