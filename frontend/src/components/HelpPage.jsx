import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * HelpPage Component
 * Provides static FAQ information, contact options, and a complaints form.
 */
const HelpPage = () => {
  const navigate = useNavigate();

  // --- Complaints Form State ---
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    orderRef: '',
    message: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would send data to an API
    console.log('Complaint submitted:', formData);
    alert('Thank you. Your complaint has been submitted and our team will review it within 48 hours.');
    setFormData({ name: '', email: '', orderRef: '', message: '' });
  };

  /**
   * openChat
   * Dispatches a global custom event to trigger the floating ChatWidget.
   */
  const openChat = () => {
    window.dispatchEvent(new CustomEvent('open-chat'));
  };

  return (
    <div className="help-page" style={{ padding: '20px' }}>
      {/* Header with back navigation */}
      <header className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>&lt; Back</button>
        <h2>Help & Support</h2>
      </header>

      <div className="help-content" style={{ marginTop: '30px' }}>
        {/* Section 1: Frequently Asked Questions */}
        <section className="faq-section" style={{ marginBottom: '40px' }}>
          <h3>Frequently Asked Questions</h3>
          <div style={{ marginTop: '20px' }}>
            <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid var(--soft-lavender)', borderRadius: '10px' }}>
              <h4 style={{ color: 'var(--primary-lavender)' }}>How do I get my tickets?</h4>
              <p>Your tickets are available in the "My Tickets" section immediately after purchase. You can show the QR code on your phone at the theatre door.</p>
            </div>
            
            <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid var(--soft-lavender)', borderRadius: '10px' }}>
              <h4 style={{ color: 'var(--primary-lavender)' }}>Can I get a refund?</h4>
              <p>Refund policies vary by venue. Please contact the specific theatre (Grand, Playhouse, etc.) at least 24 hours before the show starts.</p>
            </div>

            <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid var(--soft-lavender)', borderRadius: '10px' }}>
              <h4 style={{ color: 'var(--primary-lavender)' }}>What if I'm late?</h4>
              <p>Latecomers will be admitted at a suitable break in the performance, at the discretion of the front-of-house staff.</p>
            </div>
          </div>
        </section>

        {/* Section 2: Contact Options */}
        <section className="contact-section" style={{ padding: '20px', background: 'var(--soft-lavender)', borderRadius: '15px' }}>
          <h3>Still need help?</h3>
          <p style={{ marginTop: '10px' }}>Our support team is available Monday to Friday, 9am - 10pm.</p>
          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px', fontWeight: 'bold' }}>
            <p style={{ margin: 0 }}>📧 support@scenepass.edu</p>
            <p style={{ margin: 0 }}>📞 0113 555 0123</p>
            <p 
              onClick={openChat} 
              style={{ cursor: 'pointer', color: 'var(--primary-black)', display: 'inline-flex', alignItems: 'center', gap: '8px', margin: 0 }}
            >
              💬 Contact live chat
            </p>
          </div>
        </section>

        {/* Section 3: Complaints Form */}
        <section className="complaint-form-section">
          <h3>Submit a Complaint</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
            We're sorry to hear something wasn't right. Please let us know the details below.
          </p>
          <form className="complaint-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input 
                type="text" id="name" name="name" required 
                value={formData.name} onChange={handleInputChange}
                placeholder="Your name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input 
                type="email" id="email" name="email" required 
                value={formData.email} onChange={handleInputChange}
                placeholder="your.email@example.com"
              />
            </div>
            <div className="form-group">
              <label htmlFor="orderRef">Order Reference (Optional)</label>
              <input 
                type="text" id="orderRef" name="orderRef" 
                value={formData.orderRef} onChange={handleInputChange}
                placeholder="e.g. BK123456"
              />
            </div>
            <div className="form-group">
              <label htmlFor="message">Nature of Complaint</label>
              <textarea 
                id="message" name="message" required 
                value={formData.message} onChange={handleInputChange}
                placeholder="Please describe what happened..."
              ></textarea>
            </div>
            <button type="submit" className="complaint-submit-btn">Submit Complaint</button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default HelpPage;
