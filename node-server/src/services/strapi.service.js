import axios from "axios";

const strapiClient = axios.create({
    baseURL: process.env.STRAPI_URL || "http://localhost:1337",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
        "x-auth-sync-secret": process.env.AUTH_SYNC_SECRET,
    },
});

export const resolveOrCreateUser = async ({ googleId, email, name, picture }) => {
    const { data } = await strapiClient.post("/api/internal/auth/resolve-user", {
        googleId,
        email,
        name,
        picture,
    });

    return data?.data ?? null;
};

export const getUserById = async (id) => {
    const { data } = await strapiClient.get(`/api/internal/auth/users/${id}`);
    return data?.data ?? null;
};

export const fetchGalleryPosts = async ({ kind, access = "public" }) => {
    const { data } = await strapiClient.get(`/api/posts/${kind}`, {
        params: {
            access,
        },
    });

    return data?.data ?? [];
};

export const fetchEvents = async ({ access = "public" } = {}) => {
    const { data } = await strapiClient.get("/api/events", {
        params: {
            access,
        },
    });

    return data?.data ?? [];
};
