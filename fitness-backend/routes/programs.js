const express = require("express");
const Program = require("../models/Program");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ msg: "Access denied" });
  }

  try {
    const programs = await Program.find({ createdBy: req.user.id })
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });
    res.json(programs);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching programs" });
  }
});

router.get("/mine", auth, async (req, res) => {
  if (req.user.role !== "client") {
    return res.status(403).json({ msg: "Client access only" });
  }

  try {
    const programs = await Program.find({ assignedTo: req.user.id })
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });
    res.json(programs);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching client programs" });
  }
});

router.post("/", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ msg: "Access denied" });
  }

  try {
    const { name, description, assignedTo, exercises } = req.body;
    const client = await User.findOne({ _id: assignedTo, role: "client" });

    if (!client) {
      return res.status(404).json({ msg: "Client not found" });
    }

    if (!name?.trim() || !Array.isArray(exercises) || exercises.length === 0) {
      return res.status(400).json({ msg: "Program name and at least one exercise are required" });
    }

    const program = await Program.create({
      name: name.trim(),
      description: description?.trim() || "",
      assignedTo: client._id,
      createdBy: req.user.id,
      exercises,
    });

    res.status(201).json(await program.populate("assignedTo", "name email"));
  } catch (err) {
    res.status(500).json({ msg: "Error creating program" });
  }
});

router.put("/:id/exercise/:exerciseId", auth, async (req, res) => {
  if (req.user.role !== "client") {
    return res.status(403).json({ msg: "Client access only" });
  }

  try {
    const program = await Program.findOne({
      _id: req.params.id,
      assignedTo: req.user.id,
    });

    if (!program) {
      return res.status(404).json({ msg: "Program not found" });
    }

    const exercise = program.exercises.id(req.params.exerciseId);
    if (!exercise) {
      return res.status(404).json({ msg: "Exercise not found" });
    }

    exercise.done = !exercise.done;
    await program.save();
    res.json(program);
  } catch (err) {
    res.status(500).json({ msg: "Error updating program exercise" });
  }
});

module.exports = router;
