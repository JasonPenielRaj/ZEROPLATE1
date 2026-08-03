import mongoose from "mongoose";

const trustedNgoSchema = new mongoose.Schema(
  {
    ngoName: { type: String, required: true },
    contactPerson: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    registrationNo: { type: String, default: "" },
    website: { type: String, default: "" },
    foodType: { type: String, required: true },
    quantity: { type: Number, required: true },
    quantityUnit: { type: String, default: "portions" },
    beneficiaries: { type: Number, required: true },
    deliveryDateTime: { type: Date, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    urgency: { type: String, default: "Normal", enum: ["Normal", "High", "Critical"] },
    purpose: { type: String, default: "" },
    dietaryRequirements: { type: String, default: "" },
    notes: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("TrustedNGO", trustedNgoSchema);
