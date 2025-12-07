import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * ADD FAMILY MEMBER (Admin only)
 * POST /api/members
 */
router.post("/", protect, requireRole(["admin"]), async (req, res) => {
  try {
    const { name, email, password, role, permissions } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const member = await User.create({
      name,
      email,
      password: hashed,
      role,
      familyId: req.user.familyId, // assign to same family
      permissions
    });

    res.json(member);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * GET ALL MEMBERS OF FAMILY
 * GET /api/members
 */
router.get("/", protect, async (req, res) => {
  try {
    const members = await User.find({ familyId: req.user.familyId }).select("-password");
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * UPDATE PERMISSIONS OF A MEMBER (Admin only)
 * PUT /api/members/:id/permissions
 */
router.put("/:id/permissions", protect, requireRole(["admin"]), async (req, res) => {
  try {
    const member = await User.findById(req.params.id);

    if (!member) return res.status(404).json({ message: "Member not found" });

    // Merge permissions
    member.permissions = { ...member.permissions, ...req.body.permissions };

    await member.save();

    res.json(member);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * UPDATE MEMBER DETAILS (Admin only)
 * PUT /api/members/:id
 */
router.put("/:id", protect, requireRole(["admin"]), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const member = await User.findById(req.params.id);
    if (!member) return res.status(404).json({ message: "Member not found" });

    // Update basic fields
    member.name = name || member.name;
    member.email = email || member.email;
    member.role = role || member.role;

    // If changing password
    if (password && password.trim() !== "") {
      const hashed = await bcrypt.hash(password, 10);
      member.password = hashed;
    }

    await member.save();

    res.json({ message: "Member updated", member });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


/**
 * DELETE MEMBER (Admin only)
 * DELETE /api/members/:id
 */
router.delete("/:id", protect, requireRole(["admin"]), async (req, res) => {
  try {
    const member = await User.findById(req.params.id);
    if (!member) return res.status(404).json({ message: "Member not found" });

    await member.deleteOne();

    res.json({ message: "Member deleted" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
