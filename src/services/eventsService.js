import axios from "axios";
import { API_URL } from "../components/util/api";

const EVENTS_API = `${API_URL}/api/events`;

const getToken = () => localStorage.getItem("authToken");

const getFields = (item) => item?.attributes ?? item ?? {};

const getMediaUrl = (media) => {
  const image = media?.data?.attributes ?? media?.data ?? media;

  if (!image?.url) return "";

  return image.url.startsWith("http") ? image.url : `${API_URL}${image.url}`;
};

const formatEvent = (item) => {
  const fields = getFields(item);
  const startDate = fields.dateTime ? new Date(fields.dateTime) : null;
  const validDate = startDate && !Number.isNaN(startDate.getTime());
  const image = getMediaUrl(fields.thumbnailPic);

  const toArray = (value) => {
    if (Array.isArray(value)) return value;
    if (typeof value === "string" && value.trim()) return [value.trim()];
    return [];
  };

  return {
    id: String(fields.EventId ?? item?.documentId ?? item?.id ?? ""),
    documentId: item?.documentId ?? null,

    title: fields.Title ?? fields.EventName ?? "Untitled Event",
    shortDescription: fields.description ?? "",
    fullDescription: fields.description ?? "",
    description: fields.description ?? "",

    location: fields.location ?? "",
    venue: fields.location ?? "",
    locationLink: fields.locationLink ?? "",

    dateTime: fields.dateTime ?? "",
    date: validDate
      ? startDate.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "Date to be announced",
    time: validDate
      ? startDate.toLocaleTimeString("en-IN", {
          hour: "numeric",
          minute: "2-digit",
        })
      : "Time to be announced",

    image,
    bannerImage: image,

    eventType: fields.isPClubEvent ? "PClub" : "External",
    category: fields.isPClubEvent ? "PClub" : "Campus",
    organizer: "Photography Club NITK",
    contactPerson: fields.contactPerson ?? "Not specified",
    portfolioLink: fields.portfolioLink ?? "",
    registrationStatus: "Not specified",

    objectives: toArray(fields.objectives),
    highlights: toArray(fields.highlights),

    participants: "Not specified",
  };
};

const requestConfig = () => {
  const token = getToken();

  return {
    params: {
      populate: "thumbnailPic",
    },
    ...(token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      : {}),
  };
};

export async function getEvents() {
  const response = await axios.get(EVENTS_API, requestConfig());
  const items = response.data?.data ?? [];

  return items
    .map(formatEvent)
    .filter((event) => event.id)
    .sort((a, b) => new Date(a.dateTime || 0) - new Date(b.dateTime || 0));
}

export async function getEventById(eventId) {
  const events = await getEvents();

  return events.find((event) => String(event.id) === String(eventId)) ?? null;
}

export async function getRelatedEvents(eventId) {
  const events = await getEvents();

  return events
    .filter((event) => String(event.id) !== String(eventId))
    .slice(0, 3);
}

export async function getGallery(eventId) {
  const event = await getEventById(eventId);

  if (!event?.documentId) return [];

  const query = `?event=${encodeURIComponent(event.documentId)}`;

  const publicResponse = await axios.get(
    `${API_URL}/api/gallery/public${query}`,
  );

  let photos = publicResponse.data?.photos ?? [];
  const token = getToken();

  if (token) {
    try {
      const privateResponse = await axios.get(
        `${API_URL}/api/gallery/private${query}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      photos = photos.concat(privateResponse.data?.photos ?? []);
    } catch {
      console.warn("Private event photos unavailable.");
    }
  }

  const uniquePhotos = Array.from(
    new Map(
      photos.map((photo) => [photo.documentId ?? photo.id, photo]),
    ).values(),
  );

  return uniquePhotos
    .filter((photo) => photo.image?.url)
    .map((photo) => ({
      id: String(photo.documentId ?? photo.id),
      src: photo.image.url.startsWith("http")
        ? photo.image.url
        : `${API_URL}${photo.image.url}`,
      caption: photo.title ?? photo.image.name ?? "Event photo",
      photographer: photo.uploadedBy?.username ?? "Photography Club",
      uploadDate: photo.createdAt ?? "",
      category: "Event",
      visibility: photo.visibility ?? "public",
    }));
}

export async function getCategories() {
  return [
    "PClub Photos",
    "Competition",
    "Workshop",
    "Nature",
    "Portrait",
    "Street",
    "Campus",
  ];
}

export async function uploadPhoto() {
  throw new Error("Photo uploads have not been connected yet.");
}

export async function getComments() {
  return [];
}

export async function getStatistics() {
  return {
    photographers: 0,
    views: 0,
    downloads: 0,
    likes: 0,
  };
}
