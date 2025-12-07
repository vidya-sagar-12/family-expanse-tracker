import express from "express";
import Saving from "../models/Saving.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin + Member = full access
const hasFullAccess = (user) =>
  user.role === "admin" || user.role === "member";

/* ----------------------------------------------------
   ADD SAVING
---------------------------------------------------- */
router.post("/", protect, async (req, res) => {
  try {
    const user = req.user;

    // Child permission logic
    if (!hasFullAccess(user) && !user.permissions.addSavings) {
      return res.status(403).json({ message: "No permission to add savings" });
    }

    const newSaving = await Saving.create({
      familyId: user.familyId,
      userId: user._id,
      createdBy: user._id,
      amount: req.body.amount,
      date: req.body.date,
      note: req.body.note || "",
    });

    res.json(newSaving);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ----------------------------------------------------
   GET SAVINGS
---------------------------------------------------- */
router.get("/", protect, async (req, res) => {
  try {
    const user = req.user;

    if (hasFullAccess(user)) {
      const all = await Saving.find({ familyId: user.familyId }).sort({ date: -1 });
      return res.json(all);
    }

    if (!user.permissions.viewSavings) {
      const own = await Saving.find({ userId: user._id }).sort({ date: -1 });
      return res.json(own);
    }

    const family = await Saving.find({ familyId: user.familyId }).sort({ date: -1 });
    res.json(family);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ----------------------------------------------------
   UPDATE SAVING
---------------------------------------------------- */
router.put("/:id", protect, async (req, res) => {
  try {
    const user = req.user;
    const saving = await Saving.findById(req.params.id);

    if (!saving) return res.status(404).json({ message: "Saving not found" });

    if (!hasFullAccess(user)) {
      if (!user.permissions.editSavings || !saving.userId.equals(user._id)) {
        return res.status(403).json({ message: "No permission to edit this saving" });
      }
    }

    saving.amount = req.body.amount ?? saving.amount;
    saving.date = req.body.date ?? saving.date;
    saving.note = req.body.note ?? saving.note;

    await saving.save();
    res.json(saving);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ----------------------------------------------------
   DELETE SAVING
---------------------------------------------------- */
router.delete("/:id", protect, async (req, res) => {
  try {
    const user = req.user;
    const saving = await Saving.findById(req.params.id);

    if (!saving) return res.status(404).json({ message: "Saving not found" });

    if (!hasFullAccess(user)) {
      if (!user.permissions.deleteSavings || !saving.userId.equals(user._id)) {
        return res.status(403).json({ message: "No permission to delete this saving" });
      }
    }

    await saving.deleteOne();
    res.json({ message: "Saving deleted" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
