import express from "express";
import Donation from "../models/Donation.js";

const router = express.Router();

// Get all donations (filter expired)
router.get("/", async (req, res) => {
  try {
    const { includeExpired } = req.query;
    let query = {};
    
    if (includeExpired !== "true") {
      query.expiryDateTime = { $gte: new Date() };
    }
    
    const donations = await Donation.find(query).sort({ createdAt: -1 });
    res.json(donations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single donation
router.get("/:id", async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ error: "Donation not found" });
    }
    res.json(donation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create donation
router.post("/", async (req, res) => {
  try {
    const donation = new Donation(req.body);
    await donation.save();
    res.status(201).json(donation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update donation
router.put("/:id", async (req, res) => {
  try {
    const donation = await Donation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!donation) {
      return res.status(404).json({ error: "Donation not found" });
    }
    res.json(donation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete donation
router.delete("/:id", async (req, res) => {
  try {
    const donation = await Donation.findByIdAndDelete(req.params.id);
    if (!donation) {
      return res.status(404).json({ error: "Donation not found" });
    }
    res.json({ message: "Donation deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
