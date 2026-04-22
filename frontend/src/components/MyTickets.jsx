import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';

/**
 * --- VENUE COORDINATES AND ADDRESSES ---
 */
const VENUE_LOCATIONS = {
  "Leeds Grand Theatre": {
    address: "46 New Briggate, Leeds LS1 6NU",
    mapUrl: "https://maps.google.com/maps?q=Leeds%20Grand%20Theatre&t=&z=15&ie=UTF8&iwloc=&output=embed",
    directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=Leeds+Grand+Theatre+LS1+6NU"
  },
  "City Varieties Music Hall": {
    address: "Swan St, Leeds LS1 6LW",
    mapUrl: "https://maps.google.com/maps?q=City%20Varieties%20Music%20Hall&t=&z=15&ie=UTF8&iwloc=&output=embed",
    directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=City+Varieties+Music+Hall+LS1+6LW"
  },
  "Hyde Park Picture House": {
    address: "73 Brudenell Rd, Leeds LS6 1JD",
    mapUrl: "https://maps.google.com/maps?q=Hyde%20Park%20Picture%20House&t=&z=15&ie=UTF8&iwloc=&output=embed",
    directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=Hyde+Park+Picture+House+LS6+1JD"
  },
  "Opera North": {
    address: "32 New Briggate, Leeds LS1 6NU",
    mapUrl: "https://maps.google.com/maps?q=Opera%20North%20Leeds&t=&z=15&ie=UTF8&iwloc=&output=embed",
    directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=Opera+North+Leeds"
  },
  "Northern Ballet": {
    address: "Quarry Hill, Leeds LS2 7PA",
    mapUrl: "https://maps.google.com/maps?q=Northern%20Ballet%20Leeds&t=&z=15&ie=UTF8&iwloc=&output=embed",
    directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=Northern+Ballet+Leeds"
  }
};

/**
 * --- VENUE MAP COMPONENT ---
 */
