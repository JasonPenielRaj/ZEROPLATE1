import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    donorName: { type: String, required: true },
    contactPerson: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    foodType: { type: String, required: true },
    foodDescription: { type: String, required: true },
    quantity: { type: Number, required: true },
    quantityUnit: { type: String, default: "portions" },
    packaging: { type: String, default: "" },
    expiryDateTime: { type: Date, required: true },
    foodNotes: { type: String, default: "" },
    pickupAddress: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    pickupDateTime: { type: Date, required: true },
    pickupInstructions: { type: String, default: "" },
    donationPreference: { type: String, default: "Any NGO" },
    photo: { type: String, default: "" }, // Base64 encoded image or URL
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Donation", donationSchema);
