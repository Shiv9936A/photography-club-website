import PropTypes from 'prop-types';
import { GrLocation } from "react-icons/gr";
import { MdEvent } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import { navigateSmooth } from '../../utils/helperFunctions';

function EventsThumb({ event, isOnHomePage = false, thinVariant = false, variant = "scroll" }) {
    const navigate = useNavigate();
    
    const handleEventClick = () => {
        const fromPage = isOnHomePage ? 'home' : 'events';
        navigateSmooth(navigate, `/events/${event.id}`, fromPage);
    };

    const formatDateTime = (dateTimeStr) => {
        if (!dateTimeStr) return "Date to be announced";
        
        try {
            const dateString = dateTimeStr.split('/')[0];
            const date = new Date(dateString);
            
            if (isNaN(date.getTime())) {
                return "Date to be announced";
            }
            
            const day = date.getDate();
            const suffix = ['th', 'st', 'nd', 'rd'][(day % 10 > 3 ? 0 : day % 10)];
            const month = date.toLocaleString('en-US', { month: 'short' });
            const year = date.getFullYear();
            const hours = date.getHours();
            const ampm = hours >= 12 ? 'pm' : 'am';
            const displayHours = hours % 12 || 12;

            return `${day}${suffix} ${month} ${year} | ${displayHours}${ampm}`;
        } catch {
            return "Date to be announced";
        }
    };

    return (
        <div
            onClick={handleEventClick}
            className={`group relative overflow-hidden rounded-[16px]
                border border-gray-200 shadow-md
                transition-all duration-300 ease-out
                hover:cursor-pointer hover:shadow-lg
                hover:-translate-y-2
                ${variant === "scroll"
                    ? "min-w-[250px] md:min-w-[460px] lg:min-w-[490px] lg:max-w-[80%]"
                    : "w-full"
                }
                h-auto flex flex-col`}
        >
            {/* Event Image - Large and Prominent */}
            <div className="relative w-full overflow-hidden bg-gray-100" style={{ height: '300px' }}>
                {event.image ? (
                    <img 
                        src={event.image} 
                        alt={event.title}
                        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                ) : (
                    <div className="h-full w-full bg-gradient-to-br from-gray-300 to-gray-400" />
                )}
            </div>

            {/* Event Information - Clean and Minimal */}
            <div className="flex flex-col justify-between gap-3 bg-white p-5 md:p-6">
                {/* Title */}
                <div>
                    <p className="font-playfair text-2xl md:text-3xl font-medium leading-tight text-primary">
                        {event.title}
                    </p>
                </div>

                {/* Description */}
                <p className="line-clamp-2 text-sm md:text-base leading-6 text-quaternary">
                    {event.description}
                </p>

                {/* Event Details - Location and Date */}
                <div className="flex flex-col gap-2 text-xs md:text-sm font-medium text-quaternary pt-2">
                    <p className="flex items-center gap-2">
                        <GrLocation className="shrink-0 text-base text-primary" />
                        <span>{event.location}</span>
                    </p>
                    <p className="flex items-center gap-2">
                        <MdEvent className="shrink-0 text-base text-primary" />
                        <span>{formatDateTime(event.dateTime)}</span>
                    </p>
                </div>
            </div>
        </div>
    );
}

EventsThumb.propTypes = {
    event: PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        location: PropTypes.string.isRequired,
        dateTime: PropTypes.string.isRequired,
        image: PropTypes.string,
        thumbnailColor: PropTypes.string,
    }).isRequired,
    isOnHomePage: PropTypes.bool,
    thinVariant: PropTypes.bool,
    variant: PropTypes.oneOf(['scroll', 'grid']),
};

export default EventsThumb;
