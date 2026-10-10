
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../components/util/api";
import {
  canUploadPhoto,
  getPhotoUploadSession,
} from "../../components/photoReels/photoUploadAccess";
import {
  ArrowLeft,
  Camera,
  ImagePlus,
  X,
  Globe,
  LockKeyhole,
  CheckCircle2,
  CalendarDays,
  Tag,
  UserRound,
  Upload,
} from "lucide-react";

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
  const fileInputRef = useRef(null);
  const session = getPhotoUploadSession();
  const allowed = canUploadPhoto(session);

  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [capturedDate, setCapturedDate] = useState("");
  const [tag, setTag] = useState("Other");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!allowed) {
      navigate("/photo-reels", { replace: true });
    }
  }, [allowed, navigate]);

  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }

    const url = URL.createObjectURL(file);
    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleFileChange = (event) => {
    const selected = event.target.files?.[0];

    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      setMessage("Please select an image file.");
      event.target.value = "";
      return;
    }

    setMessage("");
    setFile(selected);
  };

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

      setTitle("");
      setFile(null);
      setVisibility("public");
      setCapturedDate("");
      setTag("Other");

      navigate("/photo-reels");
    } catch (error) {
      console.error("Photo upload failed:", error.response?.data || error);

      setMessage(
        error.response?.data?.error?.message || "Photo upload failed."
      );
    } finally {
      setUploading(false);
    }
  };

  if (!allowed) return null;

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-100";

  const labelClass = "mb-2 block text-sm font-semibold text-gray-800";

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <button
          type="button"
          onClick={() => navigate("/photo-reels")}
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-black"
        >
          <ArrowLeft size={18} />
          Back to Photo Reel
        </button>

        <header className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-red-500">
            Photography Club NITK
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Upload a Photo
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
            Share your photography with the community. Add a title, choose a
            category, and set the visibility of your photo.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <SectionHeading
              icon={<Camera size={21} />}
              title="Photo details"
              subtitle="Give your photo a title and select the image."
            />

            <div className="space-y-5 p-5 sm:p-8">
              <div>
                <label htmlFor="photo-title" className={labelClass}>
                  Photo Title
                </label>
                <input
                  id="photo-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Give your photo a meaningful title"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Image *</label>

                <input
                  ref={fileInputRef}
                  id="photo-image"
                  type="file"
                  accept="image/*"
                  required={!file}
                  onChange={handleFileChange}
                  className="hidden"
                />

                {preview ? (
                  <div className="relative overflow-hidden rounded-xl border border-gray-200">
                    <img
                      src={preview}
                      alt="Selected photo preview"
                      className="max-h-[460px] w-full object-contain bg-gray-100"
                    />

                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-black/75 to-transparent p-4 pt-12">
                      <span className="truncate text-sm font-medium text-white">
                        {file?.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setFile(null);
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
                      Click to choose your photo
                    </span>
                    <span className="mt-2 text-sm text-gray-500">
                      Select an image from your device
                    </span>
                  </button>
                )}

                {preview && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-3 text-sm font-semibold text-gray-700 underline underline-offset-4 hover:text-red-500"
                  >
                    Choose a different image
                  </button>
                )}
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <SectionHeading
              icon={<Tag size={21} />}
              title="Classification"
              subtitle="Organize your photo for easier discovery."
            />

            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-8">
              <div>
                <label htmlFor="photo-tag" className={labelClass}>
                  Photo Category
                </label>
                <select
                  id="photo-tag"
                  value={tag}
                  onChange={(event) => setTag(event.target.value)}
                  className={inputClass}
                >
                  {TAGS.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="photo-captured-date" className={labelClass}>
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays size={16} />
                    Captured Date
                  </span>
                </label>
                <input
                  id="photo-captured-date"
                  type="date"
                  value={capturedDate}
                  onChange={(event) => setCapturedDate(event.target.value)}
                  className={inputClass}
                />
                <p className="mt-2 text-xs text-gray-500">Optional</p>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="photo-captured-by" className={labelClass}>
                  <span className="inline-flex items-center gap-2">
                    <UserRound size={16} />
                    Captured By
                  </span>
                </label>
                <input
                  id="photo-captured-by"
                  value={session?.name || session?.email || "Current user"}
                  readOnly
                  className={`${inputClass} cursor-not-allowed bg-gray-100`}
                />
                <p className="mt-2 text-xs text-gray-500">
                  Assigned to your authenticated account.
                </p>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <SectionHeading
              icon={<Globe size={21} />}
              title="Photo visibility"
              subtitle="Choose who can see this photo."
            />

            <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-8">
              <VisibilityOption
                active={visibility === "public"}
                onClick={() => setVisibility("public")}
                icon={<Globe size={21} />}
                title="Public"
                description="Available in the public Photo Reel."
              />

              <VisibilityOption
                active={visibility === "private"}
                onClick={() => setVisibility("private")}
                icon={<LockKeyhole size={21} />}
                title="Private"
                description="Restricted according to existing access rules."
              />
            </div>
          </section>

          {message && (
            <div
              role="status"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
            >
              {message}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <p className="text-xs leading-5 text-gray-500">
              Your photo will be uploaded using your current account permissions.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate("/photo-reels")}
                disabled={uploading}
                className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={uploading || !file}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    Upload Photo
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

function VisibilityOption({
  active,
  onClick,
  icon,
  title,
  description,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border p-4 text-left transition ${
        active
          ? "border-gray-900 bg-gray-50 ring-1 ring-gray-900"
          : "border-gray-200 hover:border-gray-400"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-gray-700">{icon}</span>
        {active && <CheckCircle2 size={19} className="text-green-600" />}
      </div>
      <p className="mt-3 font-semibold text-gray-900">{title}</p>
      <p className="mt-1 text-sm leading-5 text-gray-500">{description}</p>
    </button>
  );
}
