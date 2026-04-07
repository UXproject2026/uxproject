import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import EventCard from './EventCard';

/**
 * SearchPage Component
 * Provides a comprehensive search and filter interface for all theatre events in Leeds.
 */
const SearchPage = () => {
  // --- State Management ---
  const [allEvents, setAllEvents] = useState([]); // Full list of events from API
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(20);         // Pagination limit
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Helper: parseEventDate
   * Converts custom date strings (e.g., "Friday 13 February") into timestamps for sorting.
   * Handles year rollover (if month is past, assume next year).
   */
  const parseEventDate = (dateStr, timeStr) => {
    if (!dateStr || dateStr.includes('TBC')) return Infinity;
    
    try {
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
      
      const now = new Date();
      let year = now.getFullYear();
      const date = new Date(year, month, day);
      
      // Smart year detection
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

  // --- Filter Initialization ---
  // Read category from URL query params (e.g., ?category=Musical)
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get('category') || 'All';

  // --- Filter States ---
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedVenue, setSelectedVenue] = useState('All');

  // Unique options for the dropdown filters
  const [categories, setCategories] = useState(['All']);
  const [venues, setVenues] = useState(['All']);

  /**
   * Effect: Initial Data Fetch
   * Loads all events and calculates unique categories/venues for filters.
   */
  useEffect(() => {
    fetch('/api/events')
      .then(res => res.json())
      .then(data => {
        // Sort: Items with real photos first, then by date chronological
        const sortedData = [...data].sort((a, b) => {
          if (a.hasRealImage && !b.hasRealImage) return -1;
          if (!a.hasRealImage && b.hasRealImage) return 1;
          
          const dateA = parseEventDate(a.date, a.time);
          const dateB = parseEventDate(b.date, b.time);
          if (dateA !== dateB) return dateA - dateB;
          return 0;
        });

        setAllEvents(sortedData);
        
        // Populate filter options dynamically based on data
        const cats = ['All', ...new Set(data.map(e => e.category))].filter(Boolean);
        const vens = ['All', ...new Set(data.map(e => e.venue))].filter(Boolean);
        setCategories(cats);
        setVenues(vens);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  /**
   * Logic: Client-side Filtering
   * Filters the 'allEvents' array based on search text, genre, and venue.
   */
  const filteredEvents = allEvents.filter(event => {
    const matchSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                       event.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchCategory = selectedCategory === 'All' || event.category === selectedCategory;
    const matchVenue = selectedVenue === 'All' || event.venue === selectedVenue;

    return matchSearch && matchCategory && matchVenue;
  });

  // Slice for pagination
  const displayedEvents = filteredEvents.slice(0, limit);

  const handleLoadMore = () => {
    setLimit(prev => prev + 20);
  };

  /**
   * Resets all search and filter states to default.
   */
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedVenue('All');
    setLimit(20);
    navigate('/search');
  };

  return (
    <div className="search-page-container">
      {/* Page Header */}
      <header className="page-header search-page-header">
        <button className="back-btn" onClick={() => navigate('/')}>&lt; Home</button>
        <h2>Explore Leeds Theatre</h2>
      </header>

      {/* Main Search & Filter UI */}
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
              setLimit(20); // Reset pagination on new search
            }}
          />
          {(searchTerm || selectedCategory !== 'All' || selectedVenue !== 'All') && (
            <button className="clear-filters-btn" onClick={clearFilters}>Reset</button>
          )}
        </div>

        <div className="filter-grid">
          {/* Genre Filter */}
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

          {/* Venue Filter */}
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

      {/* Results Summary */}
      <div className="search-results-summary">
        {loading ? (
          <p>Loading live events...</p>
        ) : (
          <p>Showing <strong>{Math.min(limit, filteredEvents.length)}</strong> of <strong>{filteredEvents.length}</strong> live shows in Leeds</p>
        )}
      </div>

      {/* Event Grid & Load More */}
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
          /* Empty State */
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
