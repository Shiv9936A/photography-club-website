import { Outlet, useParams, useNavigate } from "react-router";
import { useState } from "react";
import Dropdown from "../../components/filtersort/dropdown";
import EventsThumb from "../../components/events/eventsThumb";
import ModularTabs from "../../components/modularTabs";
import { useEffect } from "react";
import axios from "axios";

function Events() {
  const { id } = useParams();
  const navigate = useNavigate();

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
    user?.role === "admin" || user?.role === "sig-coordinator";
  const [activeTab, setActiveTab] = useState("upcoming");
  const [eventsToShow, setEventsToShow] = useState([]);
  const [events, setEvents] = useState([]);

  const API = "http://localhost:1337/api/events";

  const getEvents = async () => {
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        console.log("No authentication token. Events are protected.");
        return;
      }

      const res = await axios.get(API, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("EVENTS FROM STRAPI:", res.data.data);

      const events = [...res.data.data].sort(
        (a, b) => new Date(b.dateTime) - new Date(a.dateTime),
      );

      setEvents(events);
    } catch (err) {
      console.log("Events API error:", err.response?.data || err);
    }
  };
  useEffect(() => {
    getEvents();
  }, []);

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);

    if (tabId === "all") {
      setEventsToShow(events);
    } else if (tabId === "upcoming") {
      const upcomingEvents = events.filter(
        (event) => new Date(event.dateTime) >= new Date(),
      );
      const sortedUpcomingEvents = [...upcomingEvents].sort(
        (a, b) => new Date(a.dateTime) - new Date(b.dateTime),
      );
      setEventsToShow(sortedUpcomingEvents);
    } else if (tabId === "pclub") {
      const pastEvents = events.filter((event) => event.isPClubEvent);
      setEventsToShow(pastEvents);
    } else if (tabId === "nitkevents") {
      const nitkEvents = events.filter((event) => !event.isPClubEvent);
      setEventsToShow(nitkEvents);
    }
  };

  useEffect(() => {
    handleTabClick(activeTab);
  }, [events]);

  if (id) {
    return <Outlet />;
  }

  return (
    <div className="max-w-container mx-auto px-container-px md:px-container-px-md py-8">
      {/* top most section  */}
      <div className="mt-3 flex flex-col justify-center items-center gap-y-4 px-4 sm:px-6 lg:px-8">
        <span className="text-center font-bold text-3xl border-[1.2px] border-black rounded-full px-8 py-3 w-auto sm:text-4xl lg:text-5xl">
          Club Events
        </span>
        <span className="text-md opacity-60 sm:text-lg lg:text-xl lg:max-w-2xl text-center">
          Check out all the events we have planned for you;
          <br />
          And the ones we&apos;ve hosted before.
        </span>
        {/* tabs part  */}
        <div className="mt-5">
          <ModularTabs
            tabs={navItems}
            activeTab={activeTab}
            onTabClick={handleTabClick}
          />

          {canCreateEvent && (
            <div className="mt-5 flex justify-center">
              <button
                onClick={() => navigate("/events/create")}
                className="rounded-lg bg-primary px-5 py-2 font-semibold text-white hover:bg-red-400"
              >
                Create Event
              </button>
            </div>
          )}
        </div>
      </div>

      {/*Content part  */}
      <div className="mt-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {eventsToShow.map((event, index) => (
            <EventsThumb
              event={event}
              key={index}
              thinVariant={false}
              variant="grid"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/*const events = [
    {
        id: "incident-24",
        title: "Incident '24",
        description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.",
        location: "Main Building, NITK",
        dateTime: "2026-01-01 10:00 AM",
        image: "https://img.freepik.com/free-photo/3d-modern-background-with-hot-pink-flowing-lines_1048-12263.jpg",
        thumbnailColor: "#E195AB"
    },
    {
        id: "engineer-24",
        title: "Engineer '24",
        description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.",
        location: "Main Building, NITK",
        dateTime: "2027-01-01 10:00 AM",
        image: "https://placehold.co/200x260", //optional
        thumbnailColor: "#DE3163"
    },
    {
        id: "photography-24",
        title: "Photography '24",
        description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.",
        location: "Main Building, NITK",
        dateTime: "2024-01-01 10:00 AM",
        image: "https://placehold.co/200x260",
        thumbnailColor: "#FFB4A2"
    },
    {
        id: "event-4",
        title: "Event 4 - No Image",
        description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.",
        location: "Main Building, NITK",
        dateTime: "2024-01-01 10:00 AM",
        image: null,
        thumbnailColor: "#FFB4A2"
    }
]
*/
const navItems = [
  { id: "upcoming", label: "Upcoming" },
  { id: "all", label: "All" },
  { id: "pclub", label: "PClub" },
  { id: "nitkevents", label: "NITK Events" },
];

export default Events;
