import PropTypes from "prop-types";

function GalleryCard({ photo, onOpen }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group w-full overflow-hidden rounded-[12px] border border-secondary bg-black/5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary"
      aria-label={`Preview photo by ${photo.photographer}`}
    >
      <div className="relative h-[260px] w-full overflow-hidden rounded-[12px] sm:h-[280px] xl:h-[300px]">
        <img
          src={photo.src}
          alt={photo.caption}
          className="block h-full w-full object-cover object-center transition duration-300 group-hover:scale-105"
        />
      </div>

      {/* METADATA TEMPORARILY HIDDEN — uncomment to restore
      <span className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white">
        {photo.category}
      </span>
      <div className="flex h-full flex-col justify-between p-4">
        <p className="font-medium">{photo.caption}</p>
        <div className="mt-3 flex items-center justify-between gap-3 text-sm text-quaternary">
          <span>{photo.photographer}</span>
          <span>{photo.uploadDate}</span>
        </div>
      </div>
      */}
    </button>
  );
}

GalleryCard.propTypes = {
  photo: PropTypes.object.isRequired,
  onOpen: PropTypes.func.isRequired,
};

export default GalleryCard;
