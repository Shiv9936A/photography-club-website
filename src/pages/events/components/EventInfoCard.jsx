import PropTypes from "prop-types";

function EventInfoCard({ event }) {
  const fields = [
    ["Date", event.date],
    ["Time", event.time],
    ["Venue", event.venue],
    ["Registration Status", event.registrationStatus],
    ["Organizer", event.organizer],
    ["Contact Person", event.contactPerson],
    ["Event Category", event.category],
  ];

  return (
    <aside className="p-0">
      <h2 className="mb-4 font-playfair text-2xl font-medium">Event Information</h2>
      <div className="flex flex-col divide-y divide-secondary bg-transparent">
        {fields.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 py-3 text-sm">
            <span className="font-semibold text-quaternary">{label}</span>
            <span className="text-right text-primary">{value}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}

EventInfoCard.propTypes = {
  event: PropTypes.object.isRequired,
};

export default EventInfoCard;
