import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

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
          area.seats?.forEach(seat => {
            hasSeats = true;
            if (seat.x < minX) minX = seat.x;
            if (seat.y < minY) minY = seat.y;
            if (seat.x > maxX) maxX = seat.x;
            if (seat.y > maxY) maxY = seat.y;
          });
          const padding = 30;
          return {
            ...area,
            hasSeats,
            viewBox: hasSeats ? `${minX - padding} ${minY - padding} ${(maxX - minX) + padding * 2} ${(maxY - minY) + padding * 2}` : null
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
      setSelectedSeats(prev => [...prev, seat]);
    }
  };

  const handleGaChange = (amount) => {
    const newCount = Math.max(0, gaCount + amount);
    setGaCount(newCount);
    
    // Sync with selectedSeats for the footer logic
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

  if (loading) return <div className="loading">Loading event details...</div>;
  if (!event) return <div className="error">Event not found!</div>;

  const isReserved = planData && planData.areas?.some(a => a.hasSeats);

  return (
    <div className="event-details-page">
      <header className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>&lt; Back</button>
        <h2>Event Details</h2>
      </header>
      
      <div className="event-detail-content">
        <img src={event.image} alt={event.title} className="detail-image" />
        <div className="detail-header-info">
          <h2 className="detail-title">{event.title}</h2>
          <span className="detail-category">{event.category}</span>
        </div>
        
        <div className="detail-info">
          <div className="info-item">
            <span className="icon">📍</span>
            <span>{event.venue}</span>
          </div>
          <div className="info-item">
            <span className="icon">📅</span>
            <span>{event.date} • {event.time}</span>
          </div>
          <div className="info-item">
            <span className="icon">💰</span>
            <span>£{event.price.toFixed(2)} per ticket</span>
          </div>
        </div>

        <div className="event-description-section">
          <h3>About the Show</h3>
          <div 
            className="detail-description" 
            dangerouslySetInnerHTML={{ __html: event.description }}
          />
        </div>

        <div className="seat-selection-section">
          <h3>Tickets</h3>
          
          {loadingPlan ? (
            <div className="loading-plan" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
               Checking ticket availability...
            </div>
          ) : isReserved ? (
            <div className="multi-area-plan">
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '30px' }}>Select your seats from the map below:</p>
              {planData.areas.filter(a => a.hasSeats).map((area) => (
                <div key={area.id} className="plan-area-container" style={{ marginBottom: '40px' }}>
                  <h4 style={{ textAlign: 'center', marginBottom: '15px', fontWeight: '700' }}>{area.name}</h4>
                  <div className="svg-wrapper" style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '20px', border: '1px solid var(--border-subtle)' }}>
                    <svg viewBox={area.viewBox} width="100%" height="auto" style={{ maxHeight: '400px', display: 'block' }}>
                      {area.seats?.map(seat => {
                        const isSelected = selectedSeats.find(s => s.id === seat.id);
                        return (
                          <circle
                            key={seat.id} cx={seat.x} cy={seat.y} r="10"
                            fill={isSelected ? 'var(--primary-lavender)' : '#fff'}
                            stroke={isSelected ? '#fff' : 'var(--primary-lavender)'}
                            strokeWidth="2" style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                            onClick={() => toggleSeat(seat)}
                          />
                        );
                      })}
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="ga-selection" style={{ 
              textAlign: 'center', 
              padding: '60px', 
              background: 'var(--bg-subtle)', 
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-medium)'
            }}>
              <h4 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>General Admission</h4>
              <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>This event has unreserved seating. Please select the number of tickets you require.</p>
              
              <div className="quantity-selector" style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '32px',
                background: 'white',
                padding: '12px 24px',
                borderRadius: 'var(--radius-full)',
                boxShadow: 'var(--shadow-sm)',
                border: '1px solid var(--border-medium)'
              }}>
                <button 
                  onClick={() => handleGaChange(-1)}
                  style={{ width: '44px', height: '44px', borderRadius: '50%', border: '1px solid var(--border-medium)', background: '#fff', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >-</button>
                <span style={{ fontSize: '28px', fontWeight: '800', minWidth: '40px', color: 'var(--accent-purple)' }}>{gaCount}</span>
                <button 
                  onClick={() => handleGaChange(1)}
                  style={{ width: '44px', height: '44px', borderRadius: '50%', border: '1px solid var(--border-medium)', background: '#fff', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >+</button>
              </div>
            </div>
          )}

          {isReserved && (
            <div className="seat-legend" style={{ marginTop: '32px', display: 'flex', justifyContent: 'center', gap: '32px' }}>
              <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '500', color: 'var(--text-muted)' }}>
                <span className="seat-sample" style={{ width: '12px', height: '12px', display: 'inline-block', border: '2px solid var(--primary-lavender)', background: '#fff', borderRadius: '50%' }}></span> Available
              </div>
              <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '500', color: 'var(--text-muted)' }}>
                <span className="seat-sample selected" style={{ width: '12px', height: '12px', display: 'inline-block', background: 'var(--primary-lavender)', borderRadius: '50%' }}></span> Selected
              </div>
            </div>
          )}
        </div>
        
        <div className="sticky-footer">
          <div className="selection-summary">
            <span>{selectedSeats.length} {selectedSeats.length === 1 ? 'Ticket' : 'Tickets'} Selected</span>
            <span className="total-price">£{(selectedSeats.length * event.price).toFixed(2)}</span>
          </div>
          <button 
            className={`continue-btn ${selectedSeats.length === 0 ? 'disabled' : ''}`} 
            onClick={handleContinue}
            disabled={selectedSeats.length === 0}
          >
            Continue to Payment &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
