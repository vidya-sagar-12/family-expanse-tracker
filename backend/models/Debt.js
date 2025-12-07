import mongoose from "mongoose";

const repaymentSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  amount: Number,
  note: String
});

const debtSchema = new mongoose.Schema(
  {
    familyId: { type: mongoose.Schema.Types.ObjectId, ref: "Family", required: true },

    from: { type: String, required: true },    // Example: "Papa" or "Bank" etc.
    to: { type: String, required: true },      // Example: "Rahul" or "Friend"
    amount: { type: Number, required: true },
    purpose: { type: String },

    dueDate: { type: Date },

    repaid: { type: Boolean, default: false },

    ledger: [repaymentSchema],    // List of partial repayments

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

// Improve sorting by due date
debtSchema.index({ familyId: 1, dueDate: 1 });

export default mongoose.model("Debt", debtSchema);
