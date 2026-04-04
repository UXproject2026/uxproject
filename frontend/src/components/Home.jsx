import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import EventCard from './EventCard';
import heroImage from '../assets/hero.png';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

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
  const getFeaturedEvents = (category, count = 3) => {
    const filtered = events.filter(e => e.category === category);
    
    // Separate into those with and without real images
    const withImages = filtered.filter(e => e.hasRealImage);
    const withoutImages = filtered.filter(e => !e.hasRealImage);
    
    // Shuffle the "with images" group to keep it fresh
    const shuffledWith = [...withImages].sort(() => 0.5 - Math.random());
    
    // If we have enough with images, return them
    if (shuffledWith.length >= count) {
      return shuffledWith.slice(0, count);
    }
    
    // Otherwise, fill the remaining slots with shows without images
    const remaining = count - shuffledWith.length;
    const shuffledWithout = [...withoutImages].sort(() => 0.5 - Math.random());
    
    return [...shuffledWith, ...shuffledWithout.slice(0, remaining)];
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
              ScenePass has been the cornerstone of the city's cultural landscape for over a century. 
              We are dedicated to bringing world-class performances to our community.
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
        <section key={category} className="featured-section" style={{ padding: '40px 0' }}>
          <div className="section-header">
            <h2>Upcoming {category}</h2>
            <Link to={`/search?category=${category}`} className="view-all-link" style={{ color: 'var(--primary-lavender)', fontWeight: 'bold', textDecoration: 'none' }}>View All &rarr;</Link>
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
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Enter your email address" required />
            <button type="submit">Join the List</button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Home;
