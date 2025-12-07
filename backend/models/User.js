// models/User.js
import mongoose from 'mongoose';

const permissionSchema = new mongoose.Schema({
  viewExpenses: { type: Boolean, default: false },
  addExpenses: { type: Boolean, default: false },
  editExpenses: { type: Boolean, default: false },
  deleteExpenses: { type: Boolean, default: false },
  viewSavings: { type: Boolean, default: false },
  addSavings: { type: Boolean, default: false },
  viewBills: { type: Boolean, default: false },
  viewDebts: { type: Boolean, default: false },
  viewAnalytics: { type: Boolean, default: false }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin','parent','child'], default: 'child' },
  familyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Family' },
  permissions: { type: permissionSchema, default: () => ({}) }
}, { timestamps: true });

export default mongoose.model('User', userSchema);