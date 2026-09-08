const express = require("express");
const router = express.Router();

const Client = require("../models/Client");
const User = require("../models/User");
const auth = require("../middleware/auth");

const canAccessClient = (req, client) => (
  req.user.role === "admin" || client.userId?.toString() === req.user.id
);

// ✅ ADD CLIENT
router.post("/", auth, async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const existing = await Client.findOne({ userId });
    if (existing) {
      return res.status(400).json({ msg: "Client already added" });
    }

    const client = new Client({
      name: user.name,
      userId: user._id,
      workouts: [],
    });

    await client.save();
    res.json(client);

  } catch (err) {
    res.status(500).json({ msg: "Error adding client" });
  }
});

// ✅ GET CLIENTS
router.get("/", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ msg: "Access denied" });
  }

  const clients = await Client.find();
  res.json(clients);
});

// ✅ GET CURRENT CLIENT PROFILE
router.get("/me", auth, async (req, res) => {
  try {
    let client = await Client.findOne({ userId: req.user.id });

    if (!client) {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ msg: "Client profile not found" });
      }

      client = await Client.create({
        name: user.name,
        userId: user._id,
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
        ],
      });
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

// ✅ DELETE CLIENT
router.delete("/:id", auth, async (req, res) => {
  try {
    const deleted = await Client.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ msg: "Client not found" });
    }

    res.json({ msg: "Client deleted" });

  } catch {
    res.status(500).json({ msg: "Error deleting client" });
  }
});

// ✅ MULTI DELETE (IMPORTANT: ABOVE SINGLE DELETE)
router.post("/:id/workout/delete-many", auth, async (req, res) => {
  const { ids } = req.body;

  const client = await Client.findById(req.params.id);

  client.workouts = client.workouts.filter(
    w => !ids.includes(w._id.toString())
  );

  await client.save();
  res.json(client);
});

// ✅ SINGLE DELETE
router.delete("/:id/workout/:wid", auth, async (req, res) => {
  const client = await Client.findById(req.params.id);

  client.workouts = client.workouts.filter(
    w => w._id.toString() !== req.params.wid
  );

  await client.save();
  res.json(client);
});

// ✅ ADD WORKOUT
router.post("/:id/workout", auth, async (req, res) => {
  const { name } = req.body;

  const client = await Client.findById(req.params.id);

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

  const workout = client.workouts.id(req.params.wid);
  workout.done = !workout.done;

  await client.save();
  res.json(client);
});

module.exports = router;