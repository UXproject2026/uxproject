import { Link } from 'react-router-dom';

const EventCard = ({ event }) => {
  // Function to remove HTML tags and truncate text for the card view
  const getCleanDescription = (html) => {
    if (!html) return "No description available.";
    const cleanText = html.replace(/<\/?[^>]+(>|$)/g, ""); // Strip HTML tags
    return cleanText.length > 120 ? cleanText.substring(0, 120) + "..." : cleanText;
  };

  return (
    <div className="event-card">
      <div className="event-image-container">
        <img src={event.image} alt={event.title} className="event-image" />
        <div className="venue-badge">{event.venue}</div>
      </div>
      <div className="event-details">
        <div className="event-info-top">
          <span className="info-item">📅 {event.date}</span>
        </div>
        <h3>{event.title}</h3>
        <p className="event-description">{getCleanDescription(event.description)}</p>
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
