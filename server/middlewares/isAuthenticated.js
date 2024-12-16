import jwt from "jsonwebtoken";
import connectDB from "../database/db.js";

const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "User isn't authenticated", success: false });
    }

    const verify = await jwt.verify(token, process.env.VITE_SECRET_KEY);
    if (!verify) {
      return res.status(401).json({ message: "User not authenticated", success: false });
    }

    req.id = verify.userId;

    // Connect to the database
    const db = await connectDB();

    // Fetch profile picture from the database
    const [user] = await db.promise().execute(
      `SELECT profilePicture FROM User WHERE User_ID = ?`,
      [verify.userId]
    );

    if (user.length === 0) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    // Set profilePicture in the request object
    req.profilePicture = user[0].profilePicture || `https://api.dicebear.com/6.x/initials/svg?seed=${verify.userId}`;

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export default isAuthenticated;
