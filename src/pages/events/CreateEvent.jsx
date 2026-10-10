
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../../components/util/api";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  ImagePlus,
  X,
  Link as LinkIcon,
  UserRound,
  Target,
  Sparkles,
  Camera,
  Upload,
  CheckCircle2,
} from "lucide-react";

function CreateEvent() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    Title: "",
    EventName: "",
    description: "",
    location: "",
    locationLink: "",
    dateTime: "",
    isPClubEvent: false,
    objectives: "",
    highlights: "",
    contactPerson: "",
    portfolioLink: "",
  });

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!thumbnailFile) {
      setThumbnailPreview("");
      return;
    }

    const previewUrl = URL.createObjectURL(thumbnailFile);
    setThumbnailPreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [thumbnailFile]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Please select an image file.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("Image size must be 5 MB or less.");
      e.target.value = "";
      return;
    }

    setMessage("");
    setThumbnailFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("authToken");

    if (!token) {
      setMessage("Please login first.");
      return;
    }

    if (Number.isNaN(new Date(form.dateTime).getTime())) {
      setMessage("Please enter a valid event date and time.");
      return;
    }

    if (form.portfolioLink.trim()) {
      try {
        const url = new URL(form.portfolioLink.trim());

        if (!["http:", "https:"].includes(url.protocol)) {
          throw new Error("Invalid URL");
        }
      } catch {
        setMessage("Please enter a valid portfolio or Instagram URL.");
        return;
      }
    }

    if (form.locationLink.trim()) {
      try {
        const url = new URL(form.locationLink.trim());

        if (!["http:", "https:"].includes(url.protocol)) {
          throw new Error("Invalid URL");
        }
      } catch {
        setMessage("Please enter a valid location URL.");
        return;
      }
    }

    setLoading(true);
    setMessage("");

    try {
      let thumbnailMediaId = null;

      if (thumbnailFile) {
        const uploadData = new FormData();
        uploadData.append("files", thumbnailFile);

        const uploadResponse = await axios.post(
          `${API_URL}/api/gallery/event-thumbnail/upload`,
          uploadData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const uploadedMedia = uploadResponse.data?.media;

        if (!uploadedMedia?.id) {
          throw new Error("Thumbnail upload failed. Please try again.");
        }

        thumbnailMediaId = uploadedMedia.id;
      }

      const eventData = {
        EventId: `event-${Date.now()}`,
        Title: form.Title.trim(),
        EventName: form.EventName.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        locationLink: form.locationLink.trim() || null,
        dateTime: new Date(form.dateTime).toISOString(),
        isPClubEvent: form.isPClubEvent,
        contactPerson: form.contactPerson.trim() || null,
        objectives: form.objectives
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
        highlights: form.highlights
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
        portfolioLink: form.portfolioLink.trim() || null,
      };

      if (thumbnailMediaId !== null) {
        eventData.thumbnailPic = thumbnailMediaId;
      }

      await axios.post(
        `${API_URL}/api/events`,
        { data: eventData },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate("/events");
    } catch (error) {
      console.error(
        "Create event error:",
        error.response?.data || error
      );

      setMessage(
        error.response?.data?.error?.message ||
          error.message ||
          "Failed to create event."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-100";

  const labelClass = "mb-2 block text-sm font-semibold text-gray-800";

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <button
          type="button"
          onClick={() => navigate("/events")}
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-black"
        >
          <ArrowLeft size={18} />
          Back to Events
        </button>

        <header className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-red-500">
            Photography Club NITK
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Create an Event
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
            Bring your event to life. Add the details, upload a cover image,
            and share the information attendees need.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <SectionHeading
              icon={<CalendarDays size={21} />}
              title="Event details"
              subtitle="The basic information about your event."
            />

            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-8">
              <div>
                <label className={labelClass}>Event Title *</label>
                <input
                  name="Title"
                  value={form.Title}
                  onChange={handleChange}
                  placeholder="e.g. Photography Workshop"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Event Name *</label>
                <input
                  name="EventName"
                  value={form.EventName}
                  onChange={handleChange}
                  placeholder="Enter the event name"
                  className={inputClass}
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Description *</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe the event, activities, and what attendees can expect..."
                  rows={5}
                  className={`${inputClass} resize-y`}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Date & Time *</label>
                <input
                  type="datetime-local"
                  name="dateTime"
                  value={form.dateTime}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Event Category</label>
                <label className="flex min-h-[48px] cursor-pointer items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 transition hover:bg-gray-50">
                  <input
                    type="checkbox"
                    name="isPClubEvent"
                    checked={form.isPClubEvent}
                    onChange={handleChange}
                    className="h-4 w-4 accent-black"
                  />
                  <span className="text-sm font-medium text-gray-800">
                    This is a PClub event
                  </span>
                </label>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <SectionHeading
              icon={<MapPin size={21} />}
              title="Location & contact"
              subtitle="Help attendees find the venue and contact the organizer."
            />

            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-8">
              <div>
                <label className={labelClass}>Venue / Location *</label>
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="e.g. NITK Surathkal"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Location Link</label>
                <input
                  type="url"
                  name="locationLink"
                  value={form.locationLink}
                  onChange={handleChange}
                  placeholder="https://maps.google.com/..."
                  className={inputClass}
                />
                <p className="mt-2 text-xs text-gray-500">Optional</p>
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Contact Person</label>
                <div className="relative">
                  <UserRound
                    size={18}
                    className="absolute left-3 top-3.5 text-gray-400"
                  />
                  <input
                    name="contactPerson"
                    value={form.contactPerson}
                    onChange={handleChange}
                    placeholder="Name of the event contact"
                    className={`${inputClass} pl-10`}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">Optional</p>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <SectionHeading
              icon={<Camera size={21} />}
              title="Event thumbnail"
              subtitle="Choose a cover image to make your event stand out."
            />

            <div className="p-5 sm:p-8">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="hidden"
              />

              {thumbnailPreview ? (
                <div className="relative overflow-hidden rounded-xl border border-gray-200">
                  <img
                    src={thumbnailPreview}
                    alt="Event thumbnail preview"
                    className="max-h-96 w-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-black/75 to-transparent p-4 pt-12">
                    <span className="truncate text-sm font-medium text-white">
                      {thumbnailFile?.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setThumbnailFile(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
                      className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-gray-900 transition hover:bg-red-50"
                    >
                      <X size={16} />
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex min-h-56 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-5 py-8 text-center transition hover:border-red-300 hover:bg-red-50/40"
                >
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-red-500 shadow-sm">
                    <ImagePlus size={26} />
                  </div>
                  <span className="font-semibold text-gray-900">
                    Click to upload a thumbnail
                  </span>
                  <span className="mt-2 text-sm text-gray-500">
                    JPG, PNG, or other image formats · Maximum 5 MB
                  </span>
                </button>
              )}

              {thumbnailPreview && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-3 text-sm font-semibold text-gray-700 underline underline-offset-4 hover:text-red-500"
                >
                  Choose a different image
                </button>
              )}
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <SectionHeading
              icon={<Sparkles size={21} />}
              title="Objectives & highlights"
              subtitle="Tell visitors what the event aims to achieve and what makes it special."
            />

            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-8">
              <div>
                <label className={labelClass}>
                  <span className="inline-flex items-center gap-2">
                    <Target size={16} />
                    Objectives
                  </span>
                </label>
                <textarea
                  name="objectives"
                  value={form.objectives}
                  onChange={handleChange}
                  placeholder={"Learn photography basics\nPractice composition"}
                  rows={5}
                  className={`${inputClass} resize-y`}
                />
                <p className="mt-2 text-xs text-gray-500">
                  Enter one objective per line. Optional.
                </p>
              </div>

              <div>
                <label className={labelClass}>
                  <span className="inline-flex items-center gap-2">
                    <Sparkles size={16} />
                    Event Highlights
                  </span>
                </label>
                <textarea
                  name="highlights"
                  value={form.highlights}
                  onChange={handleChange}
                  placeholder={"Live demonstrations\nHands-on activities"}
                  rows={5}
                  className={`${inputClass} resize-y`}
                />
                <p className="mt-2 text-xs text-gray-500">
                  Enter one highlight per line. Optional.
                </p>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <SectionHeading
              icon={<LinkIcon size={21} />}
              title="Portfolio & social links"
              subtitle="Let attendees discover the organizer's work."
            />

            <div className="p-5 sm:p-8">
              <label className={labelClass}>
                Portfolio / Instagram URL
              </label>
              <input
                type="url"
                name="portfolioLink"
                value={form.portfolioLink}
                onChange={handleChange}
                placeholder="https://www.instagram.com/your_page/"
                className={inputClass}
              />
              <p className="mt-2 text-xs text-gray-500">
                Optional. Add an Instagram page or portfolio website.
              </p>
            </div>
          </section>

          {message && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
            >
              {message}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <p className="text-xs leading-5 text-gray-500">
              Fields marked * are required. Other fields are optional.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate("/events")}
                disabled={loading}
                className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Uploading & Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    Create Event
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}

function SectionHeading({ icon, title, subtitle }) {
  return (
    <div className="flex items-start gap-3 border-b border-gray-100 px-5 py-5 sm:px-8">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
        {icon}
      </div>
      <div>
        <h2 className="font-semibold text-gray-900">{title}</h2>
        <p className="mt-1 text-sm leading-5 text-gray-500">{subtitle}</p>
      </div>
    </div>
  );
}

export default CreateEvent;
