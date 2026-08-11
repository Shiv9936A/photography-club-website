import axios from "axios";
import { API_URL } from "./api";

const mapPhoto = (photo) => {
    return {
        id: photo.documentId,
        documentId: photo.documentId,

        title: photo.title || "",

        img: photo.image?.url
            ? API_URL + photo.image.url
            : "",

        images: photo.image?.url
            ? [API_URL + photo.image.url]
            : [],

        description: "",
        likes: 0,

        category: null,

        photographer: "",
        photographerAvatar: "",

        location: "",
        date: photo.createdAt,

        camera: "",
        lens: "",
        settings: "",
    };
};


export const getPhotos = async () => {
    const res = await axios.get(
        `${API_URL}/api/photos?filters[visibility][$eq]=public&populate=image`
    );

    return res.data.data.map(mapPhoto);
};

export const getPrivatePhotos = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
        throw new Error("Authentication required");
    }

    const res = await axios.get(
        `${API_URL}/api/gallery/private`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return res.data.photos.map((photo) => ({
        id: photo.documentId,
        documentId: photo.documentId,
        title: photo.title || "",
        img: photo.image?.url
            ? API_URL + photo.image.url
            : "",
        images: photo.image?.url
            ? [API_URL + photo.image.url]
            : [],
        description: "",
        likes: 0,
        category: null,
        photographer: "",
        photographerAvatar: "",
        location: "",
        date: photo.createdAt,
        camera: "",
        lens: "",
        settings: "",
    }));
};


export const getReels = async () => {
    const res = await axios.get(
        `${API_URL}/api/posts/reels`
    );

    return res.data.data.map((post) => ({
        id: post.documentId,
        documentId: post.documentId,
        title: post.title || "",

        img: post.images?.length
            ? API_URL + post.images[0].url
            : "",

        images: post.images?.map(
            (img) => API_URL + img.url
        ) || [],

        description: post.description || "",
        likes: post.likesCount || 0,

        category: post.category?.name || null,

        photographer: post.photographer || "",
        photographerAvatar: post.photographerAvatar?.url
            ? API_URL + post.photographerAvatar.url
            : "",

        location: post.location || "",
        date: post.date || post.createdAt,

        camera: post.camera || "",
        lens: post.lens || "",
        settings: post.settings || "",
    }));
};


export const likePost = async (documentId) => {
    const res = await axios.put(
        `${API_URL}/api/posts/${documentId}/like`
    );

    return res.data.data;
};