import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';

/**
 * SeatingPlanPopup Component: A specialized component that displays an SVG map
 * with the user's booked seats highlighted.
 * 
 * SEATING PLAN LOGIC (Highlighting):
 * 1. Fetches the full seating plan for the event.
 * 2. Flattens nested venue areas to find all available seats.
 * 3. Compares the user's booked seat identifiers (e.g., "A12") with the seats in the map.
 * 4. Highlights the matching seats using a distinct color.
 */
const SeatingPlanPopup = ({ eventId, bookedSeats, onClose }) => {
  const [planData, setPlanData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/events/${eventId}/seating-plan`)
      .then(res => res.json())
      .then(data => {
        if (data.error || !data.areas || data.areas.length === 0) {
          setPlanData(null);
        } else {
          const allFoundAreas = [];
          
          /**
           * Recursively processes areas to find those with seats.
           * Calculates dynamic viewBox for each area to ensure proper SVG scaling.
           */
          const processArea = (area) => {
            if (area.seats && area.seats.length > 0) {
              let minX = 10000, minY = 10000, maxX = 0, maxY = 0;
              area.seats.forEach(seat => {
                if (seat.x < minX) minX = seat.x;
                if (seat.y < minY) minY = seat.y;
                if (seat.x > maxX) maxX = seat.x;
                if (seat.y > maxY) maxY = seat.y;
              });
              const padding = 30;
              allFoundAreas.push({
                ...area,
                viewBox: `${minX - padding} ${minY - padding} ${(maxX - minX) + padding * 2} ${(maxY - minY) + padding * 2}`
              });
            }
            if (area.areas && area.areas.length > 0) {
              area.areas.forEach(processArea);
            }
          };
          
          data.areas.forEach(processArea);

          // Normalization logic to match seat names (e.g., handling spaces and casing)
          const normalizedBooked = bookedSeats.map(s => s.trim().toUpperCase());
          const isMatch = (seatName, seatRow, seatNum) => {
            const sName = (seatName || "").toUpperCase();
            const sRow = (seatRow || "").toUpperCase();
            const sNum = String(seatNum || "");
            const sConcat = (sRow + sNum).replace(/\s+/g, '');
            
            return normalizedBooked.some(nb => {
              const nbClean = nb.replace(/\s+/g, '');
              return sName === nb || sConcat === nbClean;
            });
          };

          // Only show areas that contain at least one of the user's booked seats
          const relevantAreas = allFoundAreas.filter(area => 
            area.seats?.some(seat => isMatch(seat.name, seat.row, seat.number))
          );

          setPlanData({ ...data, areas: relevantAreas });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [eventId, bookedSeats]);

  // Utility to reuse the matching logic in the render phase
  const isMatch = (seatName, seatRow, seatNum, normalizedBooked) => {
    const sName = (seatName || "").toUpperCase();
    const sRow = (seatRow || "").toUpperCase();
    const sNum = String(seatNum || "");
    const sConcat = (sRow + sNum).replace(/\s+/g, '');
    
    return normalizedBooked.some(nb => {
      const nbClean = nb.replace(/\s+/g, '');
      return sName === nb || sConcat === nbClean;
    });
  };

  if (loading) return <div className="plan-popup-loading">Loading map...</div>;
  if (!planData || planData.areas.length === 0) return <div className="plan-popup-empty">Map unavailable</div>;

  const normalizedBooked = bookedSeats.map(s => s.trim().toUpperCase());

  return (
    <div className="seating-plan-popup-content visual-map-popup">
      <div className="popup-header">
        <span className="popup-title">Your Seat Location</span>
        <button className="popup-close-x" onClick={(e) => { e.stopPropagation(); onClose(); }}>×</button>
      </div>
      
      {planData.areas.map((area) => (
        <div key={area.id} className="popup-area-section">
          <h4 className="popup-area-title">{area.name}</h4>
          <div className="svg-wrapper" style={{ background: 'var(--bg-subtle)', borderRadius: '8px', padding: '10px' }}>
            <svg viewBox={area.viewBox} width="100%" height="auto" style={{ display: 'block' }}>
              {area.seats?.map(seat => {
                const isBooked = isMatch(seat.name, seat.row, seat.number, normalizedBooked);
                return (
                  <circle
                    key={seat.id} cx={seat.x} cy={seat.y} r="10"
                    fill={isBooked ? 'var(--primary-lavender)' : '#fff'}
                    stroke={isBooked ? 'var(--accent-purple)' : '#ccc'}
                    strokeWidth="2"
                  />
                );
              })}
            </svg>
          </div>
          <div className="plan-legend-mini">
            <span className="legend-item"><span className="dot booked"></span> Your Seat</span>
            <span className="legend-item"><span className="dot" style={{ border: '1px solid #ccc', background: '#fff' }}></span> Available</span>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * MyTickets Component: Lists all bookings associated with the user.
 * Organizes tickets into 'Upcoming' and 'Archive' sections based on the event date.
 */
const MyTickets = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  /**
   * API FETCHING:
   * Retrieves all bookings from the API.
   * In a real app, the backend would filter these based on the authenticated user's session.
   */
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

  /**
   * Helper to convert "Monday 15 March" strings into Date objects for comparison.
   */
  const parseEventDate = (dateStr) => {
    try {
      if (!dateStr || dateStr === "Date TBC") return new Date(2099, 0, 1);
      const parts = dateStr.split(' ');
      const day = parseInt(parts[1]);
      const monthStr = parts[2];
      const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const month = months.indexOf(monthStr);
      return new Date(2026, month, day);
    } catch (e) {
      return new Date(2099, 0, 1);
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const allValidBookings = bookings.filter(b => b.event);

  // Split bookings into Upcoming and Past categories
  const upcoming = allValidBookings
    .filter(b => parseEventDate(b.event.date) >= today)
    .sort((a, b) => parseEventDate(a.event.date) - parseEventDate(b.event.date));

  const archived = allValidBookings
    .filter(b => parseEventDate(b.event.date) < today)
    .sort((a, b) => parseEventDate(b.event.date) - parseEventDate(a.event.date));

  /**
   * TicketCard Component: Displays individual booking details.
   * Includes a QR code generator and a conditional seating plan trigger.
   */
  const TicketCard = ({ booking, isArchived }) => {
    const [showPopup, setShowPopup] = useState(false);
    const popupRef = useRef(null);
    
    // Normalize seat data into an array for consistent processing
    const bookedSeatsArray = typeof booking.seat === 'string' 
      ? booking.seat.split(',').map(s => s.trim()) 
      : (Array.isArray(booking.seat) ? booking.seat : [booking.seat]);

    const isGA = booking.seat?.toString().includes("General Admission");

    /**
     * UI LOGIC: 
     * Handles closing the seating map popup when clicking outside of it.
     */
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (popupRef.current && !popupRef.current.contains(event.target)) {
          setShowPopup(false);
        }
      };
      if (showPopup) {
        document.addEventListener('mousedown', handleClickOutside);
      }
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showPopup]);

    return (
      <div className={`ticket-card ${isArchived ? 'archived-ticket' : ''}`} style={{ 
        opacity: isArchived ? 0.7 : 1,
        filter: isArchived ? 'grayscale(0.5)' : 'none',
        marginBottom: '25px',
        position: 'relative'
      }}>
        <div className="ticket-main">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h2>{booking.event?.title}</h2>
            {isArchived && <span style={{ background: '#eee', padding: '4px 10px', borderRadius: '5px', fontSize: '12px', fontWeight: 'bold' }}>PASSED</span>}
          </div>
          <p style={{ color: '#666', marginBottom: '15px' }}>{booking.event?.venue}</p>
          {!isArchived && (
            <div className="qr-container">
              {/* Uses a public API to generate a dynamic QR code based on the booking reference */}
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${booking.bookingRef}`} alt="Ticket QR Code" />
            </div>
          )}
        </div>
        <div className="ticket-details-grid">
          <div className="detail">
            <span className="label">DATE: </span>
            <span className="value">{booking.event?.date}</span>
          </div>
          <div className="detail">
            <span className="label">TIME: </span>
            <span className="value">{booking.event?.time}</span>
          </div>
          <div className="detail full">
            <span className="label">{isGA ? "ENTRY TYPE" : "SEAT(S): "}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span className="value">
                {isGA 
                  ? `General Admission (Unreserved) - ${booking.ticketCount || 1} Ticket${booking.ticketCount !== 1 ? 's' : ''}` 
                  : bookedSeatsArray.join(", ")}
              </span>
              {!isGA && !isArchived && (
                <button 
                  className="view-map-btn" 
                  onClick={(e) => { e.stopPropagation(); setShowPopup(!showPopup); }}
                >
                  📍 View seating
                </button>
              )}
            </div>

            {/* SEATING MAP POPUP: Only shown for reserved seating and upcoming events */}
            {showPopup && !isArchived && (
              <div className="seating-plan-popup" ref={popupRef}>
                <SeatingPlanPopup 
                  eventId={booking.event?._id} 
                  bookedSeats={bookedSeatsArray} 
                  onClose={() => setShowPopup(false)}
                />
              </div>
            )}
          </div>
          {!isArchived && (
            <div className="detail full booking-ref">
              <span className="label">BOOKING REFERENCE: </span>
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
