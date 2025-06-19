import mongoose from "mongoose";

const AuthorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
    },
    nationality: {
      type: String,
    },
    profilePicture: {
      type: {
        url: String,
        format: String,
        resource_type: String,
        public_id: String,
      },
    },
    genres: {
      type: [String],
    },
    books: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
      },
    ],
  },
  { timestamps: true },
);

export const Author = mongoose.model("Author", AuthorSchema);
