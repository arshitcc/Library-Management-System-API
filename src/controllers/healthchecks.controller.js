import asyncHandler from "../utils/async-handler.js";

const checkHealth = asyncHandler((req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is running",
  });
});

export default checkHealth;
