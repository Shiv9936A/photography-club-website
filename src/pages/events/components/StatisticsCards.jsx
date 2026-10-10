import PropTypes from "prop-types";
import { Download, Eye, Heart, Images, UsersRound } from "lucide-react";

const icons = {
  photosUploaded: Images,
  photographers: UsersRound,
  views: Eye,
  downloads: Download,
  likes: Heart,
};

const labels = {
  photosUploaded: "Photos Uploaded",
  photographers: "Photographers",
  views: "Views",
  downloads: "Downloads",
  likes: "Likes",
};

function StatisticsCards({ statistics }) {
  return (
    <section>
      <h2 className="mb-4 font-playfair text-3xl font-medium">Event Statistics</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Object.entries(statistics).map(([key, value]) => {
          const Icon = icons[key];
          return (
            <div key={key} className="rounded-[12px] border border-secondary bg-complementPrimary p-4 shadow-sm">
              <Icon className="mb-3 text-quaternary" size={22} />
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-sm text-quaternary">{labels[key]}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

StatisticsCards.propTypes = {
  statistics: PropTypes.object.isRequired,
};

export default StatisticsCards;
