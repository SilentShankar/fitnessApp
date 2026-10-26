const express = require("express");
const router = express.Router();

const Client = require("../models/Client");
const User = require("../models/User");
const auth = require("../middleware/auth");

const canAccessClient = (req, client) => (
  req.user.role === "admin" || client.userId?.toString() === req.user.id
);

// ✅ ENROLL ATHLETE INTO ROSTER (Admin only)
router.post("/", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ msg: "Access denied" });
  }

  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User account not found" });

    const existing = await Client.findOne({ userId });
    if (existing) {
      return res.status(400).json({ msg: "Athlete is already enrolled in your active roster" });
    }

    const client = new Client({
      name: user.name,
      email: user.email,
      userId: user._id,
      workouts: [
        { name: "Warm-up activation & mobility", done: false },
        { name: "Full-body foundation circuit", done: false },
        { name: "Post-session cooldown & stretch", done: false },
      ],
      notes: [
        { text: "Enrolled into active training roster by coach." },
      ],
    });

    await client.save();
    try { require("../services/storageBackup").debouncedSaveSnapshot(); } catch (e) {}
    res.json(client);

  } catch (err) {
    res.status(500).json({ msg: "Error enrolling athlete" });
  }
});

// ✅ GET ENROLLED ATHLETES (Admin only)
router.get("/", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ msg: "Access denied" });
  }

  try {
    const clients = await Client.find().populate("userId", "name email role");
    res.json(clients);
  } catch (err) {
    console.error("Error fetching clients:", err);
    res.status(500).json({ msg: "Error fetching clients" });
  }
});

// ✅ GET CURRENT CLIENT PROFILE
router.get("/me", auth, async (req, res) => {
  try {
    const client = await Client.findOne({ userId: req.user.id });

    if (!client) {
      return res.status(404).json({ msg: "Athlete profile not yet enrolled by coach." });
    }

    res.json(client);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching client profile" });
  }
});

// ✅ SAVE CHECK-IN
router.post("/:id/checkin", auth, async (req, res) => {
  try {
    const { energy, sleep, mood, note } = req.body;
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({ msg: "Client not found" });
    }

    if (!canAccessClient(req, client)) {
      return res.status(403).json({ msg: "Access denied" });
    }

    client.checkIns.push({ energy, sleep, mood, note });
    await client.save();
    res.json(client);
  } catch (err) {
    res.status(500).json({ msg: "Error saving check-in" });
  }
});

// ✅ GET MESSAGES
router.get("/:id/messages", auth, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ msg: "Client not found" });
    }

    if (!canAccessClient(req, client)) {
      return res.status(403).json({ msg: "Access denied" });
    }

    res.json(client.messages || []);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching messages" });
  }
});

// ✅ SEND MESSAGE
router.post("/:id/message", auth, async (req, res) => {
  try {
    const { text } = req.body;
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({ msg: "Client not found" });
    }

    if (!canAccessClient(req, client)) {
      return res.status(403).json({ msg: "Access denied" });
    }

    if (!text || !text.trim()) {
      return res.status(400).json({ msg: "Message cannot be empty" });
    }

    client.messages.push({
      sender: req.user.role === "client" ? "client" : "trainer",
      text: text.trim(),
    });

    await client.save();
    res.json(client.messages);
  } catch (err) {
    res.status(500).json({ msg: "Error sending message" });
  }
});

// ✅ ADD SESSION
router.post("/:id/session", auth, async (req, res) => {
  try {
    const { title, date, time, type, status, meetingLink } = req.body;
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({ msg: "Client not found" });
    }

    if (!canAccessClient(req, client)) {
      return res.status(403).json({ msg: "Access denied" });
    }

    client.sessions.push({
      title,
      date,
      time,
      type,
      status: status || "Booked",
      meetingLink,
    });

    await client.save();
    res.json(client);
  } catch (err) {
    res.status(500).json({ msg: "Error adding session" });
  }
});

// UPDATE SESSION STATUS
router.put("/:id/session/:sid", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ msg: "Access denied" });
  }

  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ msg: "Client not found" });
    }

    const session = client.sessions.id(req.params.sid);
    if (!session) {
      return res.status(404).json({ msg: "Session not found" });
    }

    const allowedStatuses = ["Confirmed", "Pending", "Booked", "Completed", "Cancelled"];
    if (!allowedStatuses.includes(req.body.status)) {
      return res.status(400).json({ msg: "Invalid session status" });
    }

    session.status = req.body.status;
    await client.save();
    res.json(client);
  } catch (err) {
    res.status(500).json({ msg: "Error updating session" });
  }
});

// ✅ DELETE SESSION (Admin only)
router.delete("/:id/session/:sid", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ msg: "Access denied" });
  }

  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ msg: "Client not found" });
    }

    client.sessions = client.sessions.filter(
      (s) => s._id.toString() !== req.params.sid
    );

    await client.save();
    res.json(client);
  } catch (err) {
    res.status(500).json({ msg: "Error deleting session" });
  }
});

// ✅ ADD COACH NOTE
router.post("/:id/note", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ msg: "Access denied" });
  }

  try {
    const { text } = req.body;
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({ msg: "Client not found" });
    }

    if (!text || !text.trim()) {
      return res.status(400).json({ msg: "Note cannot be empty" });
    }

    client.notes.push({ text: text.trim() });
    await client.save();
    res.json(client);
  } catch (err) {
    res.status(500).json({ msg: "Error adding note" });
  }
});

// ✅ DELETE COACH NOTE (Admin only)
router.delete("/:id/note/:nid", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ msg: "Access denied" });
  }

  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ msg: "Client not found" });
    }

    client.notes = client.notes.filter(
      (n) => n._id.toString() !== req.params.nid
    );

    await client.save();
    res.json(client);
  } catch (err) {
    res.status(500).json({ msg: "Error deleting note" });
  }
});

// ✅ UPDATE CLIENT DETAILS (Admin only)
router.patch("/:id", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ msg: "Access denied" });
  }

  try {
    const { goal, name } = req.body;
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ msg: "Client not found" });
    }

    if (goal !== undefined) client.goal = goal;
    if (name !== undefined) client.name = name;

    await client.save();
    res.json(client);
  } catch (err) {
    res.status(500).json({ msg: "Error updating client details" });
  }
});

// ✅ DELETE CLIENT (Admin only)
router.delete("/:id", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ msg: "Access denied" });
  }

  try {
    const deleted = await Client.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ msg: "Client not found" });
    }

    try { require("../services/storageBackup").debouncedSaveSnapshot(); } catch (e) {}
    res.json({ msg: "Client deleted" });

  } catch {
    res.status(500).json({ msg: "Error deleting client" });
  }
});

// ✅ MULTI DELETE (Admin only)
router.post("/:id/workout/delete-many", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ msg: "Access denied" });
  }

  const { ids } = req.body;
  const client = await Client.findById(req.params.id);
  if (!client) return res.status(404).json({ msg: "Client not found" });

  client.workouts = client.workouts.filter(
    w => !ids.includes(w._id.toString())
  );

  await client.save();
  res.json(client);
});

// ✅ SINGLE DELETE (Admin only)
router.delete("/:id/workout/:wid", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ msg: "Access denied" });
  }

  const client = await Client.findById(req.params.id);
  if (!client) return res.status(404).json({ msg: "Client not found" });

  client.workouts = client.workouts.filter(
    w => w._id.toString() !== req.params.wid
  );

  await client.save();
  res.json(client);
});

// ✅ ADD WORKOUT (Admin only)
router.post("/:id/workout", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ msg: "Access denied" });
  }

  const { name } = req.body;
  const client = await Client.findById(req.params.id);
  if (!client) return res.status(404).json({ msg: "Client not found" });

  const exists = client.workouts.find(w => w.name === name);
  if (exists) {
    return res.status(400).json({ msg: "Workout already assigned" });
  }

  client.workouts.push({ name, done: false });

  await client.save();
  res.json(client);
});

// ✅ TOGGLE DONE
router.put("/:id/workout/:wid", auth, async (req, res) => {
  const client = await Client.findById(req.params.id);
  if (!client) return res.status(404).json({ msg: "Client not found" });

  if (!canAccessClient(req, client)) {
    return res.status(403).json({ msg: "Access denied" });
  }

  const workout = client.workouts.id(req.params.wid);
  if (!workout) return res.status(404).json({ msg: "Workout not found" });

  workout.done = !workout.done;

  await client.save();
  res.json(client);
});

