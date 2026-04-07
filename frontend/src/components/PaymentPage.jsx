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
  const { event, ticketCount, seats } = state || {};

  // --- Local State ---
  // Tracks if the payment API call is currently in progress
  const [isProcessing, setIsProcessing] = useState(false);
  // Stores temporary card details (not persisted for security)
  const [cardDetails, setCardDetails] = useState({
    name: '',
    cardNumber: '',
    expiry: '',
    cvc: ''
  });

  // Calculate total based on event price and number of tickets
  const totalAmount = event ? (event.price * ticketCount).toFixed(2) : '0.00';

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
          seat: seats ? seats.join(', ') : 'Row B, Seat 12' // Default if not selected
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
          <div className="info-item">👥 {ticketCount} Tickets ({seats?.join(', ')})</div>
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
