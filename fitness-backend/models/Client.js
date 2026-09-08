const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  title: String,
  date: String,
  time: String,
  type: String,
  status: {
    type: String,
    enum: ["Confirmed", "Pending", "Booked", "Completed", "Cancelled"],
    default: "Booked",
  },
  meetingLink: String,
}, { _id: true });

const clientSchema = new mongoose.Schema({
  name: String,

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  workouts: [
    {
      name: String,
      done: { type: Boolean, default: false },
    },
  ],

  sessions: [sessionSchema],

  notes: [
    {
      text: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],

  messages: [
    {
      sender: {
        type: String,
        enum: ["trainer", "client"],
        default: "trainer",
      },
      text: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],

  checkIns: [
    {
      energy: Number,
      sleep: Number,
      mood: String,
      note: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("Client", clientSchema);