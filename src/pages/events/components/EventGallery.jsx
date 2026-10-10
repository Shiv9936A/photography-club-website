import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Camera, ChevronLeft, ChevronRight, X } from "lucide-react";
import GalleryCard from "./GalleryCard";

function EventGallery({ photos }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const displayedPhotos = photos;

  const activePhoto = activeIndex !== null ? displayedPhotos[activeIndex] : null;

  useEffect(() => {
    if (!activePhoto) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowRight" && displayedPhotos.length > 0) {
        setActiveIndex((current) => (current + 1) % displayedPhotos.length);
      }
      if (event.key === "ArrowLeft" && displayedPhotos.length > 0) {
        setActiveIndex((current) => (current - 1 + displayedPhotos.length) % displayedPhotos.length);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activePhoto, displayedPhotos.length]);

  return (
    <section className="mx-auto w-full max-w-[1100px] rounded-[20px] border border-secondary/70 bg-complementPrimary/60 p-4 sm:p-6 overflow-x-hidden min-w-0">
      <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-playfair text-3xl font-medium">Event Gallery</h2>
          <p className="text-sm text-quaternary">{displayedPhotos.length} photos shown</p>
        </div>
      </div>
      {displayedPhotos.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 items-stretch">
          {displayedPhotos.map((photo, index) => (
            <div key={photo.id} className="flex h-full">
              <GalleryCard photo={photo} onOpen={() => setActiveIndex(index)} />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 flex flex-col items-center justify-center rounded-[16px] border border-dashed border-secondary bg-complementSecondary/70 px-8 py-16 text-center sm:py-20">
          <Camera size={44} strokeWidth={1.5} className="text-tertiary" />
          <p className="mt-5 text-xl font-semibold text-primary">No photos uploaded yet.</p>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-quaternary">
            Event photos will appear here once they&apos;re available.
          </p>
        </div>
      )}

      {activePhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
        >
          <button
            type="button"
            onClick={() => setActiveIndex(null)}
            className="absolute right-4 top-4 rounded-full bg-white p-2 text-black focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Close image preview"
          >
            <X size={22} />
          </button>
          <button
            type="button"
            onClick={() => setActiveIndex((activeIndex - 1 + displayedPhotos.length) % displayedPhotos.length)}
            className="absolute left-4 rounded-full bg-white p-2 text-black focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Previous image"
          >
            <ChevronLeft size={24} />
          </button>
          <figure className="max-w-5xl">
              <img src={activePhoto.src} alt={activePhoto.caption} className="max-h-[78vh] w-full rounded-[12px] object-contain" />
              {/* LIGHTBOX METADATA TEMPORARILY HIDDEN — uncomment to restore
              <figcaption className="mt-4 rounded-[12px] bg-white p-4 text-black">
                <p className="font-bold">{activePhoto.caption}</p>
                <p className="text-sm text-gray-600">{activePhoto.photographer} | {activePhoto.uploadDate} | {activePhoto.category}</p>
              </figcaption>
              */}
            </figure>
          <button
            type="button"
            onClick={() => setActiveIndex((activeIndex + 1) % displayedPhotos.length)}
            className="absolute right-4 rounded-full bg-white p-2 text-black focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Next image"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      )}
    </section>
  );
}

EventGallery.propTypes = {
  photos: PropTypes.array.isRequired,
};

export default EventGallery;
