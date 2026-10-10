import { useEffect, useState } from "react";
// import photos from "../../utils/photos.json";
import Button from "../Button";
import { FiX, FiHeart, FiShare2 } from "react-icons/fi";
import {
  getMyPhotoLikes,
  getPhotos,
  getSharedPhoto,
  likePhoto,
} from "../util/postApi";
import { Plus } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { canUploadPhoto } from "./photoUploadAccess";

const Photos = () => {
  const [viewAll, setViewAll] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [tag, setTag] = useState("View all");
  const [photos, setPhotos] = useState([]);
  const [pendingLikes, setPendingLikes] = useState(new Set());
  const [error, setError] = useState(null);
  const [shareError, setShareError] = useState("");
  const navigate = useNavigate();
  const { photoId } = useParams();

  const handleLike = async (photo, e) => {
    e.stopPropagation();
    if (pendingLikes.has(photo.documentId)) return;

    setPendingLikes((prev) => new Set(prev).add(photo.documentId));

    try {
      const result = await likePhoto(photo.documentId, photo.liked);

      setPhotos((prev) =>
        prev.map((p) =>
          p.documentId === photo.documentId
            ? {
                ...p,
                liked: result.liked,
                likes: result.likesCount,
              }
            : p,
        ),
      );
    } catch (error) {
      console.error("Like failed:", error);
      if ([401, 403].includes(error.response?.status)) {
        alert("Please log in to like photos.");
      }
    } finally {
      setPendingLikes((prev) => {
        const next = new Set(prev);
        next.delete(photo.documentId);
        return next;
      });
    }
  };

  const handleShare = async (photo, e) => {
    e.stopPropagation();

    const shareData = {
      title: photo.title,
      text: `Check out this photo by ${photo.photographer}`,
      url: `${window.location.origin}/photo-reels/${encodeURIComponent(photo.documentId)}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        alert("Photo link copied!");
      }
    } catch (error) {
      console.log("Share cancelled");
    }
  };

  const canUpload = canUploadPhoto();

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const data = await getPhotos();
        let likedDocumentIds = [];
        if (localStorage.getItem("authToken")) {
          try {
            likedDocumentIds = await getMyPhotoLikes();
          } catch (likeStatusError) {
            console.error("Failed to load liked photo state:", likeStatusError);
          }
        }
        const likedPhotos = new Set(likedDocumentIds);
        setPhotos(
          data.map((photo) => ({
            ...photo,
            liked: likedPhotos.has(photo.documentId),
          })),
        );
        if (photoId) {
          setShareError("");
          try {
            setSelectedPhoto(await getSharedPhoto(photoId));
          } catch (photoError) {
            setShareError(
              photoError.response?.status === 401
                ? "This photo is private. Please log in to view it."
                : photoError.response?.status === 403
                  ? "You are not authorized to view this private photo."
                  : photoError.message ||
                    "This photo is unavailable or you are not authorized to view it.",
            );
          }
        }
      } catch (err) {
        setError("failed to load ");
        console.log(err);
      }
    };
    fetchContent();
  }, [photoId]);

  const tags = [
    { name: "View all" },

    ...[...new Set(photos.map((photo) => photo.tag).filter(Boolean))].map(
      (name) => ({ name }),
    ),
  ];

  const filteredPhotos =
    tag === "View all" ? photos : photos.filter((photo) => photo.tag === tag);

  // Determine photos to display based on viewAll state
  const photosToDisplay = viewAll ? filteredPhotos : filteredPhotos.slice(0, 6);

  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-end mb-6">
        {canUpload && (
          <button
            onClick={() => navigate("/upload-photo")}
            className="flex items-center gap-2 bg-black text-white px-5 py-2 rounded-full hover:opacity-90"
          >
            <Plus size={18} />
            Upload Photo
          </button>
        )}
      </div>
      {/* Tag tabs */}
      <div className="mb-12">
        <div className="sm:hidden px-4">
          <select
            value={tag}
            onChange={(e) => {
              setTag(e.target.value);
              setViewAll(false); // Reset viewAll when changing tag
            }}
            className="block w-full rounded-full border-gray-200 py-2 pl-4 pr-10 text-base focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
          >
            {tags.map((cat) => (
              <option key={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div className="hidden sm:block">
          <div className="border-b border-gray-200">
            <nav className="flex justify-center -mb-px space-x-8">
              {tags.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => {
                    setTag(cat.name);
                    setViewAll(false); // Reset viewAll when changing tag
                  }}
                  className={`
                    whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm
                    ${
                      tag === cat.name
                        ? "border-black text-black"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }
                  `}
                >
                  {cat.name}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {shareError && (
          <p role="alert" className="mb-6 text-center text-gray-600">
            {shareError}
          </p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {photosToDisplay.map((photo) => (
            <div
              key={photo.id}
              className="relative group cursor-pointer"
              onClick={() => setSelectedPhoto(photo)}
            >
              <div className="overflow-hidden rounded-[30px] bg-gray-100">
                <img
                  src={photo.img}
                  alt={photo.title}
                  className="w-full h-[400px] object-cover object-center group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-max">
                <div className="bg-white rounded-full border-black border-[1.2px] px-6 py-3 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-gray-100 overflow-hidden">
                      {photo.photographerAvatar ? (
                        <img
                          src={photo.photographerAvatar}
                          alt={photo.photographer}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="flex w-full h-full items-center justify-center text-xs text-gray-600">
                          {photo.photographer?.charAt(0).toUpperCase() || "?"}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-gray-900 font-medium text-sm">
                        {photo.title}
                      </h3>
                      <p className="text-gray-600 text-xs">
                        By {photo.photographer}
                      </p>

                      <p className="text-gray-500 text-[10px]">
                        {photo.tag}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <button
                          onClick={(e) => handleLike(photo, e)}
                          disabled={pendingLikes.has(photo.documentId)}
                          aria-pressed={Boolean(photo.liked)}
                          className={`flex items-center gap-1 text-xs hover:text-red-500 ${
                            photo.liked ? "text-red-500" : ""
                          }`}
                        >
                          <FiHeart
                            className={`w-4 h-4 ${
                              photo.liked ? "fill-current" : ""
                            }`}
                          />
                          {photo.likes}
                        </button>

                        <button
                          onClick={(e) => handleShare(photo, e)}
                          className="flex items-center gap-1 text-xs hover:text-blue-500"
                        >
                          <FiShare2 className="w-4 h-4" />
                          Share
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View More Button */}
        {filteredPhotos.length > 6 && !viewAll && (
          <div className="text-center mt-12">
            <Button
              onClick={() => setViewAll(true)}
              variant="outline"
              size="md"
              className="border-black text-black rounded-full px-8"
            >
              Load More Photos
            </Button>
          </div>
        )}
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-white z-50 flex items-center justify-center sm:p-6 h-screen overflow-hidden"
          onClick={() => setSelectedPhoto(null)}
        >
          {/* Close Button */}
          <button
            className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
            onClick={() => setSelectedPhoto(null)}
          >
            <FiX className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Modal Content */}
          <div
            className="max-w-full sm:max-w-5xl w-full max-h-screen sm:h-auto flex flex-col md:flex-row gap-6 sm:gap-8 bg-white shadow-lg rounded-2xl p-4 sm:p-6 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image Container */}
            <div className="flex-1 flex items-center justify-center">
              <img
                src={selectedPhoto.img}
                alt={selectedPhoto.title}
                className="max-w-full max-h-[60vh] sm:max-h-[80vh] object-cover rounded-2xl"
              />
            </div>

            {/* Scrollable Details Section */}
            <div className="w-full md:w-80 flex flex-col overflow-y-auto max-h-[80vh]">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 overflow-hidden">
                  <img
                    src={selectedPhoto.photographerAvatar}
                    alt={selectedPhoto.photographer}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium">{selectedPhoto.photographer}</h3>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {selectedPhoto.location}
                  </p>
                </div>
              </div>

              <h2 className="text-lg sm:text-xl font-light mb-2 sm:mb-4">
                {selectedPhoto.title}
              </h2>
              <p className="text-gray-600 text-sm mb-4 sm:mb-6">
                {selectedPhoto.description}
              </p>

              <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-500">
                <div>
                  <span className="font-medium">Camera:</span>{" "}
                  {selectedPhoto.camera}
                </div>
                <div>
                  <span className="font-medium">Lens:</span>{" "}
                  {selectedPhoto.lens}
                </div>
                <div>
                  <span className="font-medium">Settings:</span>{" "}
                  {selectedPhoto.settings}
                </div>
                <div>
                  <span className="font-medium">Tag:</span>{" "}
                  {selectedPhoto.tag}
                </div>
                <div>
                  <span className="font-medium">Captured By:</span>{" "}
                  {selectedPhoto.photographer}
                </div>

                <div>
                  <span className="font-medium">Captured Date:</span>{" "}
                  {selectedPhoto.date}
                </div>
                <div>
                  <span className="font-medium">Date:</span>{" "}
                  {selectedPhoto.date}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Photos;
