import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  name: String,
  price: Number
});

const expenseSchema = new mongoose.Schema(
  {
    familyId: { type: mongoose.Schema.Types.ObjectId, ref: "Family", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    note: String,
    date: { type: Date, default: Date.now },
    items: [itemSchema] // For groceries item-wise breakdown
  },
  { timestamps: true }
);

// Improve query performance
expenseSchema.index({ familyId: 1, date: -1 });

export default mongoose.model("Expense", expenseSchema);
