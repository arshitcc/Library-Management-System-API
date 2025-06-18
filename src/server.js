import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";

dotenv.config({
  path: "./.env",
});

const PORT = process.env.PORT || 6969;

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.route("/").get((req, res) => {
  res.status(200).json({
    status: 200,
    success: true,
    message: "Welcome to Library Management System API!!",
  });
});


import healthCheckRouter from "./routes/healthchecks.route.js";
import userRouter from "./routes/users.route.js";


app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/auth", userRouter);

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.info("⚙️  Server is running on PORT: " + PORT);
    });
  })
  .catch((error) => {
    console.error("MongoDB Connection Error: ", error);
  });
