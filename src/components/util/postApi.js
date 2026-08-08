import axios from "axios";
import { authClient } from "./authClient";
import { API_URL } from "./api";

const mapPost = (post) => {
    return {
        id: post.documentId,
        documentId: post.documentId,
        title: post.title,
        description: post.description,
        likes: post.likesCount,

        images: post.images?.map(
            (img) => API_URL + img.url
        ) || [],

        img: post.images?.length
            ? API_URL + post.images[0].url
            : "",

        category: post.category?.name,

        photographer: post.photographer,
        photographerAvatar: post.photographerAvatar
            ? API_URL + post.photographerAvatar.url
            : "",
        location: post.location,
        date: post.date,
        camera: post.camera,
        lens: post.lens,
        settings: post.settings,
    };
};

export const getPhotos = async () => {
    const res = await authClient.get("/gallery/photos");
    return res.data.data.map(mapPost);
};

export const getReels = async () => {
    const res = await authClient.get("/gallery/reels");
    return res.data.data.map(mapPost);
};

export const likePost = async (documentId) => {
    const res = await axios.put(`${API_URL}/api/posts/${documentId}/like`);

    return res.data.data;
}
