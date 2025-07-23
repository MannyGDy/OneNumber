import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// MongoDB connection options
const options = {

  autoIndex: process.env.NODE_ENV !== "production", // Disable autoIndex in production for performance
};

// Connect to MongoDB
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process?.env?.MONGO_URI || "", options);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Handle MongoDB connection errors after initial connection
    mongoose.connection.on("error", (err) => {
      console.log(`MongoDB connection error: ${err}`);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected, attempting to reconnect...");
      setTimeout(exports.connectDB, 5000); // Try to reconnect after 5 seconds
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("MongoDB connection closed due to app termination");
      process.exit(0);
    });
  } catch (error: any) {
    console.log(`MongoDB connection error: ${error.message}`);
    process.exit(1); // Exit with failure
  }
};
