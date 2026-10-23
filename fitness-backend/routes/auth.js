const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");
const adminOnly = require("../middleware/admin");
const jwtSecret = process.env.JWT_SECRET || "forgefit-default-dev-secret-key-change-in-production";

const router = express.Router();

// ================= SIGNUP =================
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashed,
      role: role || "client",
    });

    await user.save();

    if (user.role === "client") {
      const Client = require("../models/Client");
      await Client.create({
        name: user.name,
        email: user.email,
        userId: user._id,
        workouts: [
          { name: "Warm-up activation & mobility", done: false },
          { name: "Full-body foundation circuit", done: false },
          { name: "Post-session cooldown & stretch", done: false },
        ],
        notes: [
          { text: "Welcome to ForgeFit! Your training journey begins today." },
        ],
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      jwtSecret,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
      },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ================= LOGIN =================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      jwtSecret,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
      },
    });

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ GET USERS FOR DROPDOWN (Admin only)
router.get("/users", auth, adminOnly, async (req, res) => {
  try {
    const users = await User.find({}, "name email role");
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching users" });
  }
});

module.exports = router;