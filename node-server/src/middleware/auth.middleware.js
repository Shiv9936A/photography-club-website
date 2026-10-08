import { verifyToken } from "../utils/jwt.js";
import { getUserById } from "../services/strapi.service.js";

const sendAuthError = (res, statusCode, message) =>
    res.status(statusCode).json({
        success: false,
        message,
    });

const loadCurrentUser = async (req) => {
    if (req.currentUser) {
        return req.currentUser;
    }

    const userId = req.user?.userId;

    if (!userId) {
        return null;
    }

    const user = await getUserById(userId);
    req.currentUser = user;

    return user;
};

export const verifyJWT = (req, res, next) => {
  try {
    // 1. Get Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authorization token is required",
      });
    }

    // 2. Check Bearer format
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format",
      });
    }

    // 3. Extract JWT
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "JWT token is missing",
      });
    }

    const decoded = verifyToken(token);

    req.user = decoded;

    next();
  } catch (error) {
    console.error("JWT verification failed:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
