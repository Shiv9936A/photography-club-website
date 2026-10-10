import axios from "axios";
import { API_URL } from "./api";

const mapPhoto = (photo) => {
  const capturedByAvatar =
    photo.capturedBy?.avatar?.url || photo.capturedBy?.googlePicture || "";

  return {
    id: photo.documentId,
    documentId: photo.documentId,

    title: photo.title || "",

    img: photo.image?.url ? API_URL + photo.image.url : "",

    images: photo.image?.url ? [API_URL + photo.image.url] : [],

    description: "",
    likes: photo.likesCount || 0,

    tag: photo.tag || "Other",

    photographer:
      photo.capturedBy?.username || photo.uploadedBy?.username || "Unknown",

    photographerAvatar: capturedByAvatar
      ? capturedByAvatar.startsWith("http")
        ? capturedByAvatar
        : API_URL + capturedByAvatar
      : "",
    location: "",
    date: photo.capturedDate || photo.createdAt,

    camera: "",
    lens: "",
    settings: "",
  };
};

export const getPhotos = async () => {
  const res = await axios.get(
    `${API_URL}/api/photos?filters[visibility][$eq]=public&populate=*`,
  );

  return res.data.data.map(mapPhoto);
};

export const getSharedPhoto = async (documentId) => {
  const params = new URLSearchParams({
    "filters[documentId][$eq]": documentId,
    "filters[visibility][$eq]": "public",
    populate: "*",
  });
  const publicResponse = await axios.get(`${API_URL}/api/photos?${params}`);
  const publicPhoto = publicResponse.data.data?.[0];
  if (publicPhoto) return mapPhoto(publicPhoto);

  const token = localStorage.getItem("authToken");
  if (!token) {
    const error = new Error("This photo is private. Please log in to view it.");
    error.response = { status: 401 };
    throw error;
  }

  const privateResponse = await axios.get(`${API_URL}/api/gallery/private`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const privatePhoto = privateResponse.data.photos?.find(
    (photo) => photo.documentId === documentId,
  );
  if (!privatePhoto) {
    const error = new Error("This photo is unavailable or you are not authorized to view it.");
    error.response = { status: 404 };
    throw error;
  }
  return mapPhoto(privatePhoto);
};

export const getPrivatePhotos = async () => {
  const token = localStorage.getItem("authToken");

  if (!token) {
    throw new Error("Authentication required");
  }

  const res = await axios.get(`${API_URL}/api/gallery/private`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const uniquePhotos = Array.from(
    new Map(
      (res.data.photos || []).map((photo) => [photo.documentId, photo]),
    ).values(),
  );

  return uniquePhotos.map(mapPhoto);
};

export const getReels = async () => {
  const res = await axios.get(`${API_URL}/api/posts/photos`);

  return res.data.data.map((post) => ({
    id: post.documentId,
    documentId: post.documentId,

    title: post.title || "Untitled",

    img: post.images?.length ? API_URL + post.images[0].url : "",

    images: post.images?.map((img) => API_URL + img.url) || [],

    description: post.description || "",

    likes: post.likesCount || 0,
    likesCount: post.likesCount || 0,

    category: post.category?.name || "Others",

    photographer: post.photographer || "Unknown",

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
  const res = await axios.put(`${API_URL}/api/posts/${documentId}/like`);

  return res.data.data;
};

export const getMyPhotoLikes = async () => {
  const token = localStorage.getItem("authToken");
  const res = await axios.get(`${API_URL}/api/photos/likes/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.data.documentIds;
};

export const likePhoto = async (documentId, currentlyLiked) => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    const error = new Error("Authentication required");
    error.response = { status: 401 };
    throw error;
  }

  const res = await axios({
    method: currentlyLiked ? "delete" : "post",
    url: `${API_URL}/api/photos/${documentId}/like`,
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data.data;
};
