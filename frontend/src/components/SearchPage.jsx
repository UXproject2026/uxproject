import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import EventCard from './EventCard';

const SearchPage = () => {
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(20);
  const navigate = useNavigate();
  const location = useLocation();

  // Helper to parse date string into a sortable number
  const parseEventDate = (dateStr, timeStr) => {
    if (!dateStr || dateStr.includes('TBC')) return Infinity;
    
    try {
      // Format is "Friday 13 February" or similar
      const parts = dateStr.split(' ');
      if (parts.length < 3) return Infinity;
      
      const day = parseInt(parts[1]);
      const monthName = parts[2];
      const months = {
        'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4, 'June': 5,
        'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11
      };
      
      const month = months[monthName];
      if (month === undefined) return Infinity;
      
      // Assume current year (or next if month has passed)
      const now = new Date();
      let year = now.getFullYear();
      
      const date = new Date(year, month, day);
      
      // If date is in the past, assume it's for next year
      if (date < now && month < now.getMonth()) {
        date.setFullYear(year + 1);
      }

      if (timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        date.setHours(hours || 0, minutes || 0);
      }
      
      return date.getTime();
    } catch (e) {
      return Infinity;
    }
  };

  // Get initial category from URL if present
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get('category') || 'All';

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedVenue, setSelectedVenue] = useState('All');

  // Unique options for filters
  const [categories, setCategories] = useState(['All']);
  const [venues, setVenues] = useState(['All']);

  useEffect(() => {
    fetch('/api/events')
      .then(res => res.json())
      .then(data => {
        // Sort: Real images first, then by next available date
        const sortedData = [...data].sort((a, b) => {
          // Priority 1: Real images
          if (a.hasRealImage && !b.hasRealImage) return -1;
          if (!a.hasRealImage && b.hasRealImage) return 1;
          
          // Priority 2: Next available date
          const dateA = parseEventDate(a.date, a.time);
          const dateB = parseEventDate(b.date, b.time);
          
          if (dateA !== dateB) return dateA - dateB;
          
          return 0;
        });

        setAllEvents(sortedData);
        
        // Extract unique values for filters
        const cats = ['All', ...new Set(data.map(e => e.category))].filter(Boolean);
        const vens = ['All', ...new Set(data.map(e => e.venue))].filter(Boolean);
        
        setCategories(cats);
        setVenues(vens);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Derived state for filtered events
  const filteredEvents = allEvents.filter(event => {
    const matchSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                       event.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchCategory = selectedCategory === 'All' || event.category === selectedCategory;
    const matchVenue = selectedVenue === 'All' || event.venue === selectedVenue;

    return matchSearch && matchCategory && matchVenue;
  });

  const displayedEvents = filteredEvents.slice(0, limit);

  const handleLoadMore = () => {
    setLimit(prev => prev + 20);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedVenue('All');
    setLimit(20);
    navigate('/search');
  };

  return (
    <div className="search-page-container">
      <header className="page-header search-page-header">
        <button className="back-btn" onClick={() => navigate('/')}>&lt; Home</button>
        <h2>Explore Leeds Theatre</h2>
      </header>

      <section className="search-filter-section">
        <div className="search-main-bar">
          <span className="search-icon">🔍</span>
          <input 
            type="text" 
            className="main-search-input" 
            placeholder="Search for shows, actors, or keywords..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setLimit(20);
            }}
          />
          {(searchTerm || selectedCategory !== 'All' || selectedVenue !== 'All') && (
            <button className="clear-filters-btn" onClick={clearFilters}>Reset</button>
          )}
        </div>

        <div className="filter-grid">
          <div className="filter-group">
            <label className="filter-label">Genre</label>
            <select 
              value={selectedCategory} 
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setLimit(20);
              }}
              className="filter-select"
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Venue</label>
            <select 
              value={selectedVenue} 
              onChange={(e) => {
                setSelectedVenue(e.target.value);
                setLimit(20);
              }}
              className="filter-select"
            >
              {venues.map(ven => <option key={ven} value={ven}>{ven}</option>)}
            </select>
          </div>
        </div>
      </section>

      <div className="search-results-summary">
        {loading ? (
          <p>Loading live events...</p>
        ) : (
          <p>Showing <strong>{Math.min(limit, filteredEvents.length)}</strong> of <strong>{filteredEvents.length}</strong> live shows in Leeds</p>
        )}
      </div>

      <div className="search-results-grid">
        {loading ? (
          <div className="loading-state">Searching live listings...</div>
        ) : displayedEvents.length > 0 ? (
          <>
            <div className="event-list">
              {displayedEvents.map(event => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
            
            {filteredEvents.length > limit && (
              <div className="load-more-container">
                <button className="load-more-btn" onClick={handleLoadMore}>
                  Load More Shows
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="no-results-state">
            <span className="no-results-icon">🎭</span>
            <h3>No shows found</h3>
            <p>Try broadening your search or switching to "All" venues.</p>
            <button className="reset-btn" onClick={clearFilters}>Reset Filters</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