const VenueMap = ({ venueName }) => {
  const venue = VENUE_LOCATIONS[venueName] || VENUE_LOCATIONS["Leeds Grand Theatre"];

  return (
    <div className="venue-map-container" style={{ marginTop: '15px' }}>
      <iframe
        title="Venue Location"
        src={venue.mapUrl}
        width="100%"
        height="250"
        style={{ border: '1px solid var(--border-medium)', borderRadius: '12px' }}
        allowFullScreen=""
        loading="lazy"
      ></iframe>
      <div className="venue-info-box" style={{ marginTop: '15px' }}>
        <p className="venue-address" style={{ fontSize: '16px', fontWeight: '700' }}>{venue.address}</p>
        <a 
          href={venue.directionsUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="directions-link"
          style={{ 
            display: 'inline-block', 
            marginTop: '10px', 
            padding: '12px 20px', 
            background: 'var(--primary-lavender)', 
            color: 'white', 
            borderRadius: 'var(--radius-full)',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '15px'
          }}
        >
          🚗 Open in Google Maps (GPS)
        </a>
      </div>
    </div>
  );
};

/**
 * SeatingPlanPopup: Displays the venue map for the booked tickets.
 * ENHANCED ACCESSIBILITY: Standardized with EventDetails (radius 60, stroke 8, scale 8.0).
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
          const scale = 8.0; // Standardized spacing factor
          const processArea = (area) => {
            if (area.seats && area.seats.length > 0) {
              let minX = 10000, minY = 10000, maxX = 0, maxY = 0;
              area.seats.forEach(seat => {
                const sx = seat.x * scale;
                const sy = seat.y * scale;
                if (sx < minX) minX = sx;
                if (sy < minY) minY = sy;
                if (sx > maxX) maxX = sx;
                if (sy > maxY) maxY = sy;
              });
              const padding = 300; 
              allFoundAreas.push({
                ...area,
                scale,
                viewBox: `${minX - padding} ${minY - padding} ${(maxX - minX) + padding * 2} ${(maxY - minY) + padding * 2}`
              });
            }
            if (area.areas && area.areas.length > 0) {
              area.areas.forEach(processArea);
            }
          };
          data.areas.forEach(processArea);

          const normalize = (s) => String(s || "").toUpperCase().replace(/ROW|SEAT|[\s,]/g, "");
          const normalizedBooked = bookedSeats.map(s => s.trim().toUpperCase());

          const isMatch = (seat, bookedArray) => {
            const sRow = String(seat.row || "").toUpperCase();
            const sNum = String(seat.number || seat.name || "").toUpperCase();
            const sFull = normalize(sRow + sNum);
            return bookedArray.some(nb => {
              const nbNorm = normalize(nb);
              return nbNorm === sFull || (sFull.length > 0 && nbNorm.includes(sFull)) || (nbNorm.length > 0 && sFull.includes(nbNorm));
            });
          };

          let relevantAreas = allFoundAreas.filter(area => 
            area.seats?.some(seat => isMatch(seat, normalizedBooked))
          );

          if (relevantAreas.length === 0) relevantAreas = allFoundAreas;
          setPlanData({ ...data, areas: relevantAreas });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [eventId, bookedSeats]);

  const isMatchRender = (seat, bookedArray) => {
    const normalize = (s) => String(s || "").toUpperCase().replace(/ROW|SEAT|[\s,]/g, "");
    const sRow = String(seat.row || "").toUpperCase();
    const sNum = String(seat.number || seat.name || "").toUpperCase();
    const sFull = normalize(sRow + sNum);
    return bookedArray.some(nb => {
      const nbNorm = normalize(nb);
      return nbNorm === sFull || (sFull.length > 0 && nbNorm.includes(sFull)) || (nbNorm.length > 0 && sFull.includes(nbNorm));
    });
  };

  if (loading) return <div className="plan-popup-loading" style={{ padding: '40px', textAlign: 'center', fontSize: '20px' }}>Loading visual map...</div>;
  if (!planData || planData.areas.length === 0) return <div className="plan-popup-empty" style={{ padding: '40px', textAlign: 'center', fontSize: '20px' }}>Visual map unavailable for this venue.</div>;

  const normalizedBooked = bookedSeats.map(s => s.trim().toUpperCase());

  return (
    <div className="seating-plan-popup-content visual-map-popup" style={{ maxHeight: '85vh', overflowY: 'auto', borderRadius: '20px' }}>
      <div className="popup-header" style={{ padding: '25px', background: 'var(--soft-lavender)', borderBottom: '3px solid var(--primary-lavender)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
        <span className="popup-title" style={{ fontSize: '22px', fontWeight: '800', color: 'var(--accent-purple)' }}>Your Seat Location</span>
        <button className="popup-close-x" onClick={(e) => { e.stopPropagation(); onClose(); }} style={{ fontSize: '32px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-purple)', fontWeight: 'bold' }}>×</button>
      </div>
      
      {planData.areas.map((area) => (
        <div key={area.id} className="popup-area-section" style={{ padding: '30px' }}>
          <h4 className="popup-area-title" style={{ fontSize: '24px', textAlign: 'center', marginBottom: '20px', color: 'var(--accent-purple)', fontWeight: '700' }}>{area.name}</h4>
          <div className="svg-wrapper" style={{ background: '#eee', borderRadius: '20px', padding: '25px', border: '1px solid #ccc' }}>
            <svg viewBox={area.viewBox} width="100%" height="auto" style={{ display: 'block', maxHeight: '600px' }}>
              {area.seats?.map(seat => {
                const isBooked = isMatchRender(seat, normalizedBooked);
                const isAccessible = seat.isWheelchairSpace || seat.isAccessible || seat.attributes?.IsWheelchairSpace || seat.row === 'A';

                return (
                  <g key={seat.id}>
                    <circle
                      cx={seat.x * area.scale} cy={seat.y * area.scale} r="80"
                      fill={isBooked ? 'var(--accent-purple)' : '#fff'}
                      stroke={isAccessible ? '#2ecc71' : (isBooked ? '#fff' : 'var(--primary-lavender)')}
                      strokeWidth={isAccessible ? "12" : "8"}
                      role="img"
                      aria-label={`${isAccessible ? 'Accessible ' : ''}${seat.row ? `Row ${seat.row}, ` : ''}Seat ${seat.number || seat.name}${isBooked ? ' - YOUR SEAT' : ''}`}
                    />
                    {isAccessible && !isBooked && (
                      <text 
                        x={seat.x * area.scale} y={seat.y * area.scale + 25} 
                        textAnchor="middle" style={{ pointerEvents: 'none', fontSize: '80px', fill: '#2ecc71' }}
                      >♿</text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="plan-legend-mini" style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginTop: '20px', flexWrap: 'wrap' }}>
            <span className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '15px', fontSize: '24px', fontWeight: '800' }}>
              <span className="dot" style={{ width: '50px', height: '50px', background: 'var(--accent-purple)', borderRadius: '50%' }}></span> Your Seat
            </span>
            <span className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '15px', fontSize: '24px', fontWeight: '800' }}>
              <span className="dot" style={{ width: '50px', height: '50px', background: '#fff', border: '6px solid var(--primary-lavender)', borderRadius: '50%' }}></span> Other Seats
            </span>
            <span className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '15px', fontSize: '24px', fontWeight: '800' }}>
              <span className="dot" style={{ width: '50px', height: '50px', border: '6px solid #2ecc71', background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>♿</span> Accessible
            </span>
          </div>
        </div>
      ))}
      <p style={{ padding: '0 30px 30px', textAlign: 'center', color: '#444', fontSize: '16px', fontWeight: '600' }}>
        Seats are highlighted in deep purple for maximum visibility.
      </p>
    </div>
  );
};

/**
 * TicketCard Component: Displays individual booking details.
 */
const TicketCard = ({ booking, isArchived }) => {
  const [showPopup, setShowPopup] = useState(false);
  const popupRef = useRef(null);
  
  const bookedSeatsArray = typeof booking.seat === 'string' 
    ? booking.seat.split(',').map(s => s.trim()) 
    : (Array.isArray(booking.seat) ? booking.seat : [booking.seat]);

  const isGA = booking.seat?.toString().includes("General Admission");

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
      opacity: isArchived ? 0.8 : 1,
      marginBottom: '30px',
      position: 'relative',
      background: 'white',
      borderRadius: '20px',
      boxShadow: 'var(--shadow-lg)',
      border: isArchived ? '1px solid #ccc' : '2px solid var(--primary-lavender)',
      overflow: 'visible'
    }}>
      <div className="ticket-main" style={{ padding: '25px', borderBottom: '2px dashed var(--border-medium)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 5px 0', color: 'var(--accent-purple)' }}>{booking.event?.title}</h2>
            <p style={{ fontSize: '18px', color: '#444', fontWeight: '600', margin: 0 }}>{booking.event?.venue}</p>
          </div>
          {isArchived && <span style={{ background: '#666', color: 'white', padding: '6px 15px', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold' }}>PAST SHOW</span>}
        </div>
        
        {!isArchived && (
          <div className="qr-container" style={{ marginTop: '20px', textAlign: 'center', background: '#f9f9f9', padding: '20px', borderRadius: '15px', border: '1px solid #eee' }}>
            <p style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px', color: '#666' }}>SCAN FOR ENTRY</p>
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${booking.bookingRef}`} 
              alt="Ticket QR Code" 
              style={{ width: '180px', height: '180px' }}
            />
            <p style={{ marginTop: '15px', fontSize: '20px', fontWeight: '800', letterSpacing: '2px', color: 'var(--accent-purple)' }}>{booking.bookingRef}</p>
          </div>
        )}
      </div>

      <div className="ticket-details-grid" style={{ padding: '25px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="detail">
          <span style={{ display: 'block', fontSize: '13px', color: '#888', fontWeight: 'bold', textTransform: 'uppercase' }}>DATE</span>
          <span style={{ fontSize: '18px', fontWeight: '700' }}>{booking.event?.date}</span>
        </div>
        <div className="detail">
          <span style={{ display: 'block', fontSize: '13px', color: '#888', fontWeight: 'bold', textTransform: 'uppercase' }}>TIME</span>
          <span style={{ fontSize: '18px', fontWeight: '700' }}>{booking.event?.time}</span>
        </div>
        <div className="detail" style={{ gridColumn: 'span 2', padding: '15px', background: 'var(--bg-subtle)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
          <span style={{ display: 'block', fontSize: '13px', color: '#888', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '5px' }}>
            {isGA ? "ENTRY TYPE" : "YOUR SEATS"}
          </span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '22px', fontWeight: '800', color: 'var(--accent-purple)' }}>
              {isGA 
                ? `General Admission (${booking.ticketCount || 1} Person${booking.ticketCount !== 1 ? 's' : ''})` 
                : bookedSeatsArray.join(", ")}
            </span>
            {!isGA && !isArchived && (
              <button 
                className="view-map-btn" 
                onClick={(e) => { e.stopPropagation(); setShowPopup(!showPopup); }}
                style={{ 
                  background: 'var(--accent-purple)', 
                  color: 'white', 
                  padding: '10px 18px', 
                  borderRadius: '10px', 
                  fontWeight: 'bold',
                  fontSize: '14px',
                  cursor: 'pointer',
                  border: 'none',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                }}
              >
                📍 View Seating Map
              </button>
            )}
          </div>

          {showPopup && !isArchived && (
            <div className="seating-plan-popup" ref={popupRef} style={{ 
              position: 'fixed', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)', 
              width: '90%', 
              maxWidth: '600px', 
              zIndex: 1000, 
              background: 'white', 
              borderRadius: '20px', 
              boxShadow: '0 0 0 1000px rgba(0,0,0,0.7)',
              border: '2px solid var(--primary-lavender)'
            }}>
              <SeatingPlanPopup 
                eventId={booking.event?._id} 
                bookedSeats={bookedSeatsArray} 
                onClose={() => setShowPopup(false)}
              />
            </div>
          )}
        </div>

        {!isArchived && (
          <div className="detail" style={{ gridColumn: 'span 2', marginTop: '10px' }}>
            <span style={{ display: 'block', fontSize: '13px', color: '#888', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '10px' }}>Venue Location</span>
            <VenueMap venueName={booking.event?.venue} />
          </div>
        )}
      </div>
    </div>
  );
};

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

  if (loading) return <div className="loading" style={{ padding: '100px', textAlign: 'center', fontSize: '24px', fontWeight: 'bold' }}>Loading your tickets...</div>;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const allValidBookings = bookings.filter(b => b.event);
  const upcoming = allValidBookings
    .filter(b => parseEventDate(b.event.date) >= today)
    .sort((a, b) => parseEventDate(a.event.date) - parseEventDate(b.event.date));

  const archived = allValidBookings
    .filter(b => parseEventDate(b.event.date) < today)
    .sort((a, b) => parseEventDate(b.event.date) - parseEventDate(a.event.date));

  return (
    <div className="my-tickets-page" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div className="ticket-header" style={{ marginBottom: '40px', textAlign: 'center' }}>
        <button className="back-btn" onClick={() => navigate('/')} style={{ float: 'left' }}>&lt; Home</button>
        <h1 style={{ fontSize: '36px', fontWeight: '800', color: 'var(--accent-purple)' }}>My Tickets</h1>
        <p style={{ color: '#666', fontSize: '18px' }}>Manage your bookings and view venue directions.</p>
      </div>

      {allValidBookings.length > 0 ? (
        <>
          <section className="ticket-section">
            <h3 style={{ fontSize: '22px', margin: '30px 0 20px', paddingBottom: '10px', borderBottom: '3px solid var(--primary-lavender)', color: 'var(--accent-purple)' }}>
              Upcoming Shows
            </h3>
            {upcoming.length > 0 ? (
              upcoming.map(b => <TicketCard key={b._id} booking={b} isArchived={false} />)
            ) : (
              <div style={{ padding: '40px', background: '#f9f9f9', borderRadius: '15px', textAlign: 'center', color: '#666' }}>
                <p>No upcoming shows scheduled. Time to book something!</p>
                <Link to="/search" style={{ color: 'var(--primary-lavender)', fontWeight: 'bold', textDecoration: 'underline' }}>Browse Events &rarr;</Link>
              </div>
            )}
          </section>

          {archived.length > 0 && (
            <section className="ticket-section" style={{ marginTop: '60px' }}>
              <h3 style={{ fontSize: '22px', margin: '30px 0 20px', paddingBottom: '10px', borderBottom: '2px solid #ccc', color: '#888' }}>
                Archive / Past Bookings
              </h3>
              {archived.map(b => <TicketCard key={b._id} booking={b} isArchived={true} />) }
            </section>
          )}
        </>
      ) : (
        <div className="no-bookings" style={{ textAlign: 'center', padding: '100px 20px' }}>
          <span style={{ fontSize: '64px', display: 'block', marginBottom: '20px' }}>🎫</span>
          <h2 style={{ fontSize: '28px', fontWeight: '800' }}>No tickets found</h2>
          <p style={{ color: '#666', fontSize: '18px', marginBottom: '30px' }}>You haven't booked any shows yet.</p>
          <Link to="/search" className="view-details-btn" style={{ maxWidth: '250px', margin: '0 auto', display: 'block', textDecoration: 'none', background: 'var(--primary-lavender)', color: 'white', padding: '15px 30px', borderRadius: 'var(--radius-full)', fontWeight: 'bold' }}>Find a Show</Link>
        </div>
      )}
    </div>
  );
};

export default MyTickets;
