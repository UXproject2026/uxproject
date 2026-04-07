import { useNavigate } from 'react-router-dom';

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="legal-page">
      <header className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>&lt; Back</button>
        <h2>Terms of Service</h2>
      </header>

      <div className="legal-content" style={{ marginTop: '40px', lineHeight: '1.8', color: 'var(--text-muted)' }}>
        <section style={{ marginBottom: '32px' }}>
          <h3 style={{ color: 'var(--accent-purple)', marginBottom: '16px' }}>1. Acceptance of Terms</h3>
          <p>[Text goes here]</p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h3 style={{ color: 'var(--accent-purple)', marginBottom: '16px' }}>2. Ticket Purchases</h3>
          <p>[Text goes here]</p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h3 style={{ color: 'var(--accent-purple)', marginBottom: '16px' }}>3. User Accounts</h3>
          <p>[Text goes here]</p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h3 style={{ color: 'var(--accent-purple)', marginBottom: '16px' }}>4. Venue Rules</h3>
          <p>[Text goes here]</p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h3 style={{ color: 'var(--accent-purple)', marginBottom: '16px' }}>5. Limitation of Liability</h3>
          <p>[Text goes here]</p>
        </section>

        <footer style={{ marginTop: '60px', fontSize: '14px', fontStyle: 'italic' }}>
          Last updated: [Date]
        </footer>
      </div>
    </div>
  );
};

export default TermsOfService;
