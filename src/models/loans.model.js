import mongoose from "mongoose";

export const LoanStatusEnum = {
  PENDING: "pending",
  RETURNED: "returned",
  LATE: "late",
};

const LoanSchema = new mongoose.Schema(
  {
    borrowerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bookIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
        required: true,
      },
    ],
    loanDate: {
      type: Date,
      required: true,
    },
    expectedReturnDate: {
      type: Date,
      required: true,
    },
    returnDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: Object.values(LoanStatusEnum),
      default: LoanStatusEnum.PENDING,
    },
  },
  { timestamps: true },
);

export const Loan = mongoose.model("Loan", LoanSchema);
