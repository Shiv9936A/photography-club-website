import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { AlertCircle, CheckCircle2, ImageUp, Loader2, Trash2 } from "lucide-react";
import { uploadPhoto } from "../../../services/eventsService";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/jpg"];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function UploadSection({ event, categories, onSuccess }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [caption, setCaption] = useState("");
  const [eventPlace, setEventPlace] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const categoryOptions = useMemo(
    () => categories.length > 0 ? categories : ["PClub Photos", "Campus", "Events", "Nature", "Portrait", "Others"],
    [categories]
  );
  const [category, setCategory] = useState(categoryOptions[0]);

  const previews = useMemo(
    () => selectedFiles.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [selectedFiles]
  );

  useEffect(() => {
    return () => previews.forEach((preview) => URL.revokeObjectURL(preview.url));
  }, [previews]);

  useEffect(() => {
    if (!categoryOptions.includes(category)) setCategory(categoryOptions[0]);
  }, [category, categoryOptions]);

  const addFiles = (files) => {
    const incomingFiles = Array.from(files);
    const validFiles = [];
    const errors = [];

    incomingFiles.forEach((file) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        errors.push(`${file.name} is not a supported image format.`);
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name} is larger than 10 MB.`);
        return;
      }

      validFiles.push(file);
    });

    if (validFiles.length > 0) {
      setSelectedFiles((current) => [...current, ...validFiles]);
    }

    setError(errors[0] || "");
  };

  const removeFile = (index) => {
    setSelectedFiles((current) => current.filter((_, fileIndex) => fileIndex !== index));
    setError("");
  };

  const handleFileChange = (eventChange) => {
    addFiles(eventChange.target.files);
    eventChange.target.value = "";
  };

  const handleDragOver = (eventDrag) => {
    eventDrag.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (eventDrag) => {
    if (!eventDrag.currentTarget.contains(eventDrag.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (eventDrop) => {
    eventDrop.preventDefault();
    setIsDragOver(false);
    addFiles(eventDrop.dataTransfer.files);
  };

  const handleSubmit = async (eventSubmit) => {
    eventSubmit.preventDefault();
    if (selectedFiles.length === 0 || isPosting) return;

    setIsPosting(true);
    setError("");

    // TODO: POST Upload Image API
    try {
      await uploadPhoto();
      setSelectedFiles([]);
      setCaption("");
      setEventPlace("");
      onSuccess("Photo upload saved as a mock success.");
    } finally {
      setIsPosting(false);
    }
  };

  const hasSelectedFiles = selectedFiles.length > 0;
  const captionLimit = 180;

  return (
    <section className="rounded-[20px] border border-secondary/70 bg-complementSecondary/60 p-4 shadow-sm sm:p-6" id="upload-photos">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-playfair text-3xl font-medium">Upload Photos</h2>
          <p className="mt-1 text-sm text-quaternary">Share your best moments with the photography club.</p>
          <p className="mt-1 text-xs text-quaternary/80">PNG, JPG, JPEG supported. Up to 10 MB per photo.</p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-secondary bg-complementPrimary px-4 py-2 text-sm font-medium">
          {hasSelectedFiles ? <CheckCircle2 size={16} className="text-primary" /> : <ImageUp size={16} className="text-quaternary" />}
          {selectedFiles.length} selected
        </span>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] lg:items-start">
        <div className="flex flex-col gap-4">
          <label
            className={`group relative flex min-h-[230px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[16px] border-2 border-dashed p-6 text-center transition duration-200 focus-within:ring-2 focus-within:ring-primary sm:min-h-[260px] ${
              isDragOver
                ? "border-primary bg-complementPrimary shadow-[0_18px_45px_-28px_rgba(0,0,0,0.45)]"
                : error
                  ? "border-red-400 bg-red-50/40"
                  : hasSelectedFiles
                    ? "border-primary/60 bg-complementPrimary/90"
                    : "border-secondary bg-complementPrimary/80 hover:border-primary hover:bg-complementPrimary"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className={`flex h-14 w-14 items-center justify-center rounded-full transition ${
              isDragOver ? "scale-105 bg-primary text-complementPrimary" : "bg-complementSecondary text-primary group-hover:bg-primary group-hover:text-complementPrimary"
            }`}>
              <ImageUp size={28} />
            </div>
            <span className="mt-4 text-lg font-bold">
              {isDragOver ? "Drop your photos here" : "Drag & drop your photos here"}
            </span>
            <span className="mt-2 text-sm text-quaternary">or choose photos from your device</span>
            <span className="mt-5 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-complementPrimary shadow-sm transition group-hover:-translate-y-0.5 group-hover:shadow-md">
              Browse Photos
            </span>
            <span className="mt-4 text-xs text-quaternary/80">PNG, JPG, JPEG </span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            multiple
            className="sr-only"
            onChange={handleFileChange}
            aria-label="Select event photos"
          />
          </label>

          {error && (
            <div className="flex items-start gap-2 rounded-[12px] border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
              <AlertCircle size={18} className="mt-0.5 flex-none" />
              <span>{error}</span>
            </div>
          )}

          {previews.length > 0 && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {previews.map((preview, index) => (
                <div
                  key={`${preview.file.name}-${index}`}
                  className="group flex items-center gap-3 rounded-[14px] border border-secondary bg-complementPrimary p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <img
                    src={preview.url}
                    alt={`Selected preview ${index + 1}`}
                    className="h-20 w-20 flex-none rounded-[10px] object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{preview.file.name}</p>
                    <p className="mt-1 text-xs text-quaternary">{formatFileSize(preview.file.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="flex h-9 w-9 flex-none items-center justify-center rounded-full border border-secondary text-quaternary transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label={`Remove ${preview.file.name}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-5 rounded-[16px] border border-secondary/70 bg-complementPrimary/80 p-4 shadow-sm sm:p-5">
          <label className="text-sm font-bold text-primary">
            Caption
            <textarea
              value={caption}
              maxLength={captionLimit}
              onChange={(eventChange) => setCaption(eventChange.target.value)}
              className="mt-2 min-h-28 w-full resize-none rounded-[12px] border border-secondary bg-complementPrimary p-3 text-sm font-normal text-primary transition placeholder:text-quaternary/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Add a short caption for this event album"
            />
            <span className="mt-1 block text-right text-xs font-normal text-quaternary">{caption.length}/{captionLimit}</span>
          </label>
          <label className="text-sm font-bold text-primary">
            Category
            <select
              value={category}
              onChange={(eventChange) => setCategory(eventChange.target.value)}
              className="mt-2 h-12 w-full rounded-[12px] border border-secondary bg-complementPrimary px-4 text-sm font-normal text-primary transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {categoryOptions.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-bold text-primary">
            Event Place
            <input
              type="text"
              value={eventPlace}
              onChange={(eventChange) => setEventPlace(eventChange.target.value)}
              placeholder="Enter event location or name"
              className="mt-2 h-12 w-full rounded-[12px] border border-secondary bg-complementPrimary px-4 text-sm font-normal text-primary transition placeholder:text-quaternary/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </label>
          <button
            type="submit"
            disabled={!hasSelectedFiles || isPosting}
            className="mt-1 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-bold text-complementPrimary shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50 disabled:shadow-none focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {isPosting && <Loader2 size={18} className="animate-spin" />}
            {isPosting ? "Posting..." : `Post ${selectedFiles.length > 1 ? "Photos" : "Photo"}`}
          </button>
          {!hasSelectedFiles && (
            <p className="text-center text-xs text-quaternary">Select at least one photo to post.</p>
          )}
        </div>
      </form>
    </section>
  );
}

UploadSection.propTypes = {
  event: PropTypes.object.isRequired,
  categories: PropTypes.array.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

export default UploadSection;
