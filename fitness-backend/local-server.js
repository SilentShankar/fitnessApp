const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { MongoMemoryServer } = require("mongodb-memory-server");
const User = require("./models/User");
const Client = require("./models/Client");
const Workout = require("./models/Plan");
const Program = require("./models/Program");

const app = express();
const port = process.env.PORT || 5000;
const isPlaceholderUri = (uri) => !uri || uri.includes("your_mongodb_connection_string") || uri.includes("<username>");
const isDemoMode = isPlaceholderUri(process.env.MONGO_URI);

app.use(cors());
app.use(express.json());

// ✅ Health check & root endpoints
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    mode: isDemoMode ? "demo" : "persistent",
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "ForgeFit Performance API",
    mode: isDemoMode ? "demo" : "persistent",
  });
});

// ✅ Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/clients", require("./routes/clients"));
app.use("/api/workouts", require("./routes/workouts"));
app.use("/api/programs", require("./routes/programs"));
app.use("/auth", require("./routes/auth"));
app.use("/clients", require("./routes/clients"));
app.use("/workouts", require("./routes/workouts"));
app.use("/programs", require("./routes/programs"));

const seedDemoUsers = async () => {
  const demoUsers = [
    {
      name: "ForgeFit Admin",
      email: "admin@forgefit.com",
      password: "admin123",
      role: "admin",
    },
    {
      name: "Demo Client",
      email: "client@forgefit.com",
      password: "client123",
      role: "client",
    },
    {
      name: "Ava Martinez",
      email: "ava@forgefit.com",
      password: "demo123",
      role: "client",
    },
    {
      name: "Leo Carter",
      email: "leo@forgefit.com",
      password: "demo123",
      role: "client",
    },
    {
      name: "Nina Brooks",
      email: "nina@forgefit.com",
      password: "demo123",
      role: "client",
    },
  ];

  for (const userData of demoUsers) {
    const existing = await User.findOne({ email: userData.email });

    if (!existing) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      await User.create({
        ...userData,
        password: hashedPassword,
      });
    }
  }

  console.log("Demo accounts ready ✅");
};

const seedDemoWorkouts = async () => {
  const workoutTemplates = [
    "Barbell Back Squat",
    "Romanian Deadlift",
    "Incline Dumbbell Bench Press",
    "Weighted Pull-ups",
    "Standing Overhead Press",
    "Bulgarian Split Squats",
    "Hanging Knee Raises",
    "Cable Lateral Raises",
    "Barbell Hip Thrust",
    "Dumbbell Walking Lunges",
    "Face Pulls",
    "Farmer's Walk",
  ];

  for (const name of workoutTemplates) {
    const existing = await Workout.findOne({ name });
    if (!existing) {
      await Workout.create({ name });
    }
  }
  console.log("Workout template library ready ✅");
};

