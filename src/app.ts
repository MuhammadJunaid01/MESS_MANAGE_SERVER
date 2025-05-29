import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost/mess_management")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Middleware for Authentication

// Middleware for Role-Based Access

// Routes
// User Registration

// Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
