import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useLocation } from "react-router";
import { useNavigate } from "react-router-dom";
import MarkdownPreview from "@uiw/react-markdown-preview";
import noiseImage from "../../assets/images/noise.png";
import { ArrowLeft } from "lucide-react";
import { GrLocation } from "react-icons/gr";
import { MdDownload, MdEvent } from "react-icons/md";
import { formatDateTime, getDifference } from "../../utils/dateHelpers";
import { navigateSmooth } from "../../utils/helperFunctions";
import { saveAs } from "file-saver";
import { API_URL } from "../../components/util/api";
import { canUploadPhoto, getPhotoUploadSession } from "../../components/photoReels/photoUploadAccess";

function EventPage() {
  const { id } = useParams();

  const navigate = useNavigate();
  const location = useLocation();
  const [eventData, setEventData] = useState(null);
  const [eventImages, setEventImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const session = getPhotoUploadSession();
  const canManageEvent = canUploadPhoto(session);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventsRes = await axios.get("http://localhost:1337/api/events");
        const events = eventsRes.data.data || [];
        const currentEvent = events.find(
          (event) => String(event.EventId) === String(id),
        );

        setEventData(currentEvent || null);
        if (!currentEvent?.documentId) {
          setEventImages([]);
          return;
        }

        const publicRes = await axios.get(
          `${API_URL}/api/gallery/public?event=${encodeURIComponent(currentEvent.documentId)}`,
        );
        let photos = publicRes.data.photos || [];
        const token = localStorage.getItem("authToken");
        if (token) {
          try {
            const privateRes = await axios.get(
              `${API_URL}/api/gallery/private?event=${encodeURIComponent(currentEvent.documentId)}`,
              { headers: { Authorization: `Bearer ${token}` } },
            );
            photos = photos.concat(privateRes.data.photos || []);
          } catch (error) {
            // Private photos are optional for visitors and non-NITK users.
          }
        }
        const uniquePhotos = Array.from(
          new Map(photos.map((photo) => [photo.documentId || photo.id, photo])).values(),
        );
        setEventImages(uniquePhotos.filter((photo) => photo.image?.url).map((photo) => ({
          src: photo.image.url.startsWith("http") ? photo.image.url : `${API_URL}${photo.image.url}`,
          name: photo.image.name || photo.title || "event-photo.jpg",
        })));
      } catch (error) {
        console.error("Failed to load event:", error);
        setEventData(null);
      }
    };

    fetchEvent();
  }, [id]);
  // Determine if user came from home page
  const isFromHome = location.state?.from === "home";
  const path = isFromHome ? "/" : "/events";

  const backToPrevious = () => {
    const scrollPositionY = sessionStorage.getItem("scrollPositionY");
    navigateSmooth(navigate, path, "", parseInt(scrollPositionY || 0));
    if (scrollPositionY) sessionStorage.removeItem("scrollPositionY");
  };

  const downloadImage = (url, name) => saveAs(url, name);

  return (
    <div className="max-w-container md:max-w-[80%] lg:max-w-[60%] mx-auto px-4 py-8">
      <button
        onClick={backToPrevious}
        className="flex items-center text-quaternary hover:text-primary mb-8 group"
      >
        <ArrowLeft className="h-5 w-5 mr-2 transition-transform group-hover:-translate-x-1" />
        {isFromHome ? "Go Back" : "All Events"}
      </button>

      {/* Event Hero */}
      <div
        className="relative overflow-hidden rounded-xl mb-8"
        style={{
          backgroundColor: eventData?.thumbnailColor || "#E195AB",
        }}
      >
        <img
          src={noiseImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay"
        />

        <div className="relative z-10 flex flex-col items-center text-center px-6 py-10 md:py-14">
          {/* Event Name */}
          <p className="mb-3 text-xs md:text-sm font-semibold uppercase tracking-[0.35em] text-white/80">
            {eventData?.EventName}
          </p>

          {/* Title */}
          <h1 className="font-playfair text-4xl md:text-6xl lg:text-7xl font-semibold leading-tight tracking-tight text-white drop-shadow-lg uppercase">
            {eventData?.Title}
          </h1>

          {/* Countdown */}
          <div className="mt-5 inline-flex rounded-full border border-white/30 bg-black/10 px-5 py-2 backdrop-blur-sm">
            <p className="text-sm md:text-base font-medium uppercase tracking-[0.18em] text-white">
              {eventData?.dateTime && getDifference(eventData.dateTime)}
            </p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Date */}
        <div className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100">
            <MdEvent size={22} className="text-gray-600" />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Date & Time
            </p>

            <p className="mt-1 font-semibold text-gray-800">
              {formatDateTime(eventData?.dateTime)}
            </p>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100">
            <GrLocation size={21} className="text-gray-600" />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Location
            </p>

            {eventData?.locationLink ? (
              <a
                href={eventData.locationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block font-semibold text-gray-800 underline decoration-gray-300 underline-offset-4 transition hover:text-primary"
              >
                {eventData.location}
              </a>
            ) : (
              <p className="mt-1 font-semibold text-gray-800">
                {eventData?.location}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* RSVP Button */}
      {eventData?.buttonLink && (
        <div className="flex justify-center mb-10">
          <a
            href={eventData.buttonLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              backgroundColor: eventData.buttonColor || "#000000",
            }}
            className="inline-flex items-center justify-center rounded-full px-8 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            RSVP Here
          </a>
        </div>
      )}
      <hr className="border-t-3 border-secondary my-10" />
      <div className="mb-10 rounded-xl bg-gray-50 px-6 py-7 md:px-8">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-gray-400">
          About the Event
        </p>

        <p className="text-[17px] md:text-[18px] leading-8 text-gray-700 font-sans tracking-wide">
          {eventData?.description
            ? eventData.description.charAt(0).toUpperCase() +
              eventData.description.slice(1)
            : ""}
        </p>
      </div>

      <hr className="border-t-3 border-secondary my-10" />
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Captured Moments from NITK Events</h2>
        {canManageEvent && (
          <button onClick={() => navigate(`/events/${id}/upload`)} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-red-400">
            Add Photos
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {eventImages.map((image, index) => (
          <div key={`${image.src}-${index}`} className="relative group">
            <img src={image.src} alt={`Event ${index + 1}`} className="w-full h-40 object-cover rounded-lg cursor-pointer" onClick={() => setSelectedImage(image.src)} />
            <button onClick={() => downloadImage(image.src, image.name)} className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-100 lg:opacity-0 md:group-hover:opacity-100 transition">
              <MdDownload size={20} />
            </button>
          </div>
        ))}
      </div>
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50" onClick={() => setSelectedImage(null)}>
          <img src={selectedImage} alt="Enlarged event" className="max-w-[90%] max-h-[80%] rounded-lg" />
        </div>
      )}

    </div>
  );
}

const thisEvent = {
  id: "owggk48lyus8ohcrih5nd8r9",
  title: "Incident '25",
  content: `# Join Us for Incident '25 at NITK 2025!

**You're Invited!**

Get ready for an exciting multi-day experience at NITK's Main Building. This is your chance to be part of Incident '25, our premier event of 2025!

**Event Details:**

- **Event Name:** Incident '25
- **Date & Time:** March 04, 2025, 10:00 AM to March 08, 2025, 11:00 AM
- **Location:** Main Building, NITK

Don't miss out on this great opportunity to connect, learn, and celebrate. Mark your calendar, and we look forward to seeing you there!

[RSVP Here](#)`,
  action: { text: "RSVP Here", link: "#" },
  location: "Main Building, NITK",
  locationLink: "https://goo.gl/maps/1234567890",
  dateTime: "2025-02-16T10:00:00/2025-02-16T12:00:00",
  thumbnailColor: "#E195AB",
};

export default EventPage;
