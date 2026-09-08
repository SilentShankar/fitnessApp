const mongoose = require("mongoose");

const workoutSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true } // optional but useful
);

module.exports = mongoose.model("Workout", workoutSchema);