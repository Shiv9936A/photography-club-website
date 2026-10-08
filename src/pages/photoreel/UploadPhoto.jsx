import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../components/util/api";
import {
  canUploadPhoto,
  getPhotoUploadSession,
} from "../../components/photoReels/photoUploadAccess";

const TAGS = [
  "Event",
  "Workshop",
  "Portrait",
  "Nature",
  "Street",
  "Wildlife",
  "Sports",
  "Club Activity",
  "Other",
];

export default function UploadPhoto() {
  const navigate = useNavigate();
  const session = getPhotoUploadSession();
  const allowed = canUploadPhoto(session);

  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [visibility, setVisibility] = useState("public");
  const [capturedDate, setCapturedDate] = useState("");
  const [tag, setTag] = useState("Other");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!allowed) {
      navigate("/photo-reels", { replace: true });
      return;
    }

  }, [allowed, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!allowed || !session?.token) {
      navigate("/photo-reels", { replace: true });
      return;
    }

    if (!file) {
      setMessage("Choose an image to upload.");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("files", file);
      formData.append("title", title.trim());
      formData.append("visibility", visibility);
      formData.append("capturedDate", capturedDate);
      formData.append("tag", tag);

      await axios.post(`${API_URL}/api/gallery/upload`, formData, {
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      });

      setMessage("Photo uploaded successfully.");
      setTitle("");
      setFile(null);
      setVisibility("public");
      setCapturedDate("");
      setTag("Other");
      navigate("/photo-reels");
    } catch (error) {
      console.error("Photo upload failed:", error.response?.data || error);
      setMessage(
        error.response?.data?.error?.message || "Photo upload failed.",
      );
    } finally {
      setUploading(false);
    }
  };

  if (!allowed) return null;

  return (
    <div className="max-w-xl mx-auto p-6 space-y-5">
      <h1 className="text-2xl font-bold">Upload Photo</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="photo-title" className="block mb-2 font-medium">
            Title
          </label>
          <input
            id="photo-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full border rounded-lg px-4 py-2"
          />
        </div>

        <div>
          <label htmlFor="photo-image" className="block mb-2 font-medium">
            Image
          </label>
          <input
            id="photo-image"
            type="file"
            accept="image/*"
            required
            onChange={(event) => setFile(event.target.files?.[0] || null)}
          />
        </div>

        <div>
          <label htmlFor="photo-visibility" className="block mb-2 font-medium">
            Visibility
          </label>
          <select
            id="photo-visibility"
            value={visibility}
            onChange={(event) => setVisibility(event.target.value)}
            className="w-full border rounded-lg px-4 py-2"
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>

        <div>
          <label htmlFor="photo-captured-date" className="block mb-2 font-medium">
            Captured Date
          </label>
          <input
            id="photo-captured-date"
            type="date"
            value={capturedDate}
            onChange={(event) => setCapturedDate(event.target.value)}
            className="w-full border rounded-lg px-4 py-2"
          />
        </div>

        <div>
          <label htmlFor="photo-captured-by" className="block mb-2 font-medium">
            Captured By
          </label>
          <input
            id="photo-captured-by"
            value={session?.name || session?.email || "Current user"}
            readOnly
            className="w-full border rounded-lg px-4 py-2 bg-gray-100"
          />
          <p className="mt-1 text-xs text-gray-500">
            Assigned to your authenticated account.
          </p>
        </div>

        <div>
          <label htmlFor="photo-tag" className="block mb-2 font-medium">
            Tag
          </label>
          <select
            id="photo-tag"
            value={tag}
            onChange={(event) => setTag(event.target.value)}
            className="w-full border rounded-lg px-4 py-2"
          >
            {TAGS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="bg-black text-white px-5 py-2 rounded-lg disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload Photo"}
        </button>

        {message && <p role="status" className="text-sm">{message}</p>}
      </form>
    </div>
  );
}
