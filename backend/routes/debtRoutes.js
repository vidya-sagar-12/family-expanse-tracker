import express from "express";
import Debt from "../models/Debt.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * ADD DEBT
 * POST /api/debts
 */
router.post("/", protect, async (req, res) => {
  try {
    if (!req.user.permissions.viewDebts) {
      return res.status(403).json({ message: "No permission to add debts" });
    }

    const { from, to, amount, purpose, dueDate } = req.body;

    const debt = await Debt.create({
      familyId: req.user.familyId,
      createdBy: req.user._id,
      from,
      to,
      amount,
      purpose,
      dueDate
    });

    res.json(debt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


/**
 * GET ALL DEBTS
 * GET /api/debts
 */
router.get("/", protect, async (req, res) => {
  try {
    if (!req.user.permissions.viewDebts) {
      return res.status(403).json({ message: "No permission to view debts" });
    }

    const debts = await Debt.find({ familyId: req.user.familyId }).sort({ dueDate: 1 });

    res.json(debts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


/**
 * ADD PARTIAL REPAYMENT
 * PUT /api/debts/:id/repay
 */
router.put("/:id/repay", protect, async (req, res) => {
  try {
    if (!req.user.permissions.viewDebts) {
      return res.status(403).json({ message: "No permission" });
    }

    const debt = await Debt.findById(req.params.id);
    if (!debt) return res.status(404).json({ message: "Debt not found" });

    const { amount, note } = req.body;

    debt.ledger.push({ amount, note });

    await debt.save();

    res.json(debt);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


/**
 * MARK DEBT AS REPAID
 * PUT /api/debts/:id/mark-repaid
 */
router.put("/:id/mark-repaid", protect, async (req, res) => {
  try {
    if (!req.user.permissions.viewDebts) {
      return res.status(403).json({ message: "No permission" });
    }

    const debt = await Debt.findById(req.params.id);
    if (!debt) return res.status(404).json({ message: "Debt not found" });

    debt.repaid = true;

    await debt.save();

    res.json(debt);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


/**
 * DELETE DEBT
 * DELETE /api/debts/:id
 */
router.delete("/:id", protect, async (req, res) => {
  try {
    if (!req.user.permissions.viewDebts) {
      return res.status(403).json({ message: "No permission" });
    }

    const debt = await Debt.findById(req.params.id);
    if (!debt) return res.status(404).json({ message: "Debt not found" });

    await debt.deleteOne();

    res.json({ message: "Debt deleted" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