const seedDemoClients = async () => {
  const clientAssignments = [
    {
      name: "Demo Client",
      goal: "Hypertrophy & Athletic Conditioning",
      workouts: [
        { name: "Warm-up activation", done: true },
        { name: "Lower body strength", done: false },
        { name: "Mobility flow", done: false },
        { name: "Post-session recovery", done: false },
      ],
      sessions: [
        {
          title: "1:1 coaching session",
          date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
          time: "18:30",
          type: "Strength",
          status: "Confirmed",
          meetingLink: "https://zoom.us/j/demo-client",
        },
      ],
      notes: [
        { text: "Great consistency this week. Keep the recovery work consistent." },
        { text: "Focus on chest elevation during deep squat reps." },
      ],
      checkIns: [
        { energy: 7, sleep: 7.5, mood: "Good", note: "Sleep was solid, ready for volume.", createdAt: new Date(Date.now() - 4 * 86400000) },
        { energy: 8, sleep: 8.0, mood: "Strong", note: "Upper body feeling recovered, pushed extra reps on bench.", createdAt: new Date(Date.now() - 3 * 86400000) },
        { energy: 7, sleep: 7.0, mood: "Okay", note: "Slight hamstring tightness, spending time on foam roller.", createdAt: new Date(Date.now() - 2 * 86400000) },
        { energy: 8, sleep: 7.5, mood: "Good", note: "Hydration on point, conditioning felt smooth.", createdAt: new Date(Date.now() - 1 * 86400000) },
        { energy: 9, sleep: 8.5, mood: "Strong", note: "Feeling primed for training today. Ready to push heavy sets.", createdAt: new Date() },
      ],
      messages: [
        { sender: "trainer", text: "Welcome to ForgeFit, Demo Client! I've assigned your initial strength and hypertrophy block. Take a look and let me know if you have any questions.", createdAt: new Date(Date.now() - 3 * 86400000) },
        { sender: "client", text: "Thanks Coach! Completed the bench press and pull-up sets today. Felt very solid.", createdAt: new Date(Date.now() - 2 * 86400000) },
        { sender: "trainer", text: "Outstanding consistency! Keep logging your morning recovery signals so we can calibrate your volume.", createdAt: new Date(Date.now() - 1 * 86400000) },
        { sender: "client", text: "Will do! Logged today's check-in. Energy is 9/10, ready to hit it.", createdAt: new Date(Date.now() - 3600000) },
      ],
    },
    {
      name: "Ava Martinez",
      goal: "Functional Strength & Core Power",
      workouts: [
        { name: "Upper Body Strength", done: true },
        { name: "Core Burn", done: true },
        { name: "Pull Day Circuit", done: false },
        { name: "Mobility Flow", done: false },
      ],
      sessions: [
        {
          title: "Form & Technique Analysis",
          date: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
          time: "17:00",
          type: "Technique Review",
          status: "Confirmed",
          meetingLink: "https://zoom.us/j/ava-review",
        },
      ],
      checkIns: [
        { energy: 8, sleep: 8.0, mood: "Strong", note: "Core workout completed. Feeling agile and energized.", createdAt: new Date(Date.now() - 86400000) },
      ],
      notes: [{ text: "Excellent hip hinge on pull day. Ready to increase load next week." }],
    },
    {
      name: "Leo Carter",
      goal: "Speed & Explosion",
      workouts: [
        { name: "Leg Power", done: true },
        { name: "HIIT Sprint Blocks", done: true },
        { name: "Recovery Walk", done: false },
      ],
      sessions: [
        {
          title: "Speed & Agility Check-in",
          date: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
          time: "19:00",
          type: "Conditioning",
          status: "Confirmed",
          meetingLink: "https://zoom.us/j/leo-conditioning",
        },
      ],
      checkIns: [
        { energy: 7, sleep: 7.0, mood: "Good", note: "HIIT sprint intervals felt explosive.", createdAt: new Date(Date.now() - 86400000) },
      ],
      notes: [{ text: "Maintain arm drive on sprint decelerations." }],
    },
    {
      name: "Nina Brooks",
      goal: "Posture Alignment & Core Stability",
      workouts: [
        { name: "Pilates Core", done: true },
        { name: "Low Impact Cardio", done: false },
        { name: "Posture Reset", done: false },
        { name: "Glute Activation", done: false },
      ],
      sessions: [
        {
          title: "Posture Alignment Assessment",
          date: new Date(Date.now() + 4 * 86400000).toISOString().slice(0, 10),
          time: "16:30",
          type: "Mobility",
          status: "Booked",
          meetingLink: "https://zoom.us/j/nina-posture",
        },
      ],
      checkIns: [
        { energy: 8, sleep: 7.5, mood: "Good", note: "Glute activation sequence helped lower back comfort.", createdAt: new Date(Date.now() - 86400000) },
      ],
      notes: [{ text: "Keep spine neutral during core holds." }],
      nutritionTargets: { calories: 1950, protein: 135, carbs: 200, fats: 60, water: 2800, steps: 10000 },
      nutritionLogs: [
        {
          date: new Date().toISOString().slice(0, 10),
          calories: 1420,
          protein: 105,
          carbs: 150,
          fats: 45,
          water: 2100,
          steps: 8200,
          notes: "Pilates day, feeling balanced.",
        },
      ],
      bodyMetrics: [
        {
          date: new Date(Date.now() - 14 * 86400000).toISOString().slice(0, 10),
          weight: 62.5,
          bodyFat: 22.0,
          waist: 70,
          chest: 86,
          notes: "Starting posture check",
        },
        {
          date: new Date().toISOString().slice(0, 10),
          weight: 61.2,
          bodyFat: 20.8,
          waist: 68.5,
          chest: 86.5,
          notes: "Improved spine stability & tone",
        },
      ],
    },
  ];

  // Helper date function for Demo Client seeding
  const dStr = (daysAgo) => new Date(Date.now() - daysAgo * 86400000).toISOString().slice(0, 10);

  clientAssignments[0].nutritionTargets = {
    calories: 2500,
    protein: 185,
    carbs: 260,
    fats: 75,
    water: 3500,
    steps: 10000,
  };

  clientAssignments[0].nutritionLogs = [
    { date: dStr(4), calories: 2420, protein: 180, carbs: 255, fats: 72, water: 3250, steps: 10450, notes: "Met protein goal easily." },
    { date: dStr(3), calories: 2580, protein: 192, carbs: 270, fats: 78, water: 3600, steps: 11200, notes: "Leg day, extra carb meal post-workout." },
    { date: dStr(2), calories: 2390, protein: 178, carbs: 240, fats: 74, water: 3100, steps: 9800, notes: "Clean eating, hydration on point." },
    { date: dStr(1), calories: 2490, protein: 188, carbs: 265, fats: 71, water: 3500, steps: 10600, notes: "Hit all target macros." },
    { date: dStr(0), calories: 1920, protein: 155, carbs: 195, fats: 58, water: 2750, steps: 8400, notes: "Lunch and snacks logged, dinner pending." },
  ];

  clientAssignments[0].bodyMetrics = [
    { date: dStr(28), weight: 81.2, bodyFat: 17.8, waist: 88, chest: 104, notes: "Baseline studio assessment" },
    { date: dStr(21), weight: 80.4, bodyFat: 17.2, waist: 87, chest: 104.5, notes: "Consistent calorie adherence" },
    { date: dStr(14), weight: 79.6, bodyFat: 16.5, waist: 86, chest: 105, notes: "Strength holding steady on bench" },
    { date: dStr(7),  weight: 78.9, bodyFat: 15.9, waist: 85, chest: 105.5, notes: "Visible core definition" },
    { date: dStr(0),  weight: 78.2, bodyFat: 15.3, waist: 84.5, chest: 106, notes: "Peak athletic shape" },
  ];

  clientAssignments[1].nutritionTargets = {
    calories: 2150,
    protein: 150,
    carbs: 230,
    fats: 65,
    water: 3000,
    steps: 11000,
  };
  clientAssignments[1].nutritionLogs = [
    { date: dStr(1), calories: 2100, protein: 148, carbs: 225, fats: 64, water: 3100, steps: 11500, notes: "Great energy throughout day." },
    { date: dStr(0), calories: 1580, protein: 115, carbs: 170, fats: 48, water: 2200, steps: 8900, notes: "Hydration tracking well." },
  ];
  clientAssignments[1].bodyMetrics = [
    { date: dStr(21), weight: 66.8, bodyFat: 21.5, waist: 74, chest: 90, notes: "Phase 1 start" },
    { date: dStr(0),  weight: 64.9, bodyFat: 19.8, waist: 71.5, chest: 90.5, notes: "Noticeable abdominal firmness" },
  ];

  for (const assignment of clientAssignments) {
    const existing = await Client.findOne({ name: assignment.name });
    if (!existing) {
      const matchingUser = await User.findOne({
        email: `${assignment.name.split(" ")[0].toLowerCase()}@forgefit.com`
      });

      const fallbackUser = assignment.name === "Demo Client"
        ? await User.findOne({ email: "client@forgefit.com" })
        : matchingUser;

      await Client.create({
        name: assignment.name,
        goal: assignment.goal,
        userId: fallbackUser?._id,
        workouts: assignment.workouts,
        sessions: assignment.sessions || [],
        notes: assignment.notes || [],
        checkIns: assignment.checkIns || [],
        messages: assignment.messages || [],
        nutritionTargets: assignment.nutritionTargets,
        nutritionLogs: assignment.nutritionLogs || [],
        bodyMetrics: assignment.bodyMetrics || [],
      });
    }
  }
  console.log("Demo clients ready ✅");
};

