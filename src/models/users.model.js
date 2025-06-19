import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import {
  ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRY,
  EMAIL_VERIFICATION_TOKEN_EXPIRY,
} from "../utils/env.js";

export const UserRolesEnum = {
  ADMIN: "admin",
  AUTHOR: "author",
  USER: "user",
};

export const UserAuthType = {
  GOOGLE: "google",
  GITHUB: "github",
  CREDENTIALS: "credentials",
};

export const AvailableUserRoles = Object.values(UserRolesEnum);
export const AvailableAuthTypes = Object.values(UserAuthType);

const UserSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
    },
    role: {
      type: String,
      enum: AvailableUserRoles,
      default: UserRolesEnum.USER,
      required: true,
    },
    profilePicture: {
      type: {
        url: String,
        format: String,
        resource_type: String,
        public_id: String,
      },
    },
    loginType: {
      type: String,
      enum: AvailableAuthTypes,
      default: UserAuthType.CREDENTIALS,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
    },
    emailVerificationExpiry: {
      type: Date,
    },
    refreshToken: {
      type: String,
    },
    forgotPasswordToken: {
      type: String,
    },
    forgotPasswordExpiry: {
      type: Date,
    },
  },
  { timestamps: true },
);

UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

UserSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

UserSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      role: this.role,
    },
    ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY },
  );
};

UserSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ _id: this._id }, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
};

UserSchema.methods.generateTemporaryToken = function () {
  const unHashedToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha512")
    .update(unHashedToken)
    .digest("hex");
  const tokenExpiry =
    Date.now() + Number(eval(EMAIL_VERIFICATION_TOKEN_EXPIRY));

  return { unHashedToken, hashedToken, tokenExpiry: new Date(tokenExpiry) };
};

export const User = mongoose.model("User", UserSchema);
