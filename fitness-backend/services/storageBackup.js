const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "../data");
const backupFile = path.join(dataDir, "persisted_store.json");

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  try {
    fs.mkdirSync(dataDir, { recursive: true });
  } catch (err) {
    console.error("Failed to create data directory:", err);
  }
}

/**
 * Save current database state to persistent JSON backup file
 */
const saveSnapshot = async () => {
  try {
    const User = require("../models/User");
    const Client = require("../models/Client");
    const Workout = require("../models/Plan");
    const Program = require("../models/Program");

    const [users, clients, workouts, programs] = await Promise.all([
      User.find().lean(),
      Client.find().lean(),
      Workout.find().lean(),
      Program.find().lean(),
    ]);

    const backupData = {
      timestamp: new Date().toISOString(),
      users: users || [],
      clients: clients || [],
      workouts: workouts || [],
      programs: programs || [],
    };

    const tempFile = `${backupFile}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(backupData, null, 2), "utf8");
    fs.renameSync(tempFile, backupFile);
    console.log(`[Backup] Persisted ${users.length} users and ${clients.length} clients to disk ✅`);
  } catch (err) {
    console.error("[Backup] Error saving snapshot:", err.message);
  }
};

/**
 * Restore persistent JSON backup into database on server startup
 */
const restoreSnapshot = async () => {
  if (!fs.existsSync(backupFile)) {
    console.log("[Backup] No persistent backup file found on disk. Initializing clean store.");
    return;
  }

  try {
    const raw = fs.readFileSync(backupFile, "utf8");
    if (!raw.trim()) return;
    const backupData = JSON.parse(raw);

    const User = require("../models/User");
    const Client = require("../models/Client");
    const Workout = require("../models/Plan");
    const Program = require("../models/Program");

    let restoredUsers = 0;
    let restoredClients = 0;
    let restoredPrograms = 0;

    // Restore users
    if (Array.isArray(backupData.users)) {
      for (const u of backupData.users) {
        const existing = await User.findOne({
          $or: [{ _id: u._id }, { email: u.email }],
        });
        if (!existing) {
          await User.create(u);
          restoredUsers++;
        }
      }
    }

    // Restore clients
    if (Array.isArray(backupData.clients)) {
      for (const c of backupData.clients) {
        const existing = await Client.findById(c._id);
        if (!existing) {
          await Client.create(c);
          restoredClients++;
        }
      }
    }

    // Restore programs
    if (Array.isArray(backupData.programs)) {
      for (const p of backupData.programs) {
        const existing = await Program.findById(p._id);
        if (!existing) {
          await Program.create(p);
          restoredPrograms++;
        }
      }
    }

    // Restore workout templates
    if (Array.isArray(backupData.workouts)) {
      for (const w of backupData.workouts) {
        const existing = await Workout.findOne({ name: w.name });
        if (!existing) {
          await Workout.create(w);
        }
      }
    }

    console.log(
      `[Backup] Restored ${restoredUsers} registered users, ${restoredClients} clients, and ${restoredPrograms} programs from disk backup ✅`
    );
  } catch (err) {
    console.error("[Backup] Error restoring snapshot:", err.message);
  }
};

// Debounced snapshot saving to prevent excessive disk writes under load
let saveTimeout = null;
const debouncedSaveSnapshot = () => {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveSnapshot();
  }, 1000);
};

module.exports = {
  saveSnapshot,
  debouncedSaveSnapshot,
  restoreSnapshot,
};
