import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const colorOptions = [
  "#000000",
  "#FFFFFF",
  "#E195AB",
  "#FF6B6B",
  "#FF8C42",
  "#FFD166",
  "#06D6A0",
  "#4ECDC4",
  "#45B7D1",
  "#5B8DEF",
  "#7B61FF",
  "#9B5DE5",
  "#F15BB5",
  "#8338EC",
  "#3A86FF",
  "#264653",
  "#2A9D8F",
  "#E76F51",
];

function CreateEvent() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    Title: "",
    EventName: "",
    description: "",
    location: "",
    locationLink: "",
    dateTime: "",
    isPClubEvent: false,
    buttonLink: "",
    buttonColor: "",
    thumbnailColor: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");

      const token = localStorage.getItem("authToken");

      if (!token) {
        setMessage("Please login first.");
        return;
      }

      const eventId = `event-${Date.now()}`;

      await axios.post(
        "http://localhost:1337/api/events",
        {
          data: {
            EventId: eventId,
            Title: form.Title,
            EventName: form.EventName,
            description: form.description,
            location: form.location,
            locationLink: form.locationLink || null,
            dateTime: form.dateTime,
            isPClubEvent: form.isPClubEvent,
            buttonLink: form.buttonLink || null,
            buttonColor: form.buttonColor || null,
            thumbnailColor: form.thumbnailColor || null,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setMessage("Event created successfully!");

      setTimeout(() => {
        navigate("/events");
      }, 800);
    } catch (error) {
      console.error("Create event error:", error.response?.data || error);

      setMessage(
        error.response?.data?.error?.message || "Failed to create event.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-container mx-auto px-4 py-10">
      <button onClick={() => navigate("/events")} className="mb-6 underline">
        ← Back to Events
      </button>

      <h1 className="text-3xl font-bold mb-8">Create Event</h1>

      <form
        onSubmit={handleSubmit}
        className="max-w-2xl rounded-xl border p-6 space-y-6"
      >
        {/* Title */}
        <div>
          <label className="block font-semibold mb-2">Title</label>

          <input
            type="text"
            name="Title"
            value={form.Title}
            onChange={handleChange}
            placeholder="Enter title"
            className="w-full rounded-lg border px-4 py-2"
            required
          />
        </div>

        {/* Event Name */}
        <div>
          <label className="block font-semibold mb-2">Event Name</label>

          <input
            type="text"
            name="EventName"
            value={form.EventName}
            onChange={handleChange}
            placeholder="Enter event name"
            className="w-full rounded-lg border px-4 py-2"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block font-semibold mb-2">Description</label>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Enter event description"
            rows={5}
            className="w-full rounded-lg border px-4 py-2"
            required
          />
        </div>

        {/* Location */}
        <div>
          <label className="block font-semibold mb-2">Location</label>

          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Enter location"
            className="w-full rounded-lg border px-4 py-2"
            required
          />
        </div>

        {/* Location Link */}
        <div>
          <label className="block font-semibold mb-2">
            Location Link <span className="font-normal">(Optional)</span>
          </label>

          <input
            type="url"
            name="locationLink"
            value={form.locationLink}
            onChange={handleChange}
            placeholder="https://maps.google.com/..."
            className="w-full rounded-lg border px-4 py-2"
          />
        </div>

        {/* Date */}
        <div>
          <label className="block font-semibold mb-2">Date & Time</label>

          <input
            type="datetime-local"
            name="dateTime"
            value={form.dateTime}
            onChange={handleChange}
            className="w-full rounded-lg border px-4 py-2"
            required
          />
        </div>

        {/* PClub */}
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            name="isPClubEvent"
            checked={form.isPClubEvent}
            onChange={handleChange}
            className="h-4 w-4"
          />

          <span className="font-semibold">This is a PClub Event</span>
        </label>

        {/* Button Link */}
        <div>
          <label className="block font-semibold mb-2">
            Button Link <span className="font-normal">(Optional)</span>
          </label>

          <input
            type="url"
            name="buttonLink"
            value={form.buttonLink}
            onChange={handleChange}
            placeholder="https://..."
            className="w-full rounded-lg border px-4 py-2"
          />
        </div>

        {/* Button Color */}
        {form.buttonLink.trim() && (
          <div>
            <label className="block font-semibold mb-3">
              Button Color <span className="font-normal">(Optional)</span>
            </label>

            <div className="grid grid-cols-6 sm:grid-cols-9 gap-3">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      buttonColor: color,
                    }))
                  }
                  className={`h-9 w-9 rounded-full border-2 transition-transform hover:scale-110 ${
                    form.buttonColor === color
                      ? "border-black scale-110 ring-2 ring-gray-300"
                      : "border-gray-200"
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        )}

        {/* Thumbnail Color */}
        {form.buttonLink.trim() && (
          <div>
            <label className="block font-semibold mb-3">
              Thumbnail Color <span className="font-normal">(Optional)</span>
            </label>

            <div className="grid grid-cols-6 sm:grid-cols-9 gap-3">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      thumbnailColor: color,
                    }))
                  }
                  className={`h-9 w-9 rounded-full border-2 transition-transform hover:scale-110 ${
                    form.thumbnailColor === color
                      ? "border-black scale-110 ring-2 ring-gray-300"
                      : "border-gray-200"
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:bg-red-400 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Event"}
        </button>

        {message && <p className="font-medium">{message}</p>}
      </form>
    </div>
  );
}

export default CreateEvent;