const seedDemoPrograms = async () => {
  const adminUser = await User.findOne({ role: "admin" });
  const demoClientUser = await User.findOne({ email: "client@forgefit.com" });

  if (adminUser && demoClientUser) {
    const existing = await Program.findOne({ assignedTo: demoClientUser._id });
    if (!existing) {
      await Program.create({
        name: "Upper Body Hypertrophy Phase 1",
        description: "4-week block focusing on upper body density and controlled eccentric tempo.",
        assignedTo: demoClientUser._id,
        createdBy: adminUser._id,
        exercises: [
          { name: "Incline Dumbbell Bench Press", sets: 4, reps: "10-12", rest: "75s", notes: "3s eccentric tempo", done: true },
          { name: "Weighted Pull-ups", sets: 3, reps: "6-8", rest: "90s", notes: "Full lock-out at bottom", done: true },
          { name: "Overhead Dumbbell Press", sets: 3, reps: "10", rest: "60s", notes: "Neutral grip", done: false },
          { name: "Cable Lateral Raises", sets: 4, reps: "15", rest: "45s", notes: "Constant deltoid tension", done: false },
          { name: "Hanging Knee Raises", sets: 3, reps: "15", rest: "45s", notes: "Pause 1s at top", done: false },
        ],
      });
    }
  }
  console.log("Demo training programs ready ✅");
};

const connectDatabase = async () => {
  if (mongoose.connection.readyState === 1) return;

  let mongoUri = process.env.MONGO_URI;

  if (isDemoMode) {
    const mongoServer = await MongoMemoryServer.create();
    mongoUri = mongoServer.getUri();
    console.log("Using temporary in-memory demo database");
  }

  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 5000,
  });

  console.log("MongoDB Connected ✅");
  if (isDemoMode) {
    await seedDemoUsers();
    await seedDemoWorkouts();
    await seedDemoClients();
    await seedDemoPrograms();
  }
};

const startServer = async () => {
  await connectDatabase();

  app.listen(port, () => {
    console.log(`Server running on port ${port} 🚀`);
  });
};

if (require.main === module) {
  startServer().catch((err) => {
    console.error("MongoDB startup failed:", err);
  });
}

module.exports = { app, connectDatabase };