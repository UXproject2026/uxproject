import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const MyTickets = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/bookings')
      .then(res => res.json())
      .then(data => {
        setBookings(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="loading">Loading tickets...</div>;

  // Helper to parse "Friday 13 March" into a date object for comparison
  const parseEventDate = (dateStr) => {
    try {
      if (!dateStr || dateStr === "Date TBC") return new Date(2099, 0, 1);
      // Basic parser for "Day DD Month" format
      const parts = dateStr.split(' ');
      const day = parseInt(parts[1]);
      const monthStr = parts[2];
      const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const month = months.indexOf(monthStr);
      // Defaulting to 2026 as per project context
      return new Date(2026, month, day);
    } catch (e) {
      return new Date(2099, 0, 1);
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const allValidBookings = bookings.filter(b => b.event);

  // Split into Upcoming and Past
  const upcoming = allValidBookings
    .filter(b => parseEventDate(b.event.date) >= today)
    .sort((a, b) => parseEventDate(a.event.date) - parseEventDate(b.event.date));

  const archived = allValidBookings
    .filter(b => parseEventDate(b.event.date) < today)
    .sort((a, b) => parseEventDate(b.event.date) - parseEventDate(a.event.date));

  const TicketCard = ({ booking, isArchived }) => {
    const isGA = booking.seat === "General Admission" || booking.seat?.includes("GA-");
    
    return (
      <div className={`ticket-card ${isArchived ? 'archived-ticket' : ''}`} style={{ 
        opacity: isArchived ? 0.7 : 1,
        filter: isArchived ? 'grayscale(0.5)' : 'none',
        marginBottom: '25px'
      }}>
        <div className="ticket-main">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h2>{booking.event?.title}</h2>
            {isArchived && <span style={{ background: '#eee', padding: '4px 10px', borderRadius: '5px', fontSize: '12px', fontWeight: 'bold' }}>PASSED</span>}
          </div>
          <p style={{ color: '#666', marginBottom: '15px' }}>{booking.event?.venue}</p>
          {!isArchived && (
            <div className="qr-container">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${booking.bookingRef}`} alt="Ticket QR Code" />
            </div>
          )}
        </div>
        <div className="ticket-details-grid">
          <div className="detail">
            <span className="label">DATE</span>
            <span className="value">{booking.event?.date}</span>
          </div>
          <div className="detail">
            <span className="label">TIME</span>
            <span className="value">{booking.event?.time}</span>
          </div>
          <div className="detail full">
            <span className="label">{isGA ? "ENTRY TYPE" : "SEAT(S)"}</span>
            <span className="value">
              {isGA ? "General Admission (Unreserved)" : booking.seat}
            </span>
          </div>
          {!isArchived && (
            <div className="detail full booking-ref">
              <span className="label">BOOKING REFERENCE</span>
              <span className="value" style={{ color: 'var(--primary-lavender)' }}>{booking.bookingRef}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="my-tickets-page">
      <div className="ticket-header">
        <button className="back-btn" onClick={() => navigate('/')}>&lt; Home</button>
        <h1>My Tickets</h1>
      </div>

      {allValidBookings.length > 0 ? (
        <>
          {/* Upcoming Section */}
          <section className="ticket-section">
            <h3 style={{ margin: '20px 0', paddingBottom: '10px', borderBottom: '2px solid var(--primary-lavender)' }}>
              Upcoming Events
            </h3>
            {upcoming.length > 0 ? (
              upcoming.map(b => <TicketCard key={b._id} booking={b} isArchived={false} />)
            ) : (
              <p style={{ color: '#666', fontStyle: 'italic', padding: '20px 0' }}>No upcoming shows scheduled.</p>
            )}
          </section>

          {/* Archived Section */}
          {archived.length > 0 && (
            <section className="ticket-section" style={{ marginTop: '60px' }}>
              <h3 style={{ margin: '20px 0', paddingBottom: '10px', borderBottom: '2px solid #ccc', color: '#888' }}>
                Archive / Past Bookings
              </h3>
              {archived.map(b => <TicketCard key={b._id} booking={b} isArchived={true} />) }
            </section>
          )}
        </>
      ) : (
        <div className="no-bookings" style={{ textAlign: 'center', padding: '60px 0' }}>
          <p>You have no active bookings.</p>
          <Link to="/search" className="view-details-btn" style={{ maxWidth: '200px', margin: '20px auto', display: 'block', textDecoration: 'none' }}>Browse Events</Link>
        </div>
      )}
    </div>
  );
};

export default MyTickets;
