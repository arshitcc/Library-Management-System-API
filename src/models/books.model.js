import mongoose from "mongoose";

export const BookLanguagesEnum = {
  ENGLISH: "english",
  HINDI: "hindi",
  SPANISH: "spanish",
  PORTUGUESE: "portuguese",
  FRENCH: "french",
  GERMAN: "german",
  CHINESE: "chinese",
  JAPANESE: "japanese",
  RUSSIAN: "russian",
  KOREAN: "korean",
};

export const AvailableBookLanguages = Object.values(BookLanguagesEnum);

const BookSchema = new mongoose.Schema(
  {
    isbn: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Author",
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    categories: {
      type: [String],
      required: true,
    },
    edition: {
      type: String,
      required: true,
    },
    coverImage: {
      type: {
        url: String,
        format: String,
        resource_type: String,
        public_id: String,
      },
    },
    price: {
      type: Number,
      required: true,
    },
    availableStock: {
      type: Number,
      required: true,
    },
    publishedDate: {
      type: Date,
      required: true,
    },
    pages: {
      type: Number,
      required: true,
    },
    availableInLanguages: {
      type: [String],
      enum: AvailableBookLanguages,
      default: [BookLanguagesEnum.ENGLISH],
    },
  },
  { timestamps: true },
);

export const Book = mongoose.model("Book", BookSchema);
