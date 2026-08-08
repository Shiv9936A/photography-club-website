import { getGoogleClient } from "../config/google.js";
import { generateToken } from "../utils/jwt.js"
import { getUserById, resolveOrCreateUser } from "../services/strapi.service.js";

const toPublicUser = (user) => {
    if (!user) {
        return null;
    }

    return {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture ?? null,
        role: user.role,
        isNitk: Boolean(user.isNitk),
    };
};

export const googleLogin = async (req, res) => {

    try {
        const client = getGoogleClient();
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: "Google token is required(ps: check at which level is the token being sent in the json response."
            })
        }

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        const {
            sub,
            name,
            email,
            picture,
            email_verified,
        } = payload;

        if (!email_verified) {
            return res.status(401).json({
                success: false,
                message: "Email not verified",
            });
        }

        const user = await resolveOrCreateUser({
            googleId: sub,
            name,
            email,
            picture,
        });

        const jwt = generateToken({
            userId: user.id,
            email: user.email,
            role: user.role,
            isNitk: user.isNitk,
        });

        return res.status(200).json({
            success: true,
            message: "Login Successful",
            token: jwt,
            user: toPublicUser(user),
        });
    }
    catch (err) {
        console.error(err);

        res.status(401).json({
            success: false,
            message: "Invalid Google Token",
        });
    }
};

export const getCurrentUser = async (req, res) => {
    const user = req.currentUser ?? await getUserById(req.user.userId);

    res.json({
        success: true,
        user: toPublicUser(user) ?? req.user,
        message: "Current User API",
    });
};

export const getProfile = async (req, res) => {
    const user = req.currentUser ?? await getUserById(req.user.userId);

    res.json({
        success: true,
        profile: toPublicUser(user) ?? req.user,
        message: "Profile API",
    });
};

export const logout = async (req, res) => {
    res.json({
        success: true,
        message: "Logout API",
    });
};
