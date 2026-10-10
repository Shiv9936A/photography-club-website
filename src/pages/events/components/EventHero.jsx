import PropTypes from "prop-types";
import noiseImage from "../../../assets/images/noise.png";

function EventHero({ event }) {
  return (
    <section className="overflow-hidden rounded-[12px] bg-complementSecondary">
      <div className="relative min-h-[300px] sm:min-h-[340px] md:min-h-[420px]">
        {/* Background color layer */}
        <div style={{ backgroundColor: event.thumbnailColor }} className="absolute inset-0">
          <img
            src={noiseImage}
            alt=""
            className="absolute inset-0 h-full w-full contrast-200 opacity-30 md:opacity-40 mix-blend-overlay pointer-events-none"
          />
        </div>

        {/* Banner image */}
        <img
          src={event.bannerImage}
          alt={`${event.title} event banner`}
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/30" />

        {/* Content: tags → title → description */}
        <div className="relative z-[1] flex min-h-[300px] sm:min-h-[340px] md:min-h-[420px] flex-col justify-end gap-4 p-5 sm:p-6 md:p-10">
          {/* Category / type tags */}
          <div className="flex flex-wrap gap-2">
            {event.category && (
              <span className="rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
                {event.category}
              </span>
            )}
            {event.eventType && (
              <span className="rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
                {event.eventType}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="font-playfair text-3xl font-medium leading-tight text-white sm:text-4xl md:text-[44px]">
            {event.title}
          </h1>

          {/* Short description */}
          {event.shortDescription && (
            <p className="max-w-3xl text-sm font-medium text-white/85 sm:text-base md:text-lg">
              {event.shortDescription}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

EventHero.propTypes = {
  event: PropTypes.object.isRequired,
};

export default EventHero;
