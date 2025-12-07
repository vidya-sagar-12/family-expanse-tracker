import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  name: String,
  price: Number
});

const billSchema = new mongoose.Schema(
  {
    familyId: { type: mongoose.Schema.Types.ObjectId, ref: "Family", required: true },
    title: { type: String },
    category: { type: String, required: true }, // Electricity, WiFi, Groceries, Recharge, etc.
    amount: { type: Number, required: true },

    // For groceries breakdown
    items: [itemSchema],

    dueDate: { type: Date },
    paid: { type: Boolean, default: false },
    paidOn: { type: Date },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

// Index for faster bill loading
billSchema.index({ familyId: 1, dueDate: 1 });

export default mongoose.model("Bill", billSchema);
