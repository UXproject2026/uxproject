import { Link } from 'react-router-dom';

/**
 * EventCard Component
 * Displays a summary of a single theatre event.
 * @param {Object} event - The event data object containing title, image, date, venue, etc.
 */
const EventCard = ({ event }) => {
  /**
   * getCleanDescription
   * Removes HTML tags (often present in scraped descriptions) and truncates text.
   * @param {string} html - The raw description string.
   * @returns {string} - Plain text truncated to 120 characters.
   */
  const getCleanDescription = (html) => {
    if (!html) return "No description available.";
    const cleanText = html.replace(/<\/?[^>]+(>|$)/g, ""); // RegEx to strip HTML tags
    return cleanText.length > 120 ? cleanText.substring(0, 120) + "..." : cleanText;
  };

  return (
    <div className="event-card">
      {/* Top Section: Visual and Venue Badge */}
      <div className="event-image-container">
        <img src={event.image} alt={event.title} className="event-image" />
        <div className="venue-badge">{event.venue}</div>
      </div>

      {/* Bottom Section: Text Info */}
      <div className="event-details">
        <div className="event-info-top">
          <span className="info-item">📅 {event.date}</span>
        </div>
        <h3>{event.title}</h3>
        <p className="event-description">{getCleanDescription(event.description)}</p>
        
        {/* Footer: Price and Navigation */}
        <div className="event-footer">
          <div className="event-price">From £{event.price.toFixed(2)}</div>
          <Link to={`/events/${event._id}`} className="view-details-btn">
            View Show &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
