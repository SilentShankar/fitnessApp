const mongoose = require("mongoose");

const programSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true, default: "" },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  exercises: [
    {
      name: { type: String, required: true, trim: true },
      sets: { type: Number, default: 3 },
      reps: { type: String, default: "10" },
      rest: { type: String, default: "60 sec" },
      notes: { type: String, default: "" },
      done: { type: Boolean, default: false },
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("Program", programSchema);
