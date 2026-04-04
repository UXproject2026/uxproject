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
        <h3>{event.title}</h3>
        <p className="event-description">{getCleanDescription(event.description)}</p>
        <div className="event-info">
          <div className="info-item">
            <span className="icon">📅</span>
            <span>{event.date}</span>
          </div>
          <div className="info-item">
            <span className="icon">🕒</span>
            <span>{event.time}</span>
          </div>
        </div>
        <Link to={`/events/${event._id}`} className="view-details-btn">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default EventCard;
