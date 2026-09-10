const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error("JWT_SECRET must be set");
}

const auth = (req, res, next) => {
  try {
    const token = req.header("Authorization");

    if (!token) {
      return res.status(401).json({ msg: "No token, access denied" });
    }

    // Remove "Bearer "
    const cleanToken = token.replace("Bearer ", "");

    const decoded = jwt.verify(cleanToken, jwtSecret);

    req.user = decoded; // { id, role }

    next();
  } catch (err) {
    res.status(401).json({ msg: "Invalid token" });
  }
};

module.exports = auth;