import mongoose from "mongoose";

export const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri || typeof uri !== "string") {
    console.error(
      "Mongo error: MONGO_URI is missing. Copy server/.env.example to server/.env and set MONGO_URI (e.g. mongodb://127.0.0.1:27017/bizflow)."
    );
    process.exit(1);
  }
  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected");
  } catch (e) {
    console.error("Mongo error", e.message);
    process.exit(1);
  }
};
