import express from "express";
import FoodRequest from "../models/FoodRequest.js";

const router = express.Router();

// Get all food requests
router.get("/", async (req, res) => {
  try {
    const { foodId } = req.query;
    let query = {};
    if (foodId) {
      query.foodId = foodId;
    }
    const requests = await FoodRequest.find(query).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single food request
router.get("/:id", async (req, res) => {
  try {
    const request = await FoodRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: "Food request not found" });
    }
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create food request
router.post("/", async (req, res) => {
  try {
    const foodRequest = new FoodRequest(req.body);
    await foodRequest.save();
    res.status(201).json(foodRequest);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update food request
router.put("/:id", async (req, res) => {
  try {
    const foodRequest = await FoodRequest.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!foodRequest) {
      return res.status(404).json({ error: "Food request not found" });
    }
    res.json(foodRequest);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete food request
router.delete("/:id", async (req, res) => {
  try {
    const foodRequest = await FoodRequest.findByIdAndDelete(req.params.id);
    if (!foodRequest) {
      return res.status(404).json({ error: "Food request not found" });
    }
    res.json({ message: "Food request deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
