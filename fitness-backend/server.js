require("dotenv").config();

const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { MongoMemoryServer } = require("mongodb-memory-server");
const User = require("./models/User");

const app = express();
const port = process.env.PORT || 5000;
const allowedOrigin = process.env.CLIENT_URL || "*";
const isDemoMode = !process.env.MONGO_URI;

app.use(cors({ origin: allowedOrigin }));
app.use(express.json());

// ✅ Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/clients", require("./routes/clients"));
app.use("/api/workouts", require("./routes/workouts"));
app.use("/api/programs", require("./routes/programs"));

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

const seedDemoClients = async () => {
  const clientAssignments = [
    {
      name: "Demo Client",
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
      notes: [{ text: "Great consistency this week. Keep the recovery work consistent." }],
    },
    {
      name: "Ava Martinez",
      workouts: [
        { name: "Upper Body Strength", done: true },
        { name: "Core Burn", done: true },
        { name: "Pull Day Circuit", done: false },
        { name: "Mobility Flow", done: false },
      ],
    },
    {
      name: "Leo Carter",
      workouts: [
        { name: "Leg Power", done: true },
        { name: "HIIT Sprint Blocks", done: true },
        { name: "Recovery Walk", done: false },
      ],
    },
    {
      name: "Nina Brooks",
      workouts: [
        { name: "Pilates Core", done: true },
        { name: "Low Impact Cardio", done: false },
        { name: "Posture Reset", done: false },
        { name: "Glute Activation", done: false },
      ],
    },
  ];

  for (const assignment of clientAssignments) {
    const existing = await require("./models/Client").findOne({ name: assignment.name });
    if (!existing) {
      const matchingUser = await User.findOne({
        email: `${assignment.name.split(" ")[0].toLowerCase()}@forgefit.com`
      });

      const fallbackUser = assignment.name === "Demo Client"
        ? await User.findOne({ email: "client@forgefit.com" })
        : matchingUser;

      await require("./models/Client").create({
        name: assignment.name,
        userId: fallbackUser?._id,
        workouts: assignment.workouts,
        sessions: assignment.sessions || [],
        notes: assignment.notes || [],
      });
    }
  }
};

const connectDatabase = async () => {
  if (mongoose.connection.readyState === 1) return;

  let mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    const mongoServer = await MongoMemoryServer.create();
    mongoUri = mongoServer.getUri();
    console.log("Using temporary demo database");
  }

  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 5000,
  });

  console.log("MongoDB Connected ✅");
  if (isDemoMode) {
    await seedDemoUsers();
    await seedDemoClients();
  }
};

const startServer = async () => {
  await connectDatabase();

  app.listen(port, () => {
    console.log(`Server running on port ${port} 🚀`);
  });
};

startServer().catch((err) => {
  console.error("MongoDB startup failed:", err);
});

module.exports = { app, connectDatabase };