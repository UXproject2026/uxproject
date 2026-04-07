import { useNavigate } from 'react-router-dom';

/**
 * HelpPage Component
 * Provides static FAQ information and contact options for the user.
 */
const HelpPage = () => {
  const navigate = useNavigate();

  /**
   * openChat
   * Dispatches a global custom event to trigger the floating ChatWidget.
   * This allows communication between separate component branches.
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
            {/* Q1: Ticket Access */}
            <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid var(--soft-lavender)', borderRadius: '10px' }}>
              <h4 style={{ color: 'var(--primary-lavender)' }}>How do I get my tickets?</h4>
              <p>Your tickets are available in the "My Tickets" section immediately after purchase. You can show the QR code on your phone at the theatre door.</p>
            </div>
            
            {/* Q2: Refunds */}
            <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid var(--soft-lavender)', borderRadius: '10px' }}>
              <h4 style={{ color: 'var(--primary-lavender)' }}>Can I get a refund?</h4>
              <p>Refund policies vary by venue. Please contact the specific theatre (Grand, Playhouse, etc.) at least 24 hours before the show starts.</p>
            </div>

            {/* Q3: Latency/Entry Policy */}
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
            {/* Trigger for the ChatWidget */}
            <p 
              onClick={openChat} 
              style={{ cursor: 'pointer', color: 'var(--primary-black)', display: 'inline-flex', alignItems: 'center', gap: '8px', margin: 0 }}
            >
              💬 Contact live chat
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HelpPage;
