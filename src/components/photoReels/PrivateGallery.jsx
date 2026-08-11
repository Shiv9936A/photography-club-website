import { useEffect, useState } from "react";
import { getPrivatePhotos } from "../util/postApi";
import { FiX } from "react-icons/fi";

const PrivateGallery = () => {
    const [photos, setPhotos] = useState([]);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchPrivatePhotos = async () => {
            try {
                setLoading(true);

                const data = await getPrivatePhotos();

                setPhotos(data);
            } catch (err) {
                console.error("Private gallery error:", err);

                if (err.response?.status === 403) {
                    setError("NITK students only.");
                } else if (err.response?.status === 401) {
                    setError("Please sign in.");
                } else {
                    setError("Failed to load private gallery.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchPrivatePhotos();
    }, []);

    if (loading) {
        return (
            <div className="text-center py-16">
                <p className="text-gray-500">
                    Loading private gallery...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-16">
                <p className="text-red-500 font-medium">
                    🔒 {error}
                </p>
            </div>
        );
    }

    return (
        <div className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Heading */}
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-medium">
                        Private Gallery 🔒
                    </h2>

                    <p className="text-gray-500 mt-2">
                        Exclusive photos for NITK students
                    </p>
                </div>

                {/* Empty */}
                {photos.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">
                            No private photos available.
                        </p>
                    </div>
                )}

                {/* Gallery */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                    {photos.map((photo) => (
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
                                    <h3 className="text-gray-900 font-medium text-sm">
                                        {photo.title}
                                    </h3>

                                    <p className="text-gray-600 text-xs">
                                        🔒 Private
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}

                </div>
            </div>

            {/* Modal */}
            {selectedPhoto && (
                <div
                    className="fixed inset-0 bg-white z-50 flex items-center justify-center p-6"
                    onClick={() => setSelectedPhoto(null)}
                >
                    <button
                        className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
                        onClick={() => setSelectedPhoto(null)}
                    >
                        <FiX className="w-6 h-6" />
                    </button>

                    <div
                        className="max-w-5xl w-full flex flex-col md:flex-row gap-8 bg-white shadow-lg rounded-2xl p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex-1 flex items-center justify-center">
                            <img
                                src={selectedPhoto.img}
                                alt={selectedPhoto.title}
                                className="max-w-full max-h-[80vh] object-contain rounded-2xl"
                            />
                        </div>

                        <div className="w-full md:w-80 p-4">
                            <h2 className="text-xl font-medium mb-4">
                                {selectedPhoto.title}
                            </h2>

                            <p className="text-gray-500">
                                🔒 NITK Private Gallery
                            </p>

                            <p className="text-sm text-gray-400 mt-4">
                                {selectedPhoto.date}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PrivateGallery;