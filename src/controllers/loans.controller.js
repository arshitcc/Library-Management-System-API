import asyncHandler from "../utils/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { Loan, LoanStatusEnum } from "../models/loans.model.js";
import { Book } from "../models/books.model.js";
import { isValidObjectId } from "mongoose";

const getAllLoans = asyncHandler(async (req, res) => {
  let pageNum = parseInt(req.query.page, 10);
  if (isNaN(pageNum) || pageNum < 1) {
    pageNum = 1;
  }

  const limit = 2;
  const skip = (pageNum - 1) * limit;

  const { status } = req.query;
  const validStatuses = Object.values(LoanStatusEnum);

  const matchStage = {};
  if (typeof status === "string" && validStatuses.includes(status)) {
    matchStage.status = status;
  }

  const loans = await Loan.aggregate([
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
    .json(new ApiResponse(200, true, "Loans Fetched Successfully", loans));
});

const createNewLoan = asyncHandler(async (req, res) => {
  const isPendingLoan = await Loan.findOne({
    borrowerId: req.user._id,
    status: LoanStatusEnum.PENDING,
  });

  if (isPendingLoan) {
    throw new ApiError(400, "You already have a pending loan");
  }

  const { bookIds } = req.body;

  for (const bookId of bookIds) {
    const isBookExisting = await Book.findById(bookId);

    if (!isBookExisting) {
      throw new ApiError(404, "Book doesn't exist");
    }
  }

  const loan = await Loan.create({
    borrowerId: req.user._id,
    bookIds,
    loanDate: Date.now(),
    expectedReturnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  if (!loan) {
    throw new ApiError(500, "Error creating loan");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, true, "Loan Created Successfully", loan));
});

const updateLoanById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid Loan Id");
  }

  const loan = await Loan.findOne({ _id: id });

  if (!loan) {
    throw new ApiError(404, "Loan doesn't exist");
  }

  if (loan.status !== LoanStatusEnum.PENDING) {
    throw new ApiError(400, "Loan is already cleared");
  }

  let status = "returned";

  if (loan.expectedReturnDate < Date.now()) {
    status = "late";
  }

  const updatedLoan = await Loan.findOneAndUpdate(
    { _id: id },
    { $set: { status } },
    { new: true },
  );

  if (!updatedLoan) {
    throw new ApiError(500, "Error updating loan");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, true, "Loan Updated Successfully", updatedLoan));
});

const deleteLoanById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid Loan Id");
  }

  const loan = await Loan.findOne({ _id: id });

  if (!loan) {
    throw new ApiError(404, "Loan doesn't exist");
  }

  const updatedLoan = await Loan.findByIdAndUpdate(
    id,
    { $set: { status: LoanStatusEnum.RETURNED } },
    { new: true },
  );

  return res
    .status(200)
    .json(new ApiResponse(200, true, "Loan Deleted Successfully", updatedLoan));
});

export { getAllLoans, createNewLoan, updateLoanById, deleteLoanById };
