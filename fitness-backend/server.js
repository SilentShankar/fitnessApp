const express = require("express");
const { app, connectDatabase } = require("./local-server");

module.exports = async (req, res) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
	res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

	if (req.method === "OPTIONS") {
		return res.status(204).end();
	}

	try {
		await connectDatabase();
		return app(req, res);
	} catch (error) {
		console.error("API startup failed:", error);
		return res.status(500).json({ error: "API startup failed" });
	}
};
