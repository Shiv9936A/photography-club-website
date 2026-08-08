import express from "express";

import { googleLogin, getCurrentUser, getProfile, logout } from "../controllers/auth.controller.js";
import { attachCurrentUser, verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/google", googleLogin);
router.get("/me", verifyJWT, attachCurrentUser, getCurrentUser);
router.get("/profile", verifyJWT, attachCurrentUser, getProfile);
router.post("/logout", verifyJWT, logout);

export default router;
