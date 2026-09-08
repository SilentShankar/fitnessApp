const express = require("express");
const router = express.Router();
const Workout = require("../models/Plan");

// ✅ Get all workouts
router.get("/", async (req, res) => {
  try {
    const workouts = await Workout.find();
    res.json(workouts);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching workouts" });
  }
});

// ✅ Add new workout
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ msg: "Workout name required" });
    }

    const existing = await Workout.findOne({ name });
    if (existing) {
      return res.status(400).json({ msg: "Workout already exists" });
    }

    const workout = new Workout({ name });
    await workout.save();

    res.json(workout);

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error adding workout" }); // 🔥 FIX
  }
});

module.exports = router;