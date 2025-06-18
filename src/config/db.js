import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URL}/${process.env.MONGODB_NAME}`,
    );
    console.info(
      `\n☘️  MongoDB Connected! Db host: ${connectionInstance.connection.host}\n`,
    );
  } catch (error) {
    console.error("MongoDB Connection Error: ", error);
    process.exit(1);
  }
};

export default connectDB;
