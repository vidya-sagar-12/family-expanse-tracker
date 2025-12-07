import mongoose from "mongoose";

const savingSchema = new mongoose.Schema(
  {
    familyId: { type: mongoose.Schema.Types.ObjectId, ref: "Family", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    note: String,
    date: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model("Saving", savingSchema);
