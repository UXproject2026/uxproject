import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * PaymentPage Component
 * Handles the secure checkout process for booking event tickets.
 */
const PaymentPage = () => {
  // --- Navigation State ---
  // Retrieves booking data (event, count, seats) passed from the EventDetails page
  const { state } = useLocation();
  const navigate = useNavigate();
  const { event, ticketCount, selectedSeats } = state || {};

  // --- Local State ---
  // Tracks if the payment API call is currently in progress
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEligibleConfirmed, setIsEligibleConfirmed] = useState(false);
  // Stores temporary card details (not persisted for security)
  const [cardDetails, setCardDetails] = useState({
    name: '',
    cardNumber: '',
    expiry: '',
    cvc: ''
  });

  // Calculate total based on individual seat prices
  const totalAmount = selectedSeats 
    ? selectedSeats.reduce((acc, s) => acc + s.price, 0).toFixed(2) 
    : '0.00';

  const hasSpecialTickets = selectedSeats?.some(s => s.ticketType === 'Disabled' || s.ticketType === 'Carer');

  /**
   * Universal change handler for form inputs.
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({ ...prev, [name]: value }));
  };

  /**
   * handlePayNow
   * Simulates a payment gateway interaction and creates a booking record.
   */
  const handlePayNow = (e) => {
    e.preventDefault();
    
    if (hasSpecialTickets && !isEligibleConfirmed) {
      alert('Please confirm your eligibility for special ticket types.');
      return;
    }

    setIsProcessing(true);

    // Simulate network latency for a "realistic" payment feel
    setTimeout(() => {
      fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          eventId: event._id, 
          ticketCount, 
          totalAmount,
          seat: selectedSeats 
            ? selectedSeats.map(s => `${s.name} (${s.ticketType})`).join(', ') 
            : 'General Admission'
        })
      })
      .then(res => res.json())
      .then(() => {
        setIsProcessing(false);
        alert('Payment Successful! Your tickets have been booked.');
        navigate('/my-tickets'); // Redirect to view the new tickets
      })
      .catch(err => {
        setIsProcessing(false);
        console.error('Error during booking:', err);
      });
    }, 1500);
  };

  // Error boundary: if user reaches this page without selecting an event
  if (!event) return (
    <div className="error-container">
      <div className="error">No event selected for payment!</div>
      <button className="action-btn primary" onClick={() => navigate('/')}>Go Back to Events</button>
    </div>
  );

  return (
    <div className="payment-page">
      {/* Header */}
      <header className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>&lt; Secure Payment</button>
        <h2>Checkout</h2>
      </header>
      
      {/* Order Summary: Recaps what the user is buying */}
      <div className="order-summary">
        <h3>ORDER SUMMARY</h3>
        <div className="summary-card">
          <div className="summary-row">
            <strong>{event.title}</strong>
            <span className="icon">🎫</span>
          </div>
          <div className="venue-name">{event.venue}</div>
          <div className="info-item">📅 {event.date}</div>
          <div className="info-item">🕒 {event.time}</div>
          <div className="info-item">
            👥 {ticketCount} Tickets
            <ul style={{ margin: '10px 0 0 20px', fontSize: '14px', color: '#666' }}>
              {selectedSeats?.map((s, i) => (
                <li key={i}>{s.name} ({s.ticketType}) - £{s.price.toFixed(2)}</li>
              ))}
            </ul>
          </div>
          <hr />
          <div className="total-row">
            <span>Total Amount</span>
            <span className="amount">£{totalAmount}</span>
          </div>
        </div>
      </div>

      {/* Payment Form: Mimics a secure credit card entry */}
      <form className="payment-form" onSubmit={handlePayNow}>
        <h3>CARD DETAILS</h3>
        
        {hasSpecialTickets && (
          <div className="eligibility-box" style={{ padding: '15px', background: 'var(--soft-lavender)', borderRadius: '12px', marginBottom: '20px', border: '1px solid var(--primary-lavender)' }}>
            <label style={{ display: 'flex', gap: '12px', cursor: 'pointer', alignItems: 'flex-start' }}>
              <input 
                type="checkbox" 
                checked={isEligibleConfirmed} 
                onChange={(e) => setIsEligibleConfirmed(e.target.checked)}
                style={{ marginTop: '4px', width: '20px', height: '20px' }}
              />
              <span style={{ fontSize: '14px', lineHeight: '1.4' }}>
                <strong>I confirm my eligibility:</strong> I understand that I must provide valid proof of eligibility for Carer or Disabled tickets at the venue (e.g., Access Card, Blue Badge, or PIP letter).
              </span>
            </label>
          </div>
        )}

        <div className="form-group">
          <label>Name on Card</label>
          <input 
            type="text" 
            name="name" 
            placeholder="As shown on your card" 
            value={cardDetails.name} 
            onChange={handleInputChange} 
            required 
            disabled={isProcessing}
          />
        </div>
        <div className="form-group">
          <label>Card Number</label>
          <input 
            type="text" 
            name="cardNumber" 
            placeholder="0000 0000 0000 0000" 
            value={cardDetails.cardNumber} 
            onChange={handleInputChange} 
            required 
            disabled={isProcessing}
            maxLength="19"
          />
        </div>
        <div className="form-row">
          <div className="form-group half">
            <label>Expiry Date</label>
            <input 
              type="text" 
              name="expiry" 
              placeholder="MM / YY" 
              value={cardDetails.expiry} 
              onChange={handleInputChange} 
              required 
              disabled={isProcessing}
              maxLength="5"
            />
          </div>
          <div className="form-group half">
            <label>CVC</label>
            <input 
              type="password" 
              name="cvc" 
              placeholder="123" 
              value={cardDetails.cvc} 
              onChange={handleInputChange} 
              required 
              disabled={isProcessing}
              maxLength="3"
            />
          </div>
        </div>
        
        {/* Trust signals */}
        <div className="secure-info">
          🛡️ Your payment is secure. We use industry-standard encryption.
        </div>

        <button type="submit" className={`pay-now-btn ${isProcessing ? 'processing' : ''}`} disabled={isProcessing}>
          {isProcessing ? 'Processing Payment...' : `Pay £${totalAmount} Now`}
        </button>
        <p className="terms">By clicking "Pay Now", you agree to our Terms of Sale.</p>
      </form>

      {/* Visual overlay during payment simulation */}
      {isProcessing && (
        <div className="processing-overlay">
          <div className="spinner"></div>
          <p>Verifying with your bank...</p>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
