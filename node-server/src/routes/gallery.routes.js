import express from "express";
import { getEvents, getPhotos, getReels } from "../controllers/gallery.controller.js";
import { optionalJWT } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/photos", optionalJWT, getPhotos);
router.get("/reels", optionalJWT, getReels);
router.get("/events", optionalJWT, getEvents);

export default router;
