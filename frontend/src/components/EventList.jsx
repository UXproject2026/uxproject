import { useState, useEffect } from 'react';
import EventCard from './EventCard';

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Default');

  const categories = ['All', 'Mystery', 'Jazz', 'Opera', 'Ballet'];

  useEffect(() => {
    let url = '/api/events';
    if (category !== 'All') {
      url += `?category=${category}`;
    }
    // We don't call setLoading(true) here to avoid cascading renders.
    // Instead, it's called in the event handler that changes the category.
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setEvents(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching events:', err);
        setLoading(false);
      });
  }, [category]);

  const sortedEvents = [...events].sort((a, b) => {
    if (sortBy === 'Price') return a.price - b.price;
    if (sortBy === 'Date') return new Date(a.date) - new Date(b.date);
    return 0;
  });

  if (loading && events.length === 0) return <div className="loading">Loading events...</div>;

  return (
    <div className="event-list-container">
      <div className="header">
        <h1>Events in March</h1>
        <p>Showing {category === 'All' ? 'all' : category} upcoming performances in Leeds</p>
      </div>

      <div className="filters">
        <button className="filter-btn" onClick={() => setShowFilters(true)}>
          ⚙️ Change Filters {category !== 'All' && `(${category})`}
        </button>
        <div className="sort">
          <span>Sort By</span>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option>Default</option>
            <option>Date</option>
            <option>Price</option>
          </select>
        </div>
      </div>

      {showFilters && (
        <div className="modal-overlay" onClick={() => setShowFilters(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Select Category</h3>
            <div className="category-grid">
              {categories.map(cat => (
                <button 
                  key={cat} 
                  className={`cat-option ${category === cat ? 'active' : ''}`}
                  onClick={() => {
                    setLoading(true); // Trigger loading here
                    setCategory(cat);
                    setShowFilters(false);
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
            <button className="close-modal" onClick={() => setShowFilters(false)}>Close</button>
          </div>
        </div>
      )}

      <div className="event-list">
        {loading ? (
          <div className="loading">Updating list...</div>
        ) : sortedEvents.length > 0 ? (
          sortedEvents.map(event => (
            <EventCard key={event._id} event={event} />
          ))
        ) : (
          <div className="no-events">No events found in this category.</div>
        )}
      </div>
    </div>
  );
};

export default EventList;
