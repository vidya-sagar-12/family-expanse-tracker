import express from "express";
import Bill from "../models/Bill.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * ADD BILL
 * POST /api/bills
 */
router.post("/", protect, async (req, res) => {
  try {
    // Only admin OR members with permission
    if (!req.user.permissions.viewBills) {
      return res.status(403).json({ message: "No permission to add bills" });
    }

    const { title, category, amount, items, dueDate } = req.body;

    const bill = await Bill.create({
      familyId: req.user.familyId,
      createdBy: req.user._id,
      title,
      category,
      amount,
      items,
      dueDate
    });

    res.json(bill);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


/**
 * GET ALL BILLS
 * GET /api/bills
 */
router.get("/", protect, async (req, res) => {
  try {
    if (!req.user.permissions.viewBills) {
      return res.status(403).json({ message: "No permission to view bills" });
    }

    const bills = await Bill.find({ familyId: req.user.familyId }).sort({ dueDate: 1 });

    res.json(bills);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


/**
 * MARK BILL AS PAID
 * PUT /api/bills/:id/pay
 */
router.put("/:id/pay", protect, async (req, res) => {
  try {
    if (!req.user.permissions.viewBills) {
      return res.status(403).json({ message: "No permission" });
    }

    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: "Bill not found" });

    bill.paid = true;
    bill.paidOn = new Date();

    await bill.save();

    res.json(bill);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


/**
 * DELETE BILL
 * DELETE /api/bills/:id
 */
router.delete("/:id", protect, async (req, res) => {
  try {
    if (!req.user.permissions.viewBills) {
      return res.status(403).json({ message: "No permission" });
    }

    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: "Bill not found" });

    await bill.deleteOne();

    res.json({ message: "Bill deleted" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
