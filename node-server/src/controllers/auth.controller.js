import { getGoogleClient } from "../config/google.js";
import { generateToken } from "../utils/jwt.js";
import { syncGoogleUser } from "../services/strapi.service.js";

export const googleLogin = async (req, res) => {
  console.log("================================");
  console.log("BACKEND GOOGLE CLIENT ID:");
  console.log(process.env.GOOGLE_CLIENT_ID);
  console.log("================================");

  try {
    const client = getGoogleClient();
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message:
          "Google token is required(ps: check at which level is the token being sent in the json response.",
      });
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const { sub, name, email, picture, email_verified } = payload;

    if (!email_verified) {
      return res.status(401).json({
        success: false,
        message: "Email not verified",
      });
    }

    const isNitk = email.toLowerCase().endsWith("@nitk.edu.in");

    // const jwt = generateToken({
    //     googleId: sub,
    //     email,
    //     role: "user",
    // });

    const strapiResult = await syncGoogleUser({
      googleId: sub,
      email,
      name,
      picture,
      isNitk,
    });

    const strapiUser = strapiResult.user;

    console.log("STRAPI USER:", strapiUser);

    const jwt = generateToken({
      googleId: sub,
      email,
      role: strapiUser.appRole,
      userId: strapiUser.id,
      isNitk: strapiUser.isNitk,
    });

    return res.status(200).json({
      success: true,
      message: "Login Successful",

      token: jwt,

      user: {
        id: strapiUser.id,
        googleId: sub,
        name: strapiUser.name,
        email: strapiUser.email,
        picture: strapiUser.googlePicture,
        isNitk: strapiUser.isNitk,
        role: strapiUser.appRole,
      },
    });
  } catch (err) {
    console.error("========== GOOGLE AUTH ERROR ==========");
    console.error("Message:", err?.message);
    console.error("Name:", err?.name);
    console.error("Stack:", err?.stack);
    console.error("======================================");

    return res.status(401).json({
      success: false,
      message: "Invalid Google Token",
      error: err?.message || "Unknown error",
    });
  }
};

export const getCurrentUser = async (req, res) => {
  res.json({
    success: true,
    user: req.user,
    message: "Current User API",
  });
};

export const logout = async (req, res) => {
  res.json({
    success: true,
    message: "Logout API",
  });
};
