import PropTypes from "prop-types";
import incident26Image from "./698a1ef3f2512_untitled_design_9_.webp";
import engi1Image from "./engi1.jpg";

const CATEGORIES = [
  {
    id: "PClub",
    label: "PClub Events",
    subtitle: "Photography Club's own events — from campus festivals to club workshops.",
    image: incident26Image,
    accentColor: "#2D72D9",
  },
  {
    id: "Others",
    label: "Others Events",
    subtitle: "External and collaborative events covered by the club.",
    image: engi1Image,
    accentColor: "#DE3163",
  },
];

function EventCategorySelector({ onSelect }) {
  return (
    <div className="mt-9 md:mt-11 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:gap-6">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          type="button"
          onClick={() => onSelect(cat.id)}
          className="group relative overflow-hidden rounded-[20px] border border-secondary
            text-left focus:outline-none focus:ring-2 focus:ring-primary/40
            transition-transform duration-300 ease-out hover:-translate-y-1"
          style={{ minHeight: "320px" }}
        >
          {/* Background image */}
          <img
            src={cat.image}
            alt={cat.label}
            className="absolute inset-0 h-full w-full object-cover
              transition-transform duration-500 ease-out group-hover:scale-105
              brightness-75 group-hover:brightness-90"
          />

          {/* Gradient overlay: dark bottom, lighter top */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.30) 55%, rgba(0,0,0,0.10) 100%)",
            }}
          />



          {/* Content */}
          <div className="relative z-10 flex h-full min-h-[320px] flex-col justify-end gap-3 p-6 sm:p-7 md:p-8">
            <h2 className="font-playfair text-3xl font-medium leading-tight text-white sm:text-4xl">
              {cat.label}
            </h2>
            <p className="max-w-sm text-sm font-medium text-white/80 sm:text-base">
              {cat.subtitle}
            </p>

            {/* "Explore →" pill */}
            <span
              className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full
                bg-white/15 px-4 py-1.5 text-sm font-semibold text-white
                backdrop-blur-sm ring-1 ring-white/20
                transition-all duration-200 group-hover:bg-white/25 group-hover:ring-white/40"
            >
              Explore
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}

EventCategorySelector.propTypes = {
  onSelect: PropTypes.func.isRequired,
};

export default EventCategorySelector;
