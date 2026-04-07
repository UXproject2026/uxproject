import { useNavigate } from 'react-router-dom';

/**
 * TermsOfService Component
 * A static legal page detailing the rules and agreements for using the application.
 */
const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="legal-page">
      {/* Header with back navigation */}
      <header className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>&lt; Back</button>
        <h2>Terms of Service</h2>
      </header>

      {/* Main Content Area: Placeholder text for user agreements */}
      <div className="legal-content" style={{ marginTop: '40px', lineHeight: '1.8', color: 'var(--text-muted)' }}>
        <section style={{ marginBottom: '32px' }}>
          <h3 style={{ color: 'var(--accent-purple)', marginBottom: '16px' }}>1. Acceptance of Terms</h3>
          <p>By accessing or using our service, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the service.</p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h3 style={{ color: 'var(--accent-purple)', marginBottom: '16px' }}>2. Ticket Purchases</h3>
          <p>All sales are final. We act as a platform for third-party venues; specific house rules of the theatre apply to all ticket holders.</p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h3 style={{ color: 'var(--accent-purple)', marginBottom: '16px' }}>3. User Accounts</h3>
          <p>You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer.</p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h3 style={{ color: 'var(--accent-purple)', marginBottom: '16px' }}>4. Venue Rules</h3>
          <p>Users must comply with all health and safety regulations, as well as the behavioral codes of conduct set by each individual venue.</p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h3 style={{ color: 'var(--accent-purple)', marginBottom: '16px' }}>5. Limitation of Liability</h3>
          <p>We shall not be liable for any indirect, incidental, special, or consequential damages resulting from the use of our services.</p>
        </section>

        <footer style={{ marginTop: '60px', fontSize: '14px', fontStyle: 'italic' }}>
          Last updated: March 2024
        </footer>
      </div>
    </div>
  );
};

export default TermsOfService;
