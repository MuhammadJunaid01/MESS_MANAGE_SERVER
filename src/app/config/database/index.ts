import mongoose from "mongoose";
import config from "../index";

const connectDB = async () => {
  try {
    const dbUri = config.databaseUrl;
    if (!dbUri) {
      throw new Error("Database URL is not defined.");
    }

    // Connect to MongoDB with a timeout
    await mongoose.connect(dbUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("MongoDB Connected...");
  } catch (error: any) {
    console.error(`Error: ${error?.message}`);
    process.exit(1);
  }
};

export default connectDB;
