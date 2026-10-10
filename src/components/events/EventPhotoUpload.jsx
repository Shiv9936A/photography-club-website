
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../util/api";
import {
  canUploadPhoto,
  getPhotoUploadSession,
} from "../photoReels/photoUploadAccess";
import {
  ArrowLeft,
  Upload,
  ImagePlus,
  X,
  Images,
  Globe,
  LockKeyhole,
  CheckCircle2,
} from "lucide-react";

function EventPhotoUpload() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [files, setFiles] = useState([]);
  const [visibility, setVisibility] = useState("public");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [dragging, setDragging] = useState(false);

  const session = getPhotoUploadSession();
  const allowed = canUploadPhoto(session);

  useEffect(() => {
    if (!allowed) navigate(`/events/${id}`, { replace: true });
  }, [allowed, id, navigate]);

  const addFiles = (selectedFiles) => {
    const selected = Array.from(selectedFiles || []);
    if (!selected.length) return;

    const invalid = selected.filter(
      (file) => !file.type.startsWith("image/")
    );

    if (invalid.length) {
      setMessage("Please select image files only.");
      return;
    }

    const oversized = selected.filter(
      (file) => file.size > 10 * 1024 * 1024
    );

    if (oversized.length) {
      setMessage("Each image must be 10 MB or smaller.");
      return;
    }

    setMessage("");
    setFiles((previous) => {
      const combined = [...previous, ...selected];
      return combined.filter(
        (file, index, array) =>
          array.findIndex(
            (item) =>
              item.name === file.name &&
              item.size === file.size &&
              item.lastModified === file.lastModified
          ) === index
      );
    });
  };

  const removeFile = (indexToRemove) => {
    setFiles((previous) =>
      previous.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleUpload = async () => {
    if (!files.length) {
      setMessage("Please select at least one photo.");
      return;
    }

    if (!session?.token) {
      navigate(`/events/${id}`, { replace: true });
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      const eventsRes = await axios.get(`${API_URL}/api/events`);
      const event = (eventsRes.data.data || []).find(
        (item) => String(item.EventId) === String(id)
      );

      if (!event?.documentId) {
        setMessage("Event not found.");
        return;
      }

      const formData = new FormData();
      formData.append("event", event.documentId);
      formData.append("visibility", visibility);
      files.forEach((file) => formData.append("files", file));

      await axios.post(
        `${API_URL}/api/gallery/event/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${session.token}`,
          },
        }
      );

      navigate(`/events/${id}`);
    } catch (error) {
      setMessage(
        error.response?.data?.error?.message ||
          "Failed to upload photos. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  if (!allowed) return null;

  return (
    <main className="min-h-[70vh] bg-gray-50 px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <button
          type="button"
          onClick={() => navigate(`/events/${id}`)}
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-black"
        >
          <ArrowLeft size={18} />
          Back to Event
        </button>

        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-red-500">
            Photography Club NITK
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Add Event Photos
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
            Share the moments that made this event special. Select your
            photos and choose who can view them.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-5 sm:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500">
                <Images size={22} />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">
                  Photo collection
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {files.length
                    ? `${files.length} photo${files.length === 1 ? "" : "s"} selected`
                    : "Choose one or more image files"}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-7 p-5 sm:p-8">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(event) => {
                addFiles(event.target.files);
                event.target.value = "";
              }}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                addFiles(event.dataTransfer.files);
              }}
              className={`flex min-h-56 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed px-5 py-8 text-center transition ${
                dragging
                  ? "border-red-400 bg-red-50"
                  : "border-gray-300 bg-gray-50 hover:border-red-300 hover:bg-red-50/40"
              }`}
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-red-500 shadow-sm">
                <ImagePlus size={27} />
              </div>
              <span className="font-semibold text-gray-900">
                Drop your photos here or browse
              </span>
              <span className="mt-2 text-sm text-gray-500">
                Images only · Maximum 10 MB per image
              </span>
            </button>

            {files.length > 0 && (
              <section>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-gray-900">
                    Selected photos
                  </h3>
                  <button
                    type="button"
                    onClick={() => setFiles([])}
                    className="text-sm font-medium text-red-600 hover:text-red-700"
                  >
                    Clear all
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {files.map((file, index) => (
                    <PhotoPreview
                      key={`${file.name}-${file.size}-${file.lastModified}`}
                      file={file}
                      onRemove={() => removeFile(index)}
                    />
                  ))}
                </div>
              </section>
            )}

            <section>
              <h3 className="mb-3 font-semibold text-gray-900">
                Photo visibility
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setVisibility("public")}
                  className={`rounded-xl border p-4 text-left transition ${
                    visibility === "public"
                      ? "border-gray-900 bg-gray-50 ring-1 ring-gray-900"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Globe size={21} className="text-gray-700" />
                    {visibility === "public" && (
                      <CheckCircle2 size={19} className="text-green-600" />
                    )}
                  </div>
                  <p className="mt-3 font-semibold text-gray-900">Public</p>
                  <p className="mt-1 text-sm leading-5 text-gray-500">
                    Visible to visitors in the event gallery.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setVisibility("private")}
                  className={`rounded-xl border p-4 text-left transition ${
                    visibility === "private"
                      ? "border-gray-900 bg-gray-50 ring-1 ring-gray-900"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <LockKeyhole size={21} className="text-gray-700" />
                    {visibility === "private" && (
                      <CheckCircle2 size={19} className="text-green-600" />
                    )}
                  </div>
                  <p className="mt-3 font-semibold text-gray-900">Private</p>
                  <p className="mt-1 text-sm leading-5 text-gray-500">
                    Restricted according to your existing gallery access rules.
                  </p>
                </button>
              </div>
            </section>

            {message && (
              <p
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
              >
                {message}
              </p>
            )}

            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-5 text-gray-500">
                {files.length
                  ? `${files.length} photo${files.length === 1 ? "" : "s"} ready to upload`
                  : "Select photos to get started."}
              </p>
              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading || !files.length}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-6 py-3 font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Upload size={18} />
                {uploading ? "Uploading photos..." : "Upload Photos"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function PhotoPreview({ file, onRemove }) {
  const [preview, setPreview] = useState("");

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
      {preview ? (
        <img
          src={preview}
          alt={file.name}
          className="aspect-square w-full object-cover"
        />
      ) : (
        <div className="aspect-square animate-pulse bg-gray-200" />
      )}

      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${file.name}`}
        title="Remove photo"
        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-red-600"
      >
        <X size={16} />
      </button>

      <div className="truncate px-3 py-2 text-xs text-gray-600">
        {file.name}
      </div>
    </div>
  );
}

export default EventPhotoUpload;
