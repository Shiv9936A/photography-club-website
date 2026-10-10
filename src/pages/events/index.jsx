
import { Outlet, useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";

import EventsThumb from "../../components/events/eventsThumb";
import ModularTabs from "../../components/modularTabs";
import EventCategorySelector from "./components/EventCategorySelector";
import { getEvents } from "../../services/eventsService";

const navItems = [
  { id: "upcoming", label: "Upcoming" },
  { id: "all", label: "All" },
  { id: "past", label: "Past" },
];

const CATEGORY_META = {
  PClub: {
    label: "PClub Events",
    emptyPrefix: "PClub",
  },
  Others: {
    label: "Others Events",
    emptyPrefix: "Others",
  },
};

const TAB_LABEL = {
  upcoming: "upcoming",
  all: "",
  past: "past",
};

const getEventStartDate = (dateTime) => {
  if (!dateTime) return null;

  const startDate = dateTime.split("/")[0];
  const date = new Date(startDate);

  return Number.isNaN(date.getTime()) ? null : date;
};

const getCardEvent = (event) => ({
  id: String(event.id),
  title: event.title,
  description:
    event.shortDescription || event.fullDescription || "",
  location: event.location || event.venue || "Location not specified",
  dateTime: event.dateTime,
  image: event.image || event.bannerImage,
  thumbnailColor: event.thumbnailColor,
});

const filterByTab = (events, activeTab) => {
  if (activeTab === "all") return events;

  const now = new Date();

  return events.filter((event) => {
    const eventDate = getEventStartDate(event.dateTime);

    if (!eventDate) return false;

    return activeTab === "upcoming"
      ? eventDate >= now
      : eventDate < now;
  });
};

const filterEvents = (events, selectedCategory, activeTab) => {
  const byCategory = events.filter((event) =>
    selectedCategory === "PClub"
      ? event.eventType === "PClub"
      : event.eventType !== "PClub"
  );

  return filterByTab(byCategory, activeTab);
};

function Events() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("authToken");

  let user = null;

  try {
    if (token) {
      user = JSON.parse(atob(token.split(".")[1]));
    }
  } catch {
    user = null;
  }

  const canCreateEvent =
    user?.role === "admin" ||
    user?.role === "sig-coordinator";

  useEffect(() => {
    let isMounted = true;

    async function loadEvents() {
      try {
        setLoading(true);
        setError("");

        const eventList = await getEvents();

        if (isMounted) {
          setEvents(eventList);
        }
      } catch (err) {
        console.error("Failed to load events:", err);

        if (isMounted) {
          setError("Unable to load events. Please try again.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadEvents();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    setActiveTab("upcoming");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setActiveTab("upcoming");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const eventsToShow = useMemo(() => {
    if (!selectedCategory) return [];

    return filterEvents(events, selectedCategory, activeTab);
  }, [events, selectedCategory, activeTab]);

  if (id) {
    return <Outlet />;
  }

  const categoryMeta = selectedCategory
    ? CATEGORY_META[selectedCategory]
    : null;

  return (
    <div className="max-w-container mx-auto px-container-px md:px-container-px-md py-10 md:py-12">
      {selectedCategory ? (
        <>
          <button
            type="button"
            onClick={handleBackToCategories}
            className="mb-8 inline-flex items-center gap-2 rounded-full border-0 bg-transparent px-0 py-1 text-quaternary hover:text-primary group transition-colors duration-150"
          >
            <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            All Events
          </button>

          <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-y-4 px-4 text-center sm:px-6 lg:px-8">
            <span className="w-auto rounded-full border-[1.2px] border-black px-8 py-3 text-center text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              {categoryMeta.label}
            </span>

            <span className="max-w-2xl text-sm leading-6 text-quaternary sm:text-base">
              {selectedCategory === "PClub"
                ? "Photography Club's own curated events — workshops, shoots, and festivals."
                : "External and collaborative events covered by the Photography Club."}
            </span>

            <div className="mt-3">
              <ModularTabs
                tabs={navItems}
                activeTab={activeTab}
                onTabClick={setActiveTab}
              />
            </div>

            {canCreateEvent && (
              <button
                type="button"
                onClick={() => navigate("/events/create")}
                className="rounded-lg bg-primary px-5 py-2 font-semibold text-white hover:opacity-80"
              >
                Create Event
              </button>
            )}
          </div>

          <div className="mt-9 md:mt-11">
            {loading ? (
              <p className="py-16 text-center text-quaternary">
                Loading events...
              </p>
            ) : error ? (
              <p className="py-16 text-center text-red-600">
                {error}
              </p>
            ) : eventsToShow.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:gap-6">
                {eventsToShow.map((event) => (
                  <EventsThumb
                    key={event.id}
                    event={getCardEvent(event)}
                    thinVariant={false}
                    variant="grid"
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
                <span className="text-5xl">📷</span>

                <p className="font-playfair text-2xl font-medium text-primary">
                  No {TAB_LABEL[activeTab]
                    ? `${TAB_LABEL[activeTab]} `
                    : ""}
                  {categoryMeta.emptyPrefix} events found.
                </p>

                <p className="max-w-sm text-sm text-quaternary">
                  {activeTab === "upcoming"
                    ? "Check back soon — events are being planned."
                    : activeTab === "past"
                      ? "No past events in this category yet."
                      : "No events in this category yet."}
                </p>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-y-4 px-4 text-center sm:px-6 lg:px-8">
            <span className="w-auto rounded-full border-[1.2px] border-black px-8 py-3 text-center text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              Club Events
            </span>

            <span className="max-w-2xl text-sm leading-6 text-quaternary sm:text-base">
              Discover the events and moments we've planned for our photography community.
            </span>

            {canCreateEvent && (
              <button
                type="button"
                onClick={() => navigate("/events/create")}
                className="rounded-lg bg-primary px-5 py-2 font-semibold text-white hover:opacity-80"
              >
                Create Event
              </button>
            )}
          </div>

          {loading ? (
            <p className="py-16 text-center text-quaternary">
              Loading events...
            </p>
          ) : error ? (
            <p className="py-16 text-center text-red-600">
              {error}
            </p>
          ) : (
            <EventCategorySelector onSelect={handleSelectCategory} />
          )}
        </>
      )}
    </div>
  );
}

export default Events;
