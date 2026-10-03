import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../components/util/api";

export default function UploadPhoto() {
  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("Wildlife");
  const [file, setFile] = useState(null);

  const [users, setUsers] = useState([]);
  const [capturedBy, setCapturedBy] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("authToken");

        const res = await axios.get(
          `${API_URL}/api/gallery/members`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUsers(res.data || []);
      } catch (error) {
        console.error(
          "Failed to load users:",
          error.response?.data || error
        );
      }
    };

    fetchUsers();
  }, []);

  const uploadPhoto = async () => {
    try {
      if (!file) {
        alert("Please select a photo");
        return;
      }

      if (!capturedBy) {
        alert("Please select who captured the photo");
        return;
      }

      const token = localStorage.getItem("authToken");

      const formData = new FormData();

      formData.append("files", file);
      formData.append("title", title);
      formData.append("tag", tag);
      formData.append("visibility", "public");
      formData.append("capturedBy", capturedBy);

      await axios.post(
        `${API_URL}/api/gallery/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Photo uploaded successfully!");

      setTitle("");
      setCapturedBy("");
      setFile(null);
    } catch (error) {
      console.error(
        "Photo upload error:",
        error.response?.data || error
      );

      alert("Upload failed");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-5">
      <h1 className="text-2xl font-bold">
        Upload Photo
      </h1>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="w-full border rounded-lg px-4 py-2"
      />

      <select
        value={capturedBy}
        onChange={(e) => setCapturedBy(e.target.value)}
        className="w-full border rounded-lg px-4 py-2"
      >
        <option value="">
          Select Photographer
        </option>

        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.username}
          </option>
        ))}
      </select>

      <select
        value={tag}
        onChange={(e) => setTag(e.target.value)}
        className="w-full border rounded-lg px-4 py-2"
      >
        <option>Event</option>
        <option>Workshop</option>
        <option>Portrait</option>
        <option>Nature</option>
        <option>Street</option>
        <option>Wildlife</option>
        <option>Sports</option>
        <option>Club Activity</option>
        <option>Other</option>
      </select>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button
        onClick={uploadPhoto}
        className="bg-black text-white px-5 py-2 rounded-lg"
      >
        Upload
      </button>
    </div>
  );
}