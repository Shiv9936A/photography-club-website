import PropTypes from "prop-types";
import EventsThumb from "../../../components/events/eventsThumb";

function RelatedEvents({ events }) {
  return (
    <section>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-playfair text-3xl font-medium">Related Events</h2>
        <div className="flex flex-wrap gap-3">
          {/* TODO: GET Related Events API */}
          <button type="button" className="rounded-full border border-secondary px-4 py-2 text-sm font-medium hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary">
            Previous Event
          </button>
          <button type="button" className="rounded-full border border-secondary px-4 py-2 text-sm font-medium hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary">
            Next Event
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {events.map((event) => (
          <EventsThumb key={event.id} event={{
            id: event.id,
            title: event.title,
            description: event.shortDescription,
            location: event.venue,
            dateTime: event.dateTime,
            image: event.bannerImage,
            thumbnailColor: event.thumbnailColor,
          }} variant="grid" />
        ))}
      </div>
    </section>
  );
}

RelatedEvents.propTypes = {
  events: PropTypes.array.isRequired,
};

export default RelatedEvents;
