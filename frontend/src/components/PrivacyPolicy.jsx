import { useNavigate } from 'react-router-dom';

/**
 * PrivacyPolicy Component
 * A static legal page detailing how the application handles user data.
 */
const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="legal-page">
      {/* Header with back navigation */}
      <header className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>&lt; Back</button>
        <h2>Privacy Policy</h2>
      </header>

      {/* Main Content Area: Placeholder text for legal documentation */}
      <div className="legal-content" style={{ marginTop: '40px', lineHeight: '1.8', color: 'var(--text-muted)' }}>
        <section style={{ marginBottom: '32px' }}>
          <h3 style={{ color: 'var(--accent-purple)', marginBottom: '16px' }}>1. Information We Collect</h3>
          <p>We collect information you provide directly to us, such as when you create an account, purchase a ticket, or contact support.</p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h3 style={{ color: 'var(--accent-purple)', marginBottom: '16px' }}>2. How We Use Your Information</h3>
          <p>We use your information to process transactions, manage your account, and provide customer support.</p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h3 style={{ color: 'var(--accent-purple)', marginBottom: '16px' }}>3. Sharing of Information</h3>
          <p>We do not share your personal information with third parties except as necessary to provide our services (e.g., payment processing).</p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h3 style={{ color: 'var(--accent-purple)', marginBottom: '16px' }}>4. Data Security</h3>
          <p>We implement industry-standard security measures to protect your personal information from unauthorized access.</p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h3 style={{ color: 'var(--accent-purple)', marginBottom: '16px' }}>5. Your Privacy Rights</h3>
          <p>You have the right to access, correct, or delete your personal information stored in our system via your account settings.</p>
        </section>

        <footer style={{ marginTop: '60px', fontSize: '14px', fontStyle: 'italic' }}>
          Last updated: March 2024
        </footer>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
