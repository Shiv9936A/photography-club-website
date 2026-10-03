import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function EventPhotoUpload() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [files, setFiles] = useState([]);
  const [visibility, setVisibility] = useState("public");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("authToken");

  let user = null;

  try {
    if (token) {
      user = JSON.parse(atob(token.split(".")[1]));
    }
  } catch {
    user = null;
  }

  // const canManageEvent =
  //   user?.appRole === "admin" || user?.appRole === "sig-coordinator";
const canManageEvent =
  user?.role === "admin" || user?.role === "sig-coordinator";

  useEffect(() => {
    if (!canManageEvent) {
      navigate(`/events/${id}`);
    }
  }, [canManageEvent, id, navigate]);

  const handleUpload = async () => {
    if (!files.length) {
      setMessage("Please select photos.");
      return;
    }

    try {
      setUploading(true);
      setMessage("");

      // Get event documentId from EventId
      const eventsRes = await axios.get(
        "http://localhost:1337/api/events"
      );

      const event = eventsRes.data.data.find(
        (item) => String(item.EventId) === String(id)
      );

      if (!event) {
        setMessage("Event not found.");
        return;
      }

      const formData = new FormData();

      formData.append("event", event.documentId);
      formData.append("visibility", visibility);

      files.forEach((file) => {
        formData.append("files", file);
      });

      await axios.post(
        "http://localhost:1337/api/gallery/event/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("Photos uploaded successfully.");
      setFiles([]);

      setTimeout(() => {
        navigate(`/events/${id}`);
      }, 1000);
    } catch (error) {
      console.error(
        "Event photo upload error:",
        error.response?.data || error
      );

      setMessage(
        error.response?.data?.error?.message ||
          "Failed to upload photos."
      );
    } finally {
      setUploading(false);
    }
  };

  if (!canManageEvent) {
    return null;
  }

  return (
    <div className="max-w-container mx-auto px-4 py-8">
      <button
        onClick={() => navigate(`/events/${id}`)}
        className="mb-6 underline"
      >
        ← Back to Event
      </button>

      <h1 className="text-3xl font-bold mb-6">
        Add Event Photos
      </h1>

      <div className="rounded-xl border p-6 space-y-6">
        <div>
          <label className="block font-semibold mb-2">
            Select Photos
          </label>

          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files))}
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">
            Visibility
          </label>

          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>

        {files.length > 0 && (
          <p className="text-sm text-gray-600">
            {files.length} photo(s) selected
          </p>
        )}

        <button
          onClick={handleUpload}
          disabled={uploading}
          className="rounded-lg bg-primary px-5 py-2 text-white disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload Photos"}
        </button>

        {message && (
          <p className="text-sm font-medium">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default EventPhotoUpload;