import { useRef, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { ChevronDown } from "lucide-react";
import SearchBar from "./SearchBar";

// Updated gallery categories: include All, Campus, Events; place Others last
const filters = [
  "All",
  "PClub Photos",
  "Campus",
  "Events",
  "Nature",
  "Portrait",
  "Others",
];

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "liked", label: "Most Liked" },
];

function FilterBar({ activeFilter, onFilterChange, searchQuery, onSearchChange, sortBy, onSortChange }) {
  const [edgeFade, setEdgeFade] = useState({ left: false, right: true });
  const scrollerRef = useRef(null);

  const handleScroll = (scrollEvent) => {
    const el = scrollEvent.currentTarget;
    setEdgeFade({
      left: el.scrollLeft > 4,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
    });
  };

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const activeEl = scroller.querySelector('[data-active="true"]');
    if (!activeEl) return;
    const targetLeft = activeEl.offsetLeft - scroller.clientWidth / 2 + activeEl.clientWidth / 2;
    scroller.scrollTo({ left: targetLeft, behavior: 'smooth' });
  }, [activeFilter]);

  return (
       <div className={`relative overflow-visible rounded-[20px] border border-white/20 bg-complementPrimary/60 p-4 shadow-[0_8px_32px_-16px_rgba(0,0,0,0.3)] backdrop-blur-xl`}>
      <style>{`
        @keyframes filterFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .filter-chip { animation: filterFadeIn 0.3s ease both; }
        @media (prefers-reduced-motion: reduce) {
          .filter-chip { animation: none !important; transition: none !important; }
        }
        .filter-chip[data-active="true"]:hover {
          transform: none !important;
          box-shadow: none !important;
        }
      `}</style>

      {/* ambient glow */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute -left-10 -top-16 h-40 w-40 rounded-full bg-primary/20 blur-[70px]" />
        <div className="absolute -right-10 -bottom-16 h-40 w-40 rounded-full bg-primary/10 blur-[70px]" />
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1">
          <SearchBar value={searchQuery} onChange={onSearchChange} />
        </div>

        <div className="relative w-full sm:w-auto">
          <select
            value={sortBy}
            onChange={(event) => onSortChange(event.target.value)}
            className="w-full appearance-none rounded-full border border-white/30 bg-white/20 py-3 pl-4 pr-10 text-sm font-medium backdrop-blur-md transition-colors duration-150 hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary sm:w-auto"
            aria-label="Sort gallery photos"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-quaternary"
          />
        </div>
      </div>

      <div className="relative mt-4">
        <div
          className={`pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-complementPrimary/80 to-transparent transition-opacity duration-200 ${
            edgeFade.left ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden="true"
        />
        <div
          className={`pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-complementPrimary/80 to-transparent transition-opacity duration-200 ${
            edgeFade.right ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden="true"
        />
        <div
          ref={scrollerRef}
          onScroll={handleScroll}
          className="flex min-h-14 items-center gap-3 overflow-x-auto px-2 py-2 pl-8 pr-6 justify-start md:justify-center lg:pl-16 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="w-6 flex-shrink-0" aria-hidden="true" />
          {filters.map((filter, index) => {
            const isActive = activeFilter === filter;
            return (
              <button
                key={filter}
                type="button"
                onClick={() => onFilterChange(filter)}
                aria-pressed={isActive}
                style={{ animationDelay: `${index * 30}ms` }}
                className={`filter-chip relative inline-flex h-10 items-center whitespace-nowrap rounded-full px-4 text-sm font-medium leading-none transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-primary ${
                  isActive
                    ? "bg-black text-white"
                    : "border border-white/30 bg-white/15 text-primary backdrop-blur-md hover:border-primary/50 hover:bg-white/25 hover:shadow-[0_6px_16px_-10px] hover:shadow-primary/40"
                }`}
                data-active={isActive ? "true" : "false"}
              >
                {filter}
              </button>
            );
          })}
          <div className="w-6 flex-shrink-0" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

FilterBar.propTypes = {
  activeFilter: PropTypes.string.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  searchQuery: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  sortBy: PropTypes.string.isRequired,
  onSortChange: PropTypes.func.isRequired,
};

export default FilterBar;
