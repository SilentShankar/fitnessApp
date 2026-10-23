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
  email: String,
  goal: {
    type: String,
    default: "Peak Performance & Hypertrophy",
  },

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

  nutritionTargets: {
    calories: { type: Number, default: 2400 },
    protein: { type: Number, default: 180 },
    carbs: { type: Number, default: 250 },
    fats: { type: Number, default: 70 },
    water: { type: Number, default: 3500 },
    steps: { type: Number, default: 10000 },
  },

  nutritionLogs: [
    {
      date: { type: String, default: () => new Date().toISOString().slice(0, 10) },
      calories: { type: Number, default: 0 },
      protein: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
      fats: { type: Number, default: 0 },
      water: { type: Number, default: 0 },
      steps: { type: Number, default: 0 },
      notes: { type: String, default: "" },
      createdAt: { type: Date, default: Date.now },
    },
  ],

  bodyMetrics: [
    {
      date: { type: String, default: () => new Date().toISOString().slice(0, 10) },
      weight: { type: Number, required: true },
      bodyFat: { type: Number, default: null },
      waist: { type: Number, default: null },
      chest: { type: Number, default: null },
      notes: { type: String, default: "" },
      createdAt: { type: Date, default: Date.now },
    },
  ],

  unitSystem: {
    type: String,
    enum: ["metric", "imperial"],
    default: "metric",
  },
}, { timestamps: true });

module.exports = mongoose.model("Client", clientSchema);