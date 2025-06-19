import asyncHandler from "../utils/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { Book } from "../models/books.model.js";
import { Author } from "../models/authors.model.js";
import { UserRolesEnum } from "../models/users.model.js";
import { uploadFile, deleteFile } from "../utils/cloudinary.js";
import mongoose, { isValidObjectId } from "mongoose";

const commonAuthorAggregation = () => {
  return [
    {
      $lookup: {
        from: "authors",
        localField: "authorId",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              name: 1,
              profilePicture: 1,
            },
          },
        ],
        as: "author",
      },
    },
    { $unwind: { path: "$author", preserveNullAndEmptyArrays: true } },
  ];
};

const addNewBook = asyncHandler(async (req, res) => {
  const {
    isbn,
    title,
    description,
    categories,
    edition,
    price,
    availableStock,
    publishedDate,
    pages,
    availableInLanguages,
  } = req.body;

  const existing = await Book.findOne({ isbn });
  if (existing) {
    throw new ApiError(409, "A book with this ISBN already exists");
  }

  const author = await Author.findOne({ userId: req.user._id.toString() });

  if (!author) {
    throw new ApiError(
      404,
      "Your Author account doesn't exist. Please create an Author account first.",
    );
  }

  const book = await Book.create({
    isbn,
    title,
    authorId: author._id,
    description,
    categories,
    edition,
    price,
    availableStock,
    publishedDate,
    pages,
    availableInLanguages,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, true, "Book Added Successfully", book));
});

const getAllBooks = asyncHandler(async (req, res) => {
  let pageNum = parseInt(req.query.page, 10);
  if (isNaN(pageNum) || pageNum < 1) {
    pageNum = 1;
  }

  const limit = 2;
  const skip = (pageNum - 1) * limit;

  const { title, categories, minPrice, maxPrice, languages } =
    req.query;

  const matchStage = {};

  if (typeof title === "string" && title.trim() !== "") {
    const escaped = title.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    matchStage.title = { $regex: escaped, $options: "i" };
  }

  if (typeof categories === "string" && categories.trim() !== "") {
    const categoriesArr = categories
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    if (categoriesArr.length > 0) {
      matchStage.categories = { $in: categoriesArr };
    }
  }

  const priceFilter = {};
  const min = parseFloat(minPrice);
  if (!isNaN(min)) {
    priceFilter.$gte = min;
  }
  const max = parseFloat(maxPrice);
  if (!isNaN(max)) {
    priceFilter.$lte = max;
  }
  if (Object.keys(priceFilter).length > 0) {
    matchStage.price = priceFilter;
  }

  const langParam = typeof languages === "string" ? languages : "";
  if (typeof langParam === "string" && langParam.trim() !== "") {
    const langArr = langParam
      .split(",")
      .map((l) => l.trim().toLowerCase())
      .filter((l) => l.length > 0);
    if (langArr.length > 0) {
      matchStage.availableInLanguages = {
        $in: langArr,
      };
    }
  }

  const pipeline = [];
  if (Object.keys(matchStage).length > 0) {
    pipeline.push({ $match: matchStage });
  }
  pipeline.push({ $sort: { createdAt: -1 } });
  pipeline.push(...commonAuthorAggregation());
  pipeline.push({
    $facet: {
      metadata: [{ $count: "total" }, { $addFields: { page: pageNum } }],
      data: [{ $skip: skip }, { $limit: limit }],
    },
  });

  const books = await Book.aggregate(pipeline);

  return res
    .status(200)
    .json(new ApiResponse(200, true, "Books Fetched Successfully", books));
});

const getBookById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid Book Id");
  }

  const book = await Book.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(id),
      },
    },
    ...commonAuthorAggregation(),
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, true, "Book Fetched Successfully", book[0]));
});

const updateBookById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid Book Id");
  }

  const book = await Book.findById(id);

  if (!book) {
    throw new ApiError(404, "Book doesn't exist");
  }

  const author = await Author.findOne({ userId: req.user._id });

  if (!author) {
    throw new ApiError(
      404,
      "Your Author account doesn't exist. Please create an Author account first.",
    );
  }

  if (
    req.user.role === UserRolesEnum.AUTHOR &&
    book.authorId.toString() !== author._id.toString()
  ) {
    throw new ApiError(403, "Unauthorized action");
  }

  let data = {};

  [
    "isbn",
    "title",
    "description",
    "categories",
    "edition",
    "price",
    "availableStock",
    "publishedDate",
    "pages",
    "availableInLanguages",
  ].forEach((key) => {
    if (req.body[key]) {
      data[key] = req.body[key];
    }
  });

  const updatedBook = await Book.findOneAndUpdate(
    { _id: id, authorId: author._id },
    { $set: data },
    { new: true },
  );

  return res
    .status(200)
    .json(new ApiResponse(200, true, "Book updated successfully", updatedBook));
});

const deleteBookById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid Book Id");
  }

  const book = await Book.findById(id);

  if (!book) {
    throw new ApiError(404, "Book doesn't exist");
  }

  const author = await Author.findOne({ userId: req.user._id.toString() });

  if (!author && req.user.role !== UserRolesEnum.ADMIN) {
    throw new ApiError(
      404,
      "Your Author account doesn't exist. Please create an Author account first.",
    );
  }

  if (
    req.user.role === UserRolesEnum.AUTHOR &&
    book.authorId.toString() !== author._id.toString()
  ) {
    throw new ApiError(403, "Unauthorized action");
  }

  await Book.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, true, "Book deleted successfully"));
});

const uploadBookCoverImage = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid Book Id");
  }

  const book = await Book.findById(id);

  if (!book) {
    throw new ApiError(404, "Book doesn't exist");
  }

  const author = await Author.findOne({ userId: req.user._id.toString() });

  if (!author) {
    throw new ApiError(
      404,
      "Your Author account doesn't exist. Please create an Author account first.",
    );
  }

  if (
    req.user.role === UserRolesEnum.AUTHOR &&
    book.authorId.toString() !== author._id.toString()
  ) {
    throw new ApiError(403, "Unauthorized action");
  }

  if (!req.file || !req.file.path) {
    throw new ApiError(400, "Book Cover Image is required !!");
  }

  const coverPath = req.file?.path || "";
  const coverImage = await uploadFile(coverPath);

  const updatedBook = await Book.findOneAndUpdate(
    { _id: id, authorId: author._id },
    {
      $set: {
        coverImage: {
          public_id: coverImage.public_id,
          url: coverImage.url,
          format: coverImage.format,
          resource_type: coverImage.resource_type,
        },
      },
    },
    { new: true },
  );

  const { old_cover_image_public_id } = req.body;
  if (old_cover_image_public_id)
    await deleteFile(old_cover_image_public_id, coverImage.resource_type);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        true,
        "Book Cover Image updated successfully",
        updatedBook,
      ),
    );
});

export {
  addNewBook,
  getAllBooks,
  getBookById,
  updateBookById,
  deleteBookById,
  uploadBookCoverImage,
};
