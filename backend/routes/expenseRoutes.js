import express from "express";
import Expense from "../models/Expense.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Helper: Admin + Member = full access
const hasFullAccess = (user) =>
  user.role === "admin" || user.role === "member";

/* ----------------------------------------------------
   ADD EXPENSE
---------------------------------------------------- */
router.post("/", protect, async (req, res) => {
  try {
    const user = req.user;

    // If not admin/member → permission-based child
    if (!hasFullAccess(user) && !user.permissions.addExpenses) {
      return res.status(403).json({ message: "No permission to add expenses" });
    }

    const newExpense = await Expense.create({
      familyId: user.familyId,
      userId: user._id,
      createdBy: user._id,
      amount: req.body.amount,
      category: req.body.category,
      date: req.body.date,
      note: req.body.note || "",
    });

    res.json(newExpense);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ----------------------------------------------------
   GET EXPENSES (FAMILY OR OWN)
---------------------------------------------------- */
router.get("/", protect, async (req, res) => {
  try {
    const user = req.user;

    // Admin & member → full family view
    if (hasFullAccess(user)) {
      const all = await Expense.find({ familyId: user.familyId }).sort({ date: -1 });
      return res.json(all);
    }

    // Child with NO permission → only own expenses
    if (!user.permissions.viewExpenses) {
      const own = await Expense.find({ userId: user._id }).sort({ date: -1 });
      return res.json(own);
    }

    // Child WITH permission → family view
    const family = await Expense.find({ familyId: user.familyId }).sort({ date: -1 });
    res.json(family);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ----------------------------------------------------
   UPDATE EXPENSE
---------------------------------------------------- */
router.put("/:id", protect, async (req, res) => {
  try {
    const user = req.user;
    const expense = await Expense.findById(req.params.id);

    if (!expense) return res.status(404).json({ message: "Expense not found" });

    // Admin & members fully allowed
    if (!hasFullAccess(user)) {

      // Child: must have edit permission AND must own the expense
      if (!user.permissions.editExpenses || !expense.userId.equals(user._id)) {
        return res.status(403).json({ message: "No permission to edit this expense" });
      }
    }

    expense.amount = req.body.amount ?? expense.amount;
    expense.category = req.body.category ?? expense.category;
    expense.date = req.body.date ?? expense.date;
    expense.note = req.body.note ?? expense.note;

    await expense.save();
    res.json(expense);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ----------------------------------------------------
   DELETE EXPENSE
---------------------------------------------------- */
router.delete("/:id", protect, async (req, res) => {
  try {
    const user = req.user;
    const expense = await Expense.findById(req.params.id);

    if (!expense) return res.status(404).json({ message: "Expense not found" });

    // Admin & member always allowed
    if (!hasFullAccess(user)) {

      // Child rules apply:
      if (!user.permissions.deleteExpenses || !expense.userId.equals(user._id)) {
        return res.status(403).json({ message: "No permission to delete this expense" });
      }
    }

    await expense.deleteOne();
    res.json({ message: "Expense deleted" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
