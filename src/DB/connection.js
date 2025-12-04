import mongoose from "mongoose";

export async function Database_connect() {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/mydb";

  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("Database connection failed:", err.message);
  }
}
