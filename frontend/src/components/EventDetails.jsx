import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

/**
 * EventDetails Component: Displays detailed information about a specific show
 * and handles the ticket selection process.
 */
const EventDetails = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [planData, setPlanData] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [gaCount, setGaCount] = useState(0);

  useEffect(() => {
    fetch(`/api/events/${eventId}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          console.error(data.error);
        } else {
          setEvent(data);
          fetchSeatingPlan(eventId);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching event details:', err);
        setLoading(false);
      });
  }, [eventId]);

  const fetchSeatingPlan = (id) => {
    fetch(`/api/events/${id}/seating-plan`)
      .then(res => res.json())
      .then(data => {
        if (data.error || !data.areas || data.areas.length === 0) {
          setPlanData(null);
          setLoadingPlan(false);
          return;
        }

        const processedAreas = data.areas?.map(area => {
          let minX = 10000, minY = 10000, maxX = 0, maxY = 0;
          let hasSeats = false;
          const scale = 8.0; // Dramatic increase in spacing factor

          area.seats?.forEach(seat => {
            hasSeats = true;
            const sx = seat.x * scale;
            const sy = seat.y * scale;
            if (sx < minX) minX = sx;
            if (sy < minY) minY = sy;
            if (sx > maxX) maxX = sx;
            if (sy > maxY) maxY = sy;
          });

          const padding = 300; // Large padding for massive elements
          const topPadding = 400;
          return {
            ...area,
            hasSeats,
            scale,
            viewBox: hasSeats ? `${minX - padding} ${minY - topPadding} ${(maxX - minX) + padding * 2} ${(maxY - minY) + topPadding + padding}` : null
          };
        }) || [];

        setPlanData({ ...data, areas: processedAreas });
        setLoadingPlan(false);
      })
      .catch(err => {
        console.error('Error fetching seating plan:', err);
        setLoadingPlan(false);
      });
  };

  const toggleSeat = (seat) => {
    const seatId = seat.id;
    if (selectedSeats.find(s => s.id === seatId)) {
      setSelectedSeats(prev => prev.filter(s => s.id !== seatId));
    } else {
      const seatIdentifier = seat.row 
        ? `Row ${seat.row}, Seat ${seat.number || seat.name}`
        : (seat.name.includes('Seat') ? seat.name : `Seat ${seat.name}`);

      const seatWithUniqueName = { ...seat, name: seatIdentifier };
      setSelectedSeats(prev => [...prev, seatWithUniqueName]);    }
  };

  const handleGaChange = (amount) => {
    const newCount = Math.max(0, gaCount + amount);
    setGaCount(newCount);
    
    if (newCount === 0) {
      setSelectedSeats([]);
    } else {
      const mockSeats = Array.from({length: newCount}, (_, i) => ({
        id: `ga-${i}`,
        name: `General Admission ${i + 1}`
      }));
      setSelectedSeats(mockSeats);
    }
  };

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      alert('Please select at least one ticket');
      return;
    }
    navigate('/payment', { 
      state: { 
        event, 
        ticketCount: selectedSeats.length, 
        seats: selectedSeats.map(s => s.name) 
      } 
    });
  };

  const handleRate = (rating) => {
    fetch(`/api/events/${eventId}/rate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          alert(data.error);
        } else {
          setEvent(prev => ({ ...prev, rating: data.newRating, ratingCount: (prev.ratingCount || 0) + 1 }));
          alert("Thank you for your rating!");
        }
      });
  };

  if (loading) return <div className="loading" style={{ padding: '100px', textAlign: 'center', fontSize: '24px' }}>Loading show details...</div>;
  if (!event) return <div className="error">Event not found!</div>;

  const isReserved = planData && planData.areas?.some(a => a.hasSeats);

  return (
    <div className="event-details-page">
      <header className="page-header" style={{ marginBottom: '30px' }}>
        <button className="back-btn" onClick={() => navigate(-1)} style={{ fontSize: '18px', fontWeight: 'bold' }}>&lt; Back</button>
        <h2 style={{ fontSize: '32px', fontWeight: '800' }}>Book Tickets</h2>
      </header>
      
      <div className="event-detail-content">
        <div style={{ position: 'relative' }}>
           <img src={event.image} alt={event.title} className="detail-image" style={{ height: '400px' }} />
           <div style={{ position: 'absolute', bottom: '30px', left: '30px', color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
             <h2 style={{ fontSize: '48px', margin: 0 }}>{event.title}</h2>
             <p style={{ fontSize: '22px', margin: 0, fontWeight: '600' }}>{event.venue}</p>
           </div>
        </div>

        <div className="detail-header-info" style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span className="detail-category" style={{ fontSize: '14px', padding: '6px 15px' }}>{event.category}</span>
            <div className="rating-display" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#FFD700', fontSize: '28px' }}>
                {'★'.repeat(Math.round(event.rating || 0))}{'☆'.repeat(5 - Math.round(event.rating || 0))}
              </span>
              <span style={{ fontWeight: '800', fontSize: '20px' }}>{event.rating || '0.0'}</span>
            </div>
          </div>
        </div>
        
        <div className="detail-info" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', padding: '30px' }}>
          <div className="info-item">
            <span style={{ fontSize: '32px' }}>📍</span>
            <span style={{ fontSize: '18px', fontWeight: '800' }}>{event.venue}</span>
          </div>
          <div className="info-item">
            <span style={{ fontSize: '32px' }}>📅</span>
            <span style={{ fontSize: '18px', fontWeight: '800' }}>{event.date} • {event.time}</span>
          </div>
          <div className="info-item">
            <span style={{ fontSize: '32px' }}>💰</span>
            <span style={{ fontSize: '18px', fontWeight: '800' }}>£{event.price.toFixed(2)}</span>
          </div>
        </div>

        <div className="seat-selection-section" style={{ padding: '40px', border: '2px solid var(--primary-lavender)', background: '#fdfdfd' }}>
          <h3 style={{ fontSize: '30px', marginBottom: '10px' }}>Select Your Seats</h3>
          <p style={{ textAlign: 'center', fontSize: '18px', color: '#666', marginBottom: '40px' }}>
            Tap the large circles to pick your seats. We've made them extra large and spaced them out for easier selection.
          </p>
          
          {loadingPlan ? (
            <div style={{ textAlign: 'center', padding: '40px', fontSize: '20px' }}>Checking seat availability...</div>
          ) : isReserved ? (
            <div className="multi-area-plan">
              {planData.areas.filter(a => a.hasSeats).map((area) => (
                <div key={area.id} className="plan-area-container" style={{ marginBottom: '60px' }}>
                  <h4 style={{ fontSize: '24px', textAlign: 'center', marginBottom: '20px', color: 'var(--accent-purple)' }}>{area.name}</h4>
                  <div className="svg-wrapper" style={{ background: '#eee', borderRadius: '20px', padding: '30px', border: '1px solid #ccc' }}>
                    <svg viewBox={area.viewBox} width="100%" height="auto" style={{ maxHeight: '800px', display: 'block' }}>
                      {(() => {
                        const vb = area.viewBox.split(' ').map(Number);
                        const centerX = vb[0] + vb[2] / 2;
                        const topY = vb[1] + 25;
                        return (
                          <g className="stage-indicator">
                            <rect x={centerX - 200} y={topY} width="400" height="80" rx="12" fill="var(--accent-purple)" />
                            <text x={centerX} y={topY + 52} textAnchor="middle" fill="white" style={{ fontWeight: '800', fontSize: '32px' }}>STAGE</text>
                          </g>
                        );
                      })()}
                      {area.seats?.map(seat => {
                        const isSelected = selectedSeats.find(s => s.id === seat.id);
                        return (
                          <circle
                            key={seat.id} cx={seat.x * area.scale} cy={seat.y * area.scale} r="60"
                            fill={isSelected ? 'var(--accent-purple)' : '#fff'}
                            stroke={isSelected ? '#fff' : 'var(--primary-lavender)'}
                            strokeWidth="8" 
                            style={{ cursor: 'pointer', transition: 'all 0.2s', outline: 'none' }}
                            role="button"
                            tabIndex="0"
                            aria-label={`${seat.row ? `Row ${seat.row}, ` : ''}Seat ${seat.number || seat.name}${isSelected ? ', selected' : ''}`}
                            aria-pressed={isSelected}
                            onClick={() => toggleSeat(seat)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                toggleSeat(seat);
                              }
                            }}
                          />
                        );
                      })}
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="ga-selection" style={{ padding: '80px', background: 'var(--bg-subtle)', borderRadius: '25px' }}>
              <h4 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '20px' }}>General Admission</h4>
              <p style={{ fontSize: '20px', marginBottom: '40px' }}>Select the number of people attending:</p>
              
              <div className="quantity-selector" style={{ gap: '40px', padding: '20px 40px', background: 'white', borderRadius: '50px', border: '2px solid var(--border-medium)' }}>
                <button 
                  onClick={() => handleGaChange(-1)}
                  style={{ width: '60px', height: '60px', fontSize: '30px', fontWeight: 'bold' }}
                  aria-label="Remove 1 person"
                >-</button>
                <span style={{ fontSize: '48px', fontWeight: '900', color: 'var(--accent-purple)' }} aria-live="polite">{gaCount}</span>
                <button 
                  onClick={() => handleGaChange(1)}
                  style={{ width: '60px', height: '60px', fontSize: '30px', fontWeight: 'bold' }}
                  aria-label="Add 1 person"
                >+</button>
              </div>
            </div>
          )}

          {isReserved && (
            <div className="seat-legend" style={{ marginTop: '40px', gap: '50px', display: 'flex', justifyContent: 'center' }}>
              <div className="legend-item" style={{ fontSize: '24px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ width: '50px', height: '50px', border: '6px solid var(--primary-lavender)', background: '#fff', borderRadius: '50%', display: 'inline-block' }}></span> Available
              </div>
              <div className="legend-item" style={{ fontSize: '24px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ width: '50px', height: '50px', background: 'var(--accent-purple)', borderRadius: '50%', display: 'inline-block' }}></span> Selected
              </div>
            </div>
          )}
        </div>
        
        <div className="sticky-footer" style={{ padding: '30px 45px', bottom: '30px', borderRadius: '30px' }}>
          <div className="selection-summary">
            <span style={{ fontSize: '18px', fontWeight: '700' }}>{selectedSeats.length} People Selected</span>
            <span className="total-price" style={{ fontSize: '36px' }}>£{(selectedSeats.length * event.price).toFixed(2)}</span>
          </div>
          <button 
            className={`continue-btn ${selectedSeats.length === 0 ? 'disabled' : ''}`} 
            onClick={handleContinue}
            disabled={selectedSeats.length === 0}
            style={{ padding: '20px 50px', fontSize: '22px' }}
          >
            Confirm & Pay &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
