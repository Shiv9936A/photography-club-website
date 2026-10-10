import express from "express";

import { googleLogin, getCurrentUser, logout } from "../controllers/auth.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/google", googleLogin);
router.get("/me", verifyJWT, getCurrentUser);
router.post("/logout", verifyJWT, logout);

export default router;