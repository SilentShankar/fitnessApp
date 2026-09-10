const { app, connectDatabase } = require("../local-server");

module.exports = async (req, res) => {
  try {
    await connectDatabase();
    return app(req, res);
  } catch (error) {
    console.error("API startup failed:", error);
    return res.status(500).json({ error: "API startup failed" });
  }
};