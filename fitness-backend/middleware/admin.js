const adminOnly = (req, res, next) => {
  try {
    // req.user comes from auth middleware
    if (!req.user) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Access denied: Admins only" });
    }

    next(); // ✅ allow access

  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

module.exports = adminOnly;