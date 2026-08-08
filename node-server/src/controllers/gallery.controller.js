import { fetchEvents, fetchGalleryPosts } from "../services/strapi.service.js";

const canViewPrivateGallery = (user) => {
    if (!user) {
        return false;
    }

    return Boolean(user.isNitk);
};

const resolveAccess = (user) => (canViewPrivateGallery(user) ? "private" : "public");

const canViewPrivateEvents = (user) => {
    if (!user) {
        return false;
    }

    return Boolean(user.isNitk);
};

const resolveEventAccess = (user) => (canViewPrivateEvents(user) ? "private" : "public");

export const getPhotos = async (req, res) => {
    try {
        const access = resolveAccess(req.currentUser);
        const posts = await fetchGalleryPosts({
            kind: "photos",
            access,
        });

        return res.json({
            success: true,
            access,
            data: posts,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Unable to load photos",
        });
    }
};

export const getReels = async (req, res) => {
    try {
        const access = resolveAccess(req.currentUser);
        const posts = await fetchGalleryPosts({
            kind: "reels",
            access,
        });

        return res.json({
            success: true,
            access,
            data: posts,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Unable to load reels",
        });
    }
};

export const getEvents = async (req, res) => {
    try {
        const access = resolveEventAccess(req.currentUser);
        const events = await fetchEvents({
            access,
        });

        return res.json({
            success: true,
            access,
            data: events,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Unable to load events",
        });
    }
};
