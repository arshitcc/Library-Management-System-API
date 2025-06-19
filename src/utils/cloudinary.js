import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_FOLDER_NAME,
} from "./env.js";
import { ApiError } from "./api-error.js";

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

const uploadFile = async (filePath) => {
  try {
    const response = await cloudinary.uploader.upload(filePath, {
      folder: CLOUDINARY_FOLDER_NAME,
      resource_type: "auto",
    });
    fs.unlinkSync(filePath);

    return response;
  } catch (error) {
    fs.unlinkSync(filePath);
    throw new ApiError(500, "Failed to upload file to cloudinary");
  }
};

const deleteFile = async (fileId, resource_type) => {
  try {
    const public_id = fileId;
    if (!public_id.trim() || !resource_type.trim()) {
      throw new ApiError(400, "Invalid or Empty FileId or ResourceType");
    }
    if (public_id && resource_type) {
      const response = await cloudinary.uploader.destroy(public_id, {
        resource_type,
      });

      return response;
    } else return false;
  } catch (error) {
    throw new ApiError(500, "Failed to delete file from cloudinary");
  }
};

export { uploadFile, deleteFile };
