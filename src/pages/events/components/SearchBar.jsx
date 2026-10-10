import PropTypes from "prop-types";
import { Search } from "lucide-react";

function SearchBar({ value, onChange }) {
  return (
    <div className="relative w-full max-w-full mx-auto">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-quaternary" size={18} />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search photos, photographers, categories"
        className="w-full box-border rounded-full border border-secondary bg-complementPrimary py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label="Search gallery photos"
      />
    </div>
  );
}

SearchBar.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default SearchBar;
