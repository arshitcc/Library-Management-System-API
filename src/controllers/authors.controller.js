import asyncHandler from "../utils/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { User, UserRolesEnum } from "../models/users.model.js";
import { Author } from "../models/authors.model.js";
import mongoose, { isValidObjectId } from "mongoose";

const addNewAuthor = asyncHandler(async (req, res) => {
  const { bio, nationality, genres } = req.body;

  const user = await User.findById(req.user._id.toString());

  if (!user) {
    throw new ApiError(
      404,
      "User doesn't exist. Please create an account first.",
    );
  }

  const existingAuthor = await Author.findOne({
    userId: req.user._id.toString(),
  });

  if (existingAuthor) {
    throw new ApiError(400, "You are already an author");
  }

  const author = await Author.create({
    userId: req.user._id.toString(),
    name: user.fullname,
    bio,
    nationality,
    genres,
    profilePicture: user.profilePicture,
  });

  if (!author) {
    throw new ApiError(500, "Error creating Author");
  }

  await User.findByIdAndUpdate(
    req.user._id,
    { $set: { role: UserRolesEnum.AUTHOR } },
    { new: true },
  );

  return res
    .status(201)
    .json(new ApiResponse(201, true, "Author created successfully", author));
});

const getAllAuthors = asyncHandler(async (req, res) => {
  const { page, genres } = req.query;

  let pageNum = parseInt(page, 10);
  if (isNaN(pageNum) || pageNum < 1) {
    pageNum = 1;
  }
  const limit = 2;
  const skip = (pageNum - 1) * limit;

  const matchStage = {};
  if (typeof genres === "string" && genres.trim() !== "") {
    const genresArr = genres
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    if (genresArr.length > 0) {
      matchStage.genres = { $in: genresArr };
    }
  }

  const pipeline = [];
  if (Object.keys(matchStage).length > 0) {
    pipeline.push({ $match: matchStage });
  }
  pipeline.push({ $sort: { createdAt: -1 } });
  pipeline.push({
    $facet: {
      metadata: [{ $count: "total" }, { $addFields: { page: pageNum } }],
      data: [{ $skip: skip }, { $limit: limit }],
    },
  });

  const authors = await Author.aggregate(pipeline);

  return res
    .status(200)
    .json(new ApiResponse(200, true, "Authors Fetched Successfully", authors));
});

const getAuthorById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid Author Id");
  }

  const author = await Author.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(id),
      },
    },
    {
      $lookup: {
        from: "books",
        localField: "_id",
        foreignField: "authorId",
        pipeline: [
          {
            $project: {
              title: 1,
              description: 1,
              coverImage: 1,
              price: 1,
            },
          },
          {
            $sort: {
              createdAt: -1,
            },
          },
        ],
        as: "books",
      },
    },
  ]);

  if (!author) {
    throw new ApiError(404, "Author doesn't exist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, true, "Author Fetched Successfully", author));
});

const updateAuthorById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid Author Id");
  }

  const author = await Author.findById(id);

  if (!author) {
    throw new ApiError(404, "Author doesn't exist");
  }

  if (author.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized action");
  }

  let data = {};

  ["bio", "nationality", "genres"].forEach((key) => {
    if (req.body[key]) {
      data[key] = req.body[key];
    }
  });

  if (Object.keys(data).length === 0) {
    throw new ApiError(400, "No valid fields provided for update");
  }

  const updatedAuthor = await Author.findOneAndUpdate(
    {
      _id: id,
      userId: req.user._id.toString(),
    },
    { $set: data },
    { new: true },
  );

  if (!updatedAuthor) {
    throw new ApiError(500, "Error updating Author");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, true, "Author Updated Successfully", updatedAuthor),
    );
});

const deleteAuthorById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid Author Id");
  }

  const author = await Author.findById(id);

  if (!author) {
    throw new ApiError(404, "Author doesn't exist");
  }

  if (author.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized action");
  }

  await Author.findOneAndDelete({ _id: id, userId: req.user._id.toString() });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        true,
        "Author Account has been Deleted Successfully",
      ),
    );
});

export {
  addNewAuthor,
  getAllAuthors,
  getAuthorById,
  updateAuthorById,
  deleteAuthorById,
};
