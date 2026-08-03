import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import donationRoutes from "./routes/donations.js";
import foodRequestRoutes from "./routes/foodRequests.js";
import trustedNgoRoutes from "./routes/trustedNgos.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/donations", donationRoutes);
app.use("/api/food-requests", foodRequestRoutes);
app.use("/api/trusted-ngos", trustedNgoRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "ZeroPlate API is running" });
});

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/zeroplate";

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  });

export default app;