// ✅ UPDATE NUTRITION TARGETS (Admin only)
router.post("/:id/nutrition-target", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ msg: "Access denied" });
  }

  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ msg: "Client not found" });

    const {
      calories, dailyCalories,
      protein, proteinGrams,
      carbs, carbsGrams,
      fats, fat, fatGrams,
      water, waterMl,
      steps, dailySteps
    } = req.body;

    const cal = calories !== undefined ? calories : dailyCalories;
    const prot = protein !== undefined ? protein : proteinGrams;
    const carb = carbs !== undefined ? carbs : carbsGrams;
    const f = fats !== undefined ? fats : (fat !== undefined ? fat : fatGrams);
    const w = water !== undefined ? water : waterMl;
    const s = steps !== undefined ? steps : dailySteps;

    client.nutritionTargets = {
      calories: Number(cal) || client.nutritionTargets?.calories || 2400,
      protein: Number(prot) || client.nutritionTargets?.protein || 180,
      carbs: Number(carb) || client.nutritionTargets?.carbs || 250,
      fats: Number(f) || client.nutritionTargets?.fats || 70,
      water: Number(w) || client.nutritionTargets?.water || 3500,
      steps: Number(s) || client.nutritionTargets?.steps || 10000,
    };

    await client.save();
    res.json(client);
  } catch (err) {
    res.status(500).json({ msg: "Error updating nutrition targets" });
  }
});

// ✅ LOG DAILY NUTRITION / MACROS (Athlete or Coach)
router.post("/:id/nutrition-log", auth, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ msg: "Client not found" });

    if (!canAccessClient(req, client)) {
      return res.status(403).json({ msg: "Access denied" });
    }

    const {
      date,
      calories, dailyCalories,
      protein, proteinGrams,
      carbs, carbsGrams,
      fats, fat, fatGrams,
      water, waterMl,
      steps, dailySteps,
      notes
    } = req.body;

    const logDate = date || new Date().toISOString().slice(0, 10);
    const cal = calories !== undefined ? calories : dailyCalories;
    const prot = protein !== undefined ? protein : proteinGrams;
    const carb = carbs !== undefined ? carbs : carbsGrams;
    const f = fats !== undefined ? fats : (fat !== undefined ? fat : fatGrams);
    const w = water !== undefined ? water : waterMl;
    const s = steps !== undefined ? steps : dailySteps;

    const existingIndex = client.nutritionLogs.findIndex((log) => log.date === logDate);
    if (existingIndex > -1) {
      if (cal !== undefined) client.nutritionLogs[existingIndex].calories = Number(cal);
      if (prot !== undefined) client.nutritionLogs[existingIndex].protein = Number(prot);
      if (carb !== undefined) client.nutritionLogs[existingIndex].carbs = Number(carb);
      if (f !== undefined) client.nutritionLogs[existingIndex].fats = Number(f);
      if (w !== undefined) client.nutritionLogs[existingIndex].water = Number(w);
      if (s !== undefined) client.nutritionLogs[existingIndex].steps = Number(s);
      if (notes !== undefined) client.nutritionLogs[existingIndex].notes = notes;
    } else {
      client.nutritionLogs.push({
        date: logDate,
        calories: Number(cal) || 0,
        protein: Number(prot) || 0,
        carbs: Number(carb) || 0,
        fats: Number(f) || 0,
        water: Number(w) || 0,
        steps: Number(s) || 0,
        notes: notes || "",
      });
    }

    await client.save();
    res.json(client);
  } catch (err) {
    res.status(500).json({ msg: "Error saving nutrition log" });
  }
});

// ✅ LOG BODY WEIGHT & MEASUREMENTS (Athlete or Coach)
router.post("/:id/metric", auth, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ msg: "Client not found" });

    if (!canAccessClient(req, client)) {
      return res.status(403).json({ msg: "Access denied" });
    }

    const { date, weight, bodyFat, bodyFatPercent, waist, chest, notes } = req.body;
    if (!weight) {
      return res.status(400).json({ msg: "Body weight is required" });
    }

    const bf = bodyFat !== undefined ? bodyFat : bodyFatPercent;

    client.bodyMetrics.push({
      date: date || new Date().toISOString().slice(0, 10),
      weight: Number(weight),
      bodyFat: bf ? Number(bf) : null,
      waist: waist ? Number(waist) : null,
      chest: chest ? Number(chest) : null,
      notes: notes || "",
    });

    await client.save();
    res.json(client);
  } catch (err) {
    res.status(500).json({ msg: "Error saving metric" });
  }
});

// ✅ DELETE BODY METRIC (Admin or Athlete)
router.delete("/:id/metric/:mid", auth, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ msg: "Client not found" });

    if (!canAccessClient(req, client)) {
      return res.status(403).json({ msg: "Access denied" });
    }

    client.bodyMetrics = client.bodyMetrics.filter((m) => m._id.toString() !== req.params.mid);
    await client.save();
    res.json(client);
  } catch (err) {
    res.status(500).json({ msg: "Error deleting metric" });
  }
});

module.exports = router;