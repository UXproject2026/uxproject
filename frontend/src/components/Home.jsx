import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import EventCard from './EventCard';
import heroImage from '../assets/hero.png';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper to parse date string into a sortable number
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

  useEffect(() => {
    fetch('/api/events')
      .then(res => res.json())
      .then(data => {
        setEvents(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const categories = ['Opera', 'Live Music', 'Ballet'];

  // Helper function to get events for each category, prioritizing those with real images
  const getFeaturedEvents = (category, count = 4) => {
    const filtered = events.filter(e => e.category === category);
    
    // Sort all filtered events by date first
    const sortedByDate = [...filtered].sort((a, b) => {
      const dateA = parseEventDate(a.date, a.time);
      const dateB = parseEventDate(b.date, b.time);
      return dateA - dateB;
    });
    
    // Separate into those with and without real images (keeping their date order)
    const withImages = sortedByDate.filter(e => e.hasRealImage);
    const withoutImages = sortedByDate.filter(e => !e.hasRealImage);
    
    // If we have enough with images, return the first 'count' (which are the soonest)
    if (withImages.length >= count) {
      return withImages.slice(0, count);
    }
    
    // Otherwise, fill the remaining slots with shows without images (also soonest first)
    const remaining = count - withImages.length;
    return [...withImages, ...withoutImages.slice(0, remaining)];
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay">
          <div className="hero-content">
            <h1>Experience the Magic of Live Theatre</h1>
            <p>From breathtaking ballet to gripping mystery, discover the best of Leeds' performing arts.</p>
            <div className="hero-actions">
              <Link to="/search" className="hero-btn primary">Find a Show</Link>
            </div>
          </div>
        </div>
        <img src={heroImage} alt="ScenePass Hero" className="hero-bg-image" />
      </section>

      {/* About Us Section */}
      <section className="about-section">
        <div className="about-grid">
          <div className="about-text">
            <span className="section-label">Our Story</span>
            <h2>The Heart of Performing Arts in Leeds</h2>
            <p>
              ScenePass is a premier platform dedicated to connecting audiences with the vibrant theatre scene of Leeds. We provide a seamless experience for discovering, exploring, and securing your place at the city's most prestigious venues.
            </p>
            <div className="about-stats">
              <div className="stat-item">
                <strong>100+</strong>
                <span>Years of History</span>
              </div>
              <div className="stat-item">
                <strong>50k+</strong>
                <span>Annual Visitors</span>
              </div>
            </div>
          </div>
          <div className="about-image-placeholder">
            <img src="https://images.unsplash.com/photo-1516307365426-bea591f05011?q=80&w=600&auto=format&fit=crop" alt="Theatre Interior" />
          </div>
        </div>
      </section>

      {/* Featured Shows Sections */}
      {categories.map(category => (
        <section key={category} className="featured-section">
          <div className="section-header">
            <div>
              <span className="section-label">Discover</span>
              <h2>Upcoming {category}</h2>
            </div>
            <Link to={`/search?category=${category}`} className="view-all-link">View All &rarr;</Link>
          </div>
          
          {loading ? (
            <div className="loading">Loading {category}...</div>
          ) : (
            <div className="event-list">
              {getFeaturedEvents(category).map(event => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          )}
        </section>
      ))}

      {/* Newsletter Section */}
      <section className="newsletter-section">
        <div className="newsletter-content">
          <h2>Stay in the Spotlight</h2>
          <p>Subscribe to our newsletter for early access to tickets and exclusive content.</p>
          <form className="newsletter-form" onSubmit={() => {}}>
            <input type="email" placeholder="Enter your email address" required />
            <button type="submit">Join the List</button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Home;
