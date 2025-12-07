import express from "express";
import Expense from "../models/Expense.js";
import Saving from "../models/Saving.js";
import Bill from "../models/Bill.js";
import Debt from "../models/Debt.js";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * GET ANALYTICS SUMMARY
 * GET /api/analytics/summary?month=YYYY-MM
 */
router.get("/summary", protect, async (req, res) => {
  try {
    if (!req.user.permissions.viewAnalytics) {
      return res.status(403).json({ message: "No permission to access analytics" });
    }

    const familyId = req.user.familyId;

    // --- If no month given, use current month ---
    const current = new Date();
    const monthString = req.query.month || `${current.getFullYear()}-${(current.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;

    let start = new Date(monthString + "-01");
    let end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    // --------------------- 1. TOTAL MONTHLY EXPENSES ---------------------
    const monthlyExpenses = await Expense.find({
      familyId,
      date: { $gte: start, $lt: end },
    });

    const totalMonthlyExpenses = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);

    // --------------------- 2. CATEGORY TOTALS ---------------------
    const categoryTotals = {};
    monthlyExpenses.forEach((e) => {
      if (!categoryTotals[e.category]) categoryTotals[e.category] = 0;
      categoryTotals[e.category] += e.amount;
    });

    // --------------------- 3. MEMBER TOTALS ---------------------
    const users = await User.find({ familyId }).select("name");
    const memberTotals = {};

    users.forEach((u) => (memberTotals[u._id] = { name: u.name, amount: 0 }));

    monthlyExpenses.forEach((e) => {
      if (memberTotals[e.createdBy]) {
        memberTotals[e.createdBy].amount += e.amount;
      }
    });

    // --------------------- 4. TREND (LAST 6 MONTHS) ---------------------
    const trend = [];

    for (let i = 5; i >= 0; i--) {
      let s = new Date();
      s.setMonth(s.getMonth() - i);
      s.setDate(1);

      let en = new Date(s);
      en.setMonth(en.getMonth() + 1);

      const exp = await Expense.find({ familyId, date: { $gte: s, $lt: en } });

      trend.push({
        month: `${s.getFullYear()}-${String(s.getMonth() + 1).padStart(2, "0")}`,
        total: exp.reduce((sum, e) => sum + e.amount, 0),
      });
    }

    // --------------------- 5. UPCOMING BILLS ---------------------
    const today = new Date();
    const next10 = new Date();
    next10.setDate(today.getDate() + 10);

    const upcomingBills = await Bill.find({
      familyId,
      dueDate: { $gte: today, $lte: next10 },
      paid: false,
    }).sort({ dueDate: 1 });

    // --------------------- 6. MONTHLY SAVINGS ---------------------
    const monthlySavings = await Saving.find({
      familyId,
      date: { $gte: start, $lt: end },
    });

    const totalMonthlySavings = monthlySavings.reduce((sum, s) => sum + s.amount, 0);

    // --------------------- 7. CORRECT PENDING DEBT ---------------------
    const debts = await Debt.find({ familyId });

    let pendingDebt = 0;

    debts.forEach((d) => {
      const paidAmount = d.ledger.reduce((sum, x) => sum + x.amount, 0);
      const remaining = d.amount - paidAmount;

      if (remaining > 0) pendingDebt += remaining;
    });

    // --------------------- 8. SEND FINAL SUMMARY ---------------------
    res.json({
      totalMonthlyExpenses,
      totalMonthlySavings,
      categoryTotals,
      memberTotals,
      trend,
      upcomingBills,
      debtSummary: { pendingDebt },
    });

  } catch (error) {
    console.error("Analytics summary error:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;

