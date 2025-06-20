import asyncHandler from "../utils/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { Author } from "../models/authors.model.js";
import { Review } from "../models/reviews.model.js";
import { Book } from "../models/books.model.js";
import { UserRolesEnum } from "../models/users.model.js";
import mongoose, { isValidObjectId } from "mongoose";

const getAllReviewsOfBookbyBookId = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid Book Id");
  }

  const book = await Book.findById(id);

  if (!book) {
    throw new ApiError(404, "Book doesn't exist");
  }

  let pageNum = parseInt(req.query.page, 10);
  if (isNaN(pageNum) || pageNum < 1) {
    pageNum = 1;
  }

  const limit = 2;
  const skip = (pageNum - 1) * limit;

  let rating = parseInt(req.query.rating, 10);
  if (isNaN(rating) || rating < 1 || rating > 5) {
    rating = 0;
  }

  const matchStage = {};
  if (rating > 0) {
    matchStage.rating = { $gte: rating };
  }

  matchStage.bookId = new mongoose.Types.ObjectId(id);

  const reviews = await Review.aggregate([
    { $match: matchStage },
    { $sort: { createdAt: -1 } },
    {
      $facet: {
        metadata: [{ $count: "total" }, { $addFields: { page: pageNum } }],
        data: [{ $skip: skip }, { $limit: limit }],
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, true, "Reviews Fetched Successfully", reviews));
});

const addNewReviewToBookbyBookId = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid Book Id");
  }

  const book = await Book.findById(id);

  if (!book) {
    throw new ApiError(404, "Book doesn't exist");
  }

  const author = await Author.findById(book.authorId.toString());

  if (author.userId.toString() === req.user._id.toString()) {
    throw new ApiError(400, "You cannot review your own book");
  }

  const existingReview = await Review.findOne({
    bookId: id,
    userId: req.user._id.toString(),
  });

  if (existingReview) {
    throw new ApiError(400, "You have already reviewed this book");
  }

  const review = await Review.create({
    bookId: id,
    userId: req.user._id,
    rating: req.body.rating,
    comment: req.body.comment,
  });

  if (!review) {
    throw new ApiError(500, "Failed to add review");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, true, "Review Added Successfully", review));
});

const updateReviewById = asyncHandler(async (req, res) => {
  const { reviewId, id } = req.params;

  if (!isValidObjectId(reviewId) || !isValidObjectId(id)) {
    throw new ApiError(400, "Invalid Review ID or Book ID");
  }

  const review = await Review.findOne({
    _id: reviewId,
    bookId: id,
    userId: req.user._id.toString(),
  });

  if (!review) {
    throw new ApiError(404, "Your Review doesn't exist");
  }

  let data = {};

  ["rating", "comment"].forEach((key) => {
    if (req.body[key]) {
      data[key] = req.body[key];
    }
  });

  const updatedReview = await Review.findOneAndUpdate(
    { _id: reviewId, bookId: id },
    { $set: data },
    { new: true },
  );

  if (!updatedReview) {
    throw new ApiError(500, "Error updating review");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, true, "Review Updated Successfully", updatedReview),
    );
});

const deleteReviewById = asyncHandler(async (req, res) => {
  const { reviewId, id } = req.params;

  if (!isValidObjectId(reviewId) || !isValidObjectId(id)) {
    throw new ApiError(400, "Invalid Review ID or Book ID");
  }

  const review = await Review.findOne({
    _id: reviewId,
    bookId: id,
  });

  if (
    (req.user.role === UserRolesEnum.USER ||
      req.user.role === UserRolesEnum.AUTHOR) &&
    review.userId.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "Unauthorized action");
  }

  await Review.findOneAndDelete({
    _id: reviewId,
    bookId: id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, true, "Review Deleted Successfully"));
});

export {
  getAllReviewsOfBookbyBookId,
  addNewReviewToBookbyBookId,
  updateReviewById,
  deleteReviewById,
};
