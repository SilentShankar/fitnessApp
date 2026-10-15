// Startup orchestrator for ForgeFit
// Automatically routes to Production on cloud hosts (Render/Railway/etc.)
// or Local Development when run on developer machines.

const path = require("path");
const { spawn } = require("child_process");

const isCloud = Boolean(
  process.env.RENDER ||
  process.env.PORT ||
  process.env.NODE_ENV === "production"
);

if (isCloud) {
  console.log("🚀 Starting ForgeFit in Cloud Production mode on 0.0.0.0...");
  const { startServer } = require("./fitness-backend/local-server.js");
  startServer();
} else {
  console.log("⚡ Starting ForgeFit in Local Development mode (Vite + Local Server)...");
  const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
  const child = spawn(npmCmd, ["run", "dev:all"], {
    stdio: "inherit",
    shell: true,
  });

  child.on("exit", (code) => {
    process.exit(code || 0);
  });
}
