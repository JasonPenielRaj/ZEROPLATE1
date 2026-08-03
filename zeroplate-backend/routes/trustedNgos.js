import express from "express";
import TrustedNGO from "../models/TrustedNGO.js";

const router = express.Router();

// Get all trusted NGOs
router.get("/", async (req, res) => {
  try {
    const ngos = await TrustedNGO.find().sort({ createdAt: -1 });
    res.json(ngos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single trusted NGO
router.get("/:id", async (req, res) => {
  try {
    const ngo = await TrustedNGO.findById(req.params.id);
    if (!ngo) {
      return res.status(404).json({ error: "Trusted NGO not found" });
    }
    res.json(ngo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create trusted NGO
router.post("/", async (req, res) => {
  try {
    const ngo = new TrustedNGO(req.body);
    await ngo.save();
    res.status(201).json(ngo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update trusted NGO
router.put("/:id", async (req, res) => {
  try {
    const ngo = await TrustedNGO.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!ngo) {
      return res.status(404).json({ error: "Trusted NGO not found" });
    }
    res.json(ngo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete trusted NGO
router.delete("/:id", async (req, res) => {
  try {
    const ngo = await TrustedNGO.findByIdAndDelete(req.params.id);
    if (!ngo) {
      return res.status(404).json({ error: "Trusted NGO not found" });
    }
    res.json({ message: "Trusted NGO deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
