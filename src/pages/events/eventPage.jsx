import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Instagram } from "lucide-react";
import { navigateSmooth } from "../../utils/helperFunctions";
import {
  getEventById,
  getGallery,
  getRelatedEvents,
} from "../../services/eventsService";

import EventGallery from "./components/EventGallery";
import EventHero from "./components/EventHero";
import EventInfoCard from "./components/EventInfoCard";
import LoadingSkeleton from "./components/LoadingSkeleton";
import RelatedEvents from "./components/RelatedEvents";
import ShareButtons from "./components/ShareButtons";

import {
  canUploadPhoto,
  getPhotoUploadSession,
} from "../../components/photoReels/photoUploadAccess";

function EventPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const detailsRef = useRef(null);

  const [pageData, setPageData] = useState({
    event: null,
    gallery: [],
    relatedEvents: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isFromHome = location.state?.from === "home";
  const path = isFromHome ? "/" : "/events";

  const session = getPhotoUploadSession();
  const canManageEvent = canUploadPhoto(session);

  useEffect(() => {
    let isMounted = true;

    async function loadEventDetails() {
      setLoading(true);
      setError("");

      try {
        const event = await getEventById(id);

        if (!event) {
          if (isMounted) {
            setPageData({
              event: null,
              gallery: [],
              relatedEvents: [],
            });
          }
          return;
        }

        const [galleryResult, relatedResult] = await Promise.allSettled([
          getGallery(id),
          getRelatedEvents(id),
        ]);

        if (!isMounted) return;

        setPageData({
          event,
          gallery:
            galleryResult.status === "fulfilled" &&
            Array.isArray(galleryResult.value)
              ? galleryResult.value
              : [],
          relatedEvents:
            relatedResult.status === "fulfilled" &&
            Array.isArray(relatedResult.value)
              ? relatedResult.value
              : [],
        });

        if (galleryResult.status === "rejected") {
          console.error("Failed to load event gallery:", galleryResult.reason);
        }

        if (relatedResult.status === "rejected") {
          console.error("Failed to load related events:", relatedResult.reason);
        }
      } catch (err) {
        console.error("Failed to load event details:", err);

        if (isMounted) {
          setError("Unable to load this event. Please try again.");
          setPageData({
            event: null,
            gallery: [],
            relatedEvents: [],
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (id) {
      loadEventDetails();
    } else {
      setPageData({
        event: null,
        gallery: [],
        relatedEvents: [],
      });
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  const backToPrevious = () => {
    const scrollPositionY = sessionStorage.getItem("scrollPositionY");

    navigateSmooth(navigate, path, "", parseInt(scrollPositionY || "0", 10));

    if (scrollPositionY) {
      sessionStorage.removeItem("scrollPositionY");
    }
  };

  const scrollToDetails = () => {
    detailsRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  const { event, gallery, relatedEvents } = pageData;

  if (error || !event) {
    return (
      <div className="mx-auto w-full max-w-[1240px] px-6 py-20 text-center sm:px-8 lg:px-12">
        <h2 className="text-2xl font-semibold">
          {error ? "Unable to load event" : "Event not found"}
        </h2>

        <p className="mt-3 text-quaternary">
          {error || "This event may have been removed or is unavailable."}
        </p>

        <button
          type="button"
          onClick={backToPrevious}
          className="mt-6 inline-flex items-center rounded-lg bg-primary px-5 py-2 text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {isFromHome ? "Go Back" : "Back to Events"}
        </button>
      </div>
    );
  }

  const objectives = Array.isArray(event.objectives) ? event.objectives : [];

  const highlights = Array.isArray(event.highlights) ? event.highlights : [];

  return (
    <div className="mx-auto w-full max-w-[1240px] px-6 py-8 sm:px-8 lg:px-12">
      <button
        type="button"
        onClick={backToPrevious}
        className="group mb-8 inline-flex items-center rounded-full border-0 bg-transparent px-0 py-1 text-quaternary hover:text-primary focus:outline-none focus:ring-0"
      >
        <ArrowLeft className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" />
        {isFromHome ? "Go Back" : "All Events"}
      </button>

      <EventHero event={event} />

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <section className="w-full rounded-[20px] border border-secondary bg-complementPrimary p-5 font-sans sm:p-6 lg:col-span-2 lg:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-playfair text-3xl font-medium">About Event</h2>

            <button
              type="button"
              onClick={scrollToDetails}
              className="rounded-full border border-secondary px-4 py-2 text-sm font-medium text-primary transition hover:border-primary hover:bg-complementSecondary"
            >
              View event details
            </button>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
            <div>
              <p className="whitespace-pre-line text-quaternary">
                {event.fullDescription ||
                  event.description ||
                  "No event description available."}
              </p>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <div>
                  <h3 className="mb-3 text-lg font-bold">Objectives</h3>

                  {objectives.length > 0 ? (
                    <ul className="flex list-disc flex-col gap-2 pl-5 text-quaternary">
                      {objectives.map((objective, index) => (
                        <li key={`${objective}-${index}`}>{objective}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-quaternary">
                      No objectives provided.
                    </p>
                  )}
                </div>

                <div>
                  <h3 className="mb-3 text-lg font-bold">Event Highlights</h3>

                  {highlights.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {highlights.map((highlight, index) => (
                        <span
                          key={`${highlight}-${index}`}
                          className="rounded-full bg-complementSecondary px-4 py-2 text-sm font-medium"
                        >
                          {highlight}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-quaternary">
                      No highlights provided.
                    </p>
                  )}

                  <div className="mt-5">
                    <div className="rounded-[12px] bg-complementSecondary p-4">
                      <p className="text-2xl font-bold">{gallery.length}</p>
                      <p className="text-sm text-quaternary">Photos Uploaded</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              ref={detailsRef}
              className="flex scroll-mt-8 flex-col gap-6 lg:pl-6"
            >
              <div className="flex justify-end">
                {event.portfolioLink && (
                  <a
                    href={event.portfolioLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Open event portfolio or Instagram page"
                    title="View event portfolio"
                    className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-secondary transition hover:border-primary hover:bg-complementSecondary"
                  >
                    <Instagram className="h-6 w-6" />
                  </a>
                )}
              </div>

              <EventInfoCard event={event} />
            </div>
          </div>
        </section>

        <section className="w-full rounded-[24px] border border-secondary bg-complementPrimary/70 p-4 shadow-sm sm:p-6 lg:col-span-2 lg:p-7">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-bold">Event Gallery</h2>

            {canManageEvent && (
              <button
                type="button"
                onClick={() => navigate(`/events/${id}/upload`)}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-80"
              >
                Add Photos
              </button>
            )}
          </div>

          <EventGallery photos={gallery} />
        </section>

        <main className="flex flex-col gap-8 lg:col-span-2">
          <RelatedEvents events={relatedEvents} />
        </main>
      </div>
    </div>
  );
}

export default EventPage;
