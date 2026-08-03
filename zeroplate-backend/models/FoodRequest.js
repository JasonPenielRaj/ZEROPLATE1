import mongoose from "mongoose";

const foodRequestSchema = new mongoose.Schema(
  {
    foodId: { type: mongoose.Schema.Types.ObjectId, ref: "Donation", required: true },
    foodDescription: { type: String, required: true },
    donorName: { type: String, required: true },
    donorEmail: { type: String, required: true },
    donorPhone: { type: String, required: true },
    ngoName: { type: String, required: true },
    contactPerson: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    message: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("FoodRequest", foodRequestSchema);
