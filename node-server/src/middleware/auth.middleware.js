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
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return sendAuthError(res, 401, "Missing bearer token");
        }

        const token = authHeader.split(" ")[1];

        try {
            req.user = verifyToken(token);
            return next();
        } catch (err) {
            if (err?.name === "TokenExpiredError") {
                return sendAuthError(res, 401, "Expired token");
            }

            return sendAuthError(res, 401, "Invalid token");
        }
    } catch {
        return sendAuthError(res, 401, "Invalid token");
    }
};

export const optionalJWT = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return next();
        }

        if (!authHeader.startsWith("Bearer ")) {
            return sendAuthError(res, 401, "Invalid token");
        }

        const token = authHeader.split(" ")[1];
        req.user = verifyToken(token);

        const user = await loadCurrentUser(req);
        if (user) {
            req.currentUser = user;
        }

        return next();
    } catch (err) {
        if (err?.name === "TokenExpiredError") {
            return sendAuthError(res, 401, "Expired token");
        }

        return sendAuthError(res, 401, "Invalid token");
    }
};

export const attachCurrentUser = async (req, res, next) => {
    try {
        const user = await loadCurrentUser(req);

        if (!user) {
            return sendAuthError(res, 401, "Account not found");
        }

        return next();
    } catch {
        return sendAuthError(res, 500, "Unable to load current user");
    }
};

export const requireRole = (allowedRoles = []) => async (req, res, next) => {
    try {
        const user = await loadCurrentUser(req);

        if (!user) {
            return sendAuthError(res, 401, "Account not found");
        }

        if (!allowedRoles.includes(user.role)) {
            return sendAuthError(res, 403, "Insufficient role");
        }

        return next();
    } catch {
        return sendAuthError(res, 500, "Unable to validate role");
    }
};

export const requireNitkStudent = async (req, res, next) => {
    try {
        const user = await loadCurrentUser(req);

        if (!user) {
            return sendAuthError(res, 401, "Account not found");
        }

        if (!user.isNitk) {
            return sendAuthError(res, 403, "Non-NITK email");
        }

        return next();
    } catch {
        return sendAuthError(res, 500, "Unable to validate NITK access");
    }
};
