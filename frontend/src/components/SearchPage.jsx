import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import EventCard from './EventCard';

const SearchPage = () => {
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

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
        // Sort: Events with real images first
        const sortedData = [...data].sort((a, b) => {
          if (a.hasRealImage && !b.hasRealImage) return -1;
          if (!a.hasRealImage && b.hasRealImage) return 1;
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

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedVenue('All');
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
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {(searchTerm || selectedCategory !== 'All' || selectedVenue !== 'All') && (
            <button className="clear-filters-btn" onClick={clearFilters}>Reset</button>
          )}
        </div>

        <div className="filter-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' }}>
          <div className="filter-group">
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Genre</label>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Venue</label>
            <select 
              value={selectedVenue} 
              onChange={(e) => setSelectedVenue(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
            >
              {venues.map(ven => <option key={ven} value={ven}>{ven}</option>)}
            </select>
          </div>
        </div>
      </section>

      <div className="search-results-summary" style={{ marginTop: '20px', padding: '0 5px' }}>
        {loading ? (
          <p>Loading live events...</p>
        ) : (
          <p>Showing <strong>{filteredEvents.length}</strong> live shows in Leeds</p>
        )}
      </div>

      <div className="search-results-grid" style={{ marginTop: '20px' }}>
        {loading ? (
          <div className="loading" style={{ textAlign: 'center', padding: '50px' }}>Searching live listings...</div>
        ) : filteredEvents.length > 0 ? (
          <div className="event-list">
            {filteredEvents.map(event => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        ) : (
          <div className="no-results-state" style={{ textAlign: 'center', padding: '60px 20px', background: '#f9f9f9', borderRadius: '20px' }}>
            <span className="no-results-icon" style={{ fontSize: '48px' }}>🎭</span>
            <h3>No shows found</h3>
            <p>Try broadening your search or switching to "All" venues.</p>
            <button className="view-details-btn" style={{ maxWidth: '200px', margin: '20px auto' }} onClick={clearFilters}>Reset Filters</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
