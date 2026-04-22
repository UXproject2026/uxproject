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
  const [gaCounts, setGaCounts] = useState({ standard: 0, disabled: 0, carer: 0 });
  const [activeSeat, setActiveSeat] = useState(null);

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
      setActiveSeat(seat);
    }
  };

  const handleTypeSelect = (type, price) => {
    if (!activeSeat) return;
    
    const seatIdentifier = activeSeat.row 
      ? `Row ${activeSeat.row}, Seat ${activeSeat.number || activeSeat.name}`
      : (activeSeat.name.includes('Seat') ? activeSeat.name : `Seat ${activeSeat.name}`);

    const seatWithDetails = { 
      ...activeSeat, 
      name: seatIdentifier, 
      ticketType: type,
      price: price
    };
    
    setSelectedSeats(prev => [...prev, seatWithDetails]);
    setActiveSeat(null);
  };

  const handleGaChange = (type, amount) => {
    const newCounts = { ...gaCounts, [type]: Math.max(0, gaCounts[type] + amount) };
    setGaCounts(newCounts);
    
    const newSelectedSeats = [];
    
    // Add Standard tickets
    for (let i = 0; i < newCounts.standard; i++) {
      newSelectedSeats.push({
        id: `ga-standard-${i}`,
        name: `Standard Entry ${i + 1}`,
        ticketType: 'Standard',
        price: event.price
      });
    }
    
    // Add Disabled tickets
    for (let i = 0; i < newCounts.disabled; i++) {
      newSelectedSeats.push({
        id: `ga-disabled-${i}`,
        name: `Disabled Entry ${i + 1}`,
        ticketType: 'Disabled',
        price: event.price
      });
    }
    
    // Add Carer tickets
    for (let i = 0; i < newCounts.carer; i++) {
      newSelectedSeats.push({
        id: `ga-carer-${i}`,
        name: `Carer Entry ${i + 1}`,
        ticketType: 'Carer',
        price: 0
      });
    }
    
    setSelectedSeats(newSelectedSeats);
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
        selectedSeats // Pass the full objects now
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
                        const isAccessible = seat.isWheelchairSpace || seat.isAccessible || seat.attributes?.IsWheelchairSpace || seat.row === 'A';
                        
                        return (
                          <g key={seat.id}>
                            <circle
                              cx={seat.x * area.scale} cy={seat.y * area.scale} r="80"
                              fill={isSelected ? 'var(--accent-purple)' : '#fff'}
                              stroke={isAccessible ? '#2ecc71' : (isSelected ? '#fff' : 'var(--primary-lavender)')}
                              strokeWidth={isAccessible ? "12" : "8"} 
                              style={{ cursor: 'pointer', transition: 'all 0.2s', outline: 'none' }}
                              role="button"
                              tabIndex="0"
                              aria-label={`${isAccessible ? 'Accessible ' : ''}${seat.row ? `Row ${seat.row}, ` : ''}Seat ${seat.number || seat.name}${isSelected ? ', selected' : ''}`}
                              aria-pressed={isSelected}
                              onClick={() => toggleSeat(seat)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  toggleSeat(seat);
                                }
                              }}
                            />
                            {isAccessible && !isSelected && (
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
                </div>
              ))}
            </div>
          ) : (
            <div className="ga-selection" style={{ padding: '40px 20px', background: 'var(--bg-subtle)', borderRadius: '25px' }}>
              <h4 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '30px', textAlign: 'center' }}>General Admission</h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Standard Counter */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: 'white', borderRadius: '20px', border: '1px solid #ddd' }}>
                  <div>
                    <span style={{ fontSize: '20px', fontWeight: '800', display: 'block' }}>Standard Ticket</span>
                    <span style={{ fontSize: '16px', color: '#666' }}>£{event.price.toFixed(2)} per person</span>
                  </div>
                  <div className="quantity-selector" style={{ gap: '20px' }}>
                    <button 
                      onClick={() => handleGaChange('standard', -1)}
                      style={{ width: '45px', height: '45px', fontSize: '24px' }}
                    >-</button>
                    <span style={{ fontSize: '32px', minWidth: '40px', textAlign: 'center' }}>{gaCounts.standard}</span>
                    <button 
                      onClick={() => handleGaChange('standard', 1)}
                      style={{ width: '45px', height: '45px', fontSize: '24px' }}
                    >+</button>
                  </div>
                </div>

                {/* Disabled Counter */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: 'white', borderRadius: '20px', border: '1px solid #2ecc71' }}>
                  <div>
                    <span style={{ fontSize: '20px', fontWeight: '800', display: 'block' }}>Disabled Ticket ♿</span>
                    <span style={{ fontSize: '16px', color: '#666' }}>£{event.price.toFixed(2)} per person</span>
                  </div>
                  <div className="quantity-selector" style={{ gap: '20px' }}>
                    <button 
                      onClick={() => handleGaChange('disabled', -1)}
                      style={{ width: '45px', height: '45px', fontSize: '24px' }}
                    >-</button>
                    <span style={{ fontSize: '32px', minWidth: '40px', textAlign: 'center' }}>{gaCounts.disabled}</span>
                    <button 
                      onClick={() => handleGaChange('disabled', 1)}
                      style={{ width: '45px', height: '45px', fontSize: '24px' }}
                    >+</button>
                  </div>
                </div>

                {/* Carer Counter */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: 'var(--soft-lavender)', borderRadius: '20px', border: '1px solid var(--primary-lavender)' }}>
                  <div>
                    <span style={{ fontSize: '20px', fontWeight: '800', display: 'block' }}>Carer Ticket</span>
                    <span style={{ fontSize: '16px', color: '#666' }}>£0.00 (Free)</span>
                  </div>
                  <div className="quantity-selector" style={{ gap: '20px' }}>
                    <button 
                      onClick={() => handleGaChange('carer', -1)}
                      style={{ width: '45px', height: '45px', fontSize: '24px' }}
                    >-</button>
                    <span style={{ fontSize: '32px', minWidth: '40px', textAlign: 'center' }}>{gaCounts.carer}</span>
                    <button 
                      onClick={() => handleGaChange('carer', 1)}
                      style={{ width: '45px', height: '45px', fontSize: '24px' }}
                    >+</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isReserved && (
            <div className="seat-legend" style={{ marginTop: '40px', gap: '50px', display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
              <div className="legend-item" style={{ fontSize: '24px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ width: '50px', height: '50px', border: '6px solid var(--primary-lavender)', background: '#fff', borderRadius: '50%', display: 'inline-block' }}></span> Available
              </div>
              <div className="legend-item" style={{ fontSize: '24px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ width: '50px', height: '50px', background: 'var(--accent-purple)', borderRadius: '50%', display: 'inline-block' }}></span> Selected
              </div>
              <div className="legend-item" style={{ fontSize: '24px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ width: '50px', height: '50px', border: '6px solid #2ecc71', background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>♿</span> Accessible
              </div>
            </div>
          )}

          {/* Ticket Type Selection Popup */}
          {activeSeat && (
            <div className="type-popup-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
              <div className="type-popup" style={{ background: 'white', padding: '40px', borderRadius: '30px', maxWidth: '500px', width: '90%', textAlign: 'center' }}>
                <h4 style={{ fontSize: '28px', marginBottom: '10px' }}>Select Ticket Type</h4>
                <p style={{ fontSize: '18px', color: '#666', marginBottom: '30px' }}>
                  {activeSeat.row ? `Row ${activeSeat.row}, Seat ${activeSeat.number || activeSeat.name}` : activeSeat.name}
                </p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <button 
                    onClick={() => handleTypeSelect('Standard', event.price)}
                    style={{ padding: '15px', borderRadius: '15px', border: '2px solid #ddd', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    Standard Ticket - £{event.price.toFixed(2)}
                  </button>
                  <button 
                    onClick={() => handleTypeSelect('Disabled', event.price)}
                    style={{ padding: '15px', borderRadius: '15px', border: '2px solid #2ecc71', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    Disabled Ticket - £{event.price.toFixed(2)}
                  </button>
                  <button 
                    onClick={() => handleTypeSelect('Carer', 0)}
                    style={{ padding: '15px', borderRadius: '15px', border: '2px solid var(--accent-purple)', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer', background: 'var(--soft-lavender)' }}
                  >
                    Carer Ticket - £0.00
                  </button>
                  <button 
                    onClick={() => setActiveSeat(null)}
                    style={{ marginTop: '10px', background: 'none', border: 'none', color: '#666', textDecoration: 'underline', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="sticky-footer" style={{ padding: '30px 45px', bottom: '30px', borderRadius: '30px' }}>
          <div className="selection-summary">
            <span style={{ fontSize: '18px', fontWeight: '700' }}>{selectedSeats.length} {selectedSeats.length === 1 ? 'Ticket' : 'Tickets'} Selected</span>
            <span className="total-price" style={{ fontSize: '36px' }}>£{selectedSeats.reduce((acc, s) => acc + s.price, 0).toFixed(2)}</span>
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
