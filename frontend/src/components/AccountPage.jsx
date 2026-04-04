import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AccountPage = () => {
  const navigate = useNavigate();
  
  // Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: localStorage.getItem('userName') || "University Project User",
    email: localStorage.getItem('userEmail') || "user@example.edu"
  });

  // Card State
  const [savedCard, setSavedCard] = useState(
    JSON.parse(localStorage.getItem('savedCard')) || null
  );
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCard, setNewCard] = useState({ number: '', expiry: '', cvv: '' });

  // Receipts State
  const [bookings, setBookings] = useState([]);
  const [loadingReceipts, setLoadingReceipts] = useState(true);

  // Accessibility State
  const [accessSettings, setAccessSettings] = useState({
    textScaling: localStorage.getItem('access_textScaling') === 'true',
    highContrast: localStorage.getItem('access_highContrast') === 'true',
    linkHighlight: localStorage.getItem('access_linkHighlight') === 'true',
    reducedMotion: localStorage.getItem('access_reducedMotion') === 'true'
  });

  useEffect(() => {
    const body = document.body;
    accessSettings.textScaling ? body.classList.add('accessibility-mode') : body.classList.remove('accessibility-mode');
    accessSettings.highContrast ? body.classList.add('high-contrast-mode') : body.classList.remove('high-contrast-mode');
    accessSettings.linkHighlight ? body.classList.add('link-highlight-mode') : body.classList.remove('link-highlight-mode');
    accessSettings.reducedMotion ? body.classList.add('reduced-motion-mode') : body.classList.remove('reduced-motion-mode');

    Object.keys(accessSettings).forEach(key => {
      localStorage.setItem(`access_${key}`, accessSettings[key]);
    });
  }, [accessSettings]);

  useEffect(() => {
    // Fetch bookings for receipts
    fetch('/api/bookings')
      .then(res => res.json())
      .then(data => {
        setBookings(data);
        setLoadingReceipts(false);
      })
      .catch(err => {
        console.error("Error fetching receipts:", err);
        setLoadingReceipts(false);
      });
  }, []);

  const toggleSetting = (key) => {
    setAccessSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    setIsEditing(false);
    localStorage.setItem('userName', profile.name);
    localStorage.setItem('userEmail', profile.email);
    alert("Profile updated successfully!");
  };

  const handleSaveCard = (e) => {
    e.preventDefault();
    const lastFour = newCard.number.slice(-4);
    const cardData = {
      lastFour,
      expiry: newCard.expiry,
      brand: newCard.number.startsWith('4') ? 'Visa' : 'Mastercard'
    };
    setSavedCard(cardData);
    localStorage.setItem('savedCard', JSON.stringify(cardData));
    setIsAddingCard(false);
    setNewCard({ number: '', expiry: '', cvv: '' });
  };

  const handleRemoveCard = () => {
    setSavedCard(null);
    localStorage.removeItem('savedCard');
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/signin');
    window.location.reload();
  };

  const ToggleSwitch = ({ checked, onChange }) => (
    <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '50px', height: '24px' }}>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ opacity: 0, width: 0, height: 0 }} />
      <span style={{
        position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: checked ? 'var(--primary-lavender)' : '#ccc',
        transition: '.4s', borderRadius: '24px'
      }}>
        <span style={{
          position: 'absolute', content: '""', height: '18px', width: '18px', left: '3px', bottom: '3px',
          backgroundColor: 'white', transition: '.4s', borderRadius: '50%',
          transform: checked ? 'translateX(26px)' : 'translateX(0)'
        }}></span>
      </span>
    </label>
  );

  return (
    <div className="account-page" style={{ padding: '20px' }}>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button className="back-btn" onClick={() => navigate('/')}>&lt; Home</button>
          <h2>Your Account</h2>
        </div>
        <button onClick={handleLogout} style={{ background: '#ff4444', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Sign Out</button>
      </header>

      <div className="account-content" style={{ marginTop: '30px', display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
        
        {/* 1. Profile Section */}
        <section className="account-section" style={{ padding: '20px', background: 'var(--soft-lavender)', borderRadius: '15px', border: '1px solid var(--primary-lavender)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Profile Information</h3>
            {!isEditing && <button onClick={() => setIsEditing(true)} style={{ background: 'none', border: 'none', color: 'var(--primary-lavender)', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}>Edit</button>}
          </div>
          <div style={{ marginTop: '15px' }}>
            {isEditing ? (
              <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input type="text" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                <input type="email" value={profile.email} onChange={(e) => setProfile({...profile, email: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" className="view-details-btn" style={{ maxWidth: '120px' }}>Save</button>
                  <button type="button" onClick={() => setIsEditing(false)} style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer' }}>Cancel</button>
                </div>
              </form>
            ) : (
              <div className="profile-display">
                <p><strong>Name:</strong> {profile.name}</p>
                <p><strong>Email:</strong> {profile.email}</p>
              </div>
            )}
          </div>
        </section>

        {/* 2. Saved Payment Methods Section */}
        <section className="payment-section" style={{ padding: '20px', background: '#fff', borderRadius: '15px', border: '1px solid #ddd' }}>
          <h3>Saved Payment Methods</h3>
          <div style={{ marginTop: '20px' }}>
            {savedCard ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: '#f9f9f9', borderRadius: '12px', border: '1px solid #eee' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <span style={{ fontSize: '24px' }}>💳</span>
                  <div>
                    <span style={{ fontWeight: 'bold', display: 'block' }}>{savedCard.brand} ending in {savedCard.lastFour}</span>
                    <span style={{ fontSize: '13px', color: '#666' }}>Expires {savedCard.expiry}</span>
                  </div>
                </div>
                <button onClick={handleRemoveCard} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontWeight: 'bold' }}>Remove</button>
              </div>
            ) : isAddingCard ? (
              <form onSubmit={handleSaveCard} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input type="text" placeholder="Card Number" required value={newCard.number} onChange={(e) => setNewCard({...newCard, number: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input type="text" placeholder="MM/YY" required value={newCard.expiry} onChange={(e) => setNewCard({...newCard, expiry: e.target.value})} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                  <input type="text" placeholder="CVV" required value={newCard.cvv} onChange={(e) => setNewCard({...newCard, cvv: e.target.value})} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" className="view-details-btn" style={{ maxWidth: '150px' }}>Save Card</button>
                  <button type="button" onClick={() => setIsAddingCard(false)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>Cancel</button>
                </div>
              </form>
            ) : (
              <button onClick={() => setIsAddingCard(true)} style={{ width: '100%', padding: '15px', border: '2px dashed #ccc', background: 'none', borderRadius: '12px', cursor: 'pointer', color: '#666' }}>
                + Add a New Payment Method
              </button>
            )}
          </div>
        </section>

        {/* 3. Receipts & Order History Section */}
        <section className="receipts-section" style={{ padding: '20px', background: '#fff', borderRadius: '15px', border: '1px solid #ddd' }}>
          <h3>Receipts & Order History</h3>
          <div style={{ marginTop: '20px' }}>
            {loadingReceipts ? (
              <p>Loading your history...</p>
            ) : bookings.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {bookings.filter(b => b.event).map(booking => (
                  <div key={booking._id} style={{ padding: '15px', border: '1px solid #eee', borderRadius: '12px', background: '#fafafa' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{booking.event.title}</span>
                      <span style={{ fontWeight: 'bold', color: 'var(--primary-lavender)' }}>£{booking.totalAmount}</span>
                    </div>
                    <div style={{ fontSize: '14px', color: '#555', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <span style={{ display: 'block', color: '#888', fontSize: '12px' }}>EVENT DATE</span>
                        <span>{booking.event.date}</span>
                      </div>
                      <div>
                        <span style={{ display: 'block', color: '#888', fontSize: '12px' }}>SEATS / ENTRY</span>
                        <span>{booking.seat === "General Admission" ? "General Admission" : booking.seat}</span>
                      </div>
                      <div>
                        <span style={{ display: 'block', color: '#888', fontSize: '12px' }}>PURCHASED ON</span>
                        <span>{booking.purchaseDate || "Earlier Session"}</span>
                      </div>
                      <div>
                        <span style={{ display: 'block', color: '#888', fontSize: '12px' }}>REF</span>
                        <span>{booking.bookingRef}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
                <p>No purchase history found.</p>
              </div>
            )}
          </div>
        </section>

        {/* 4. Visual Accessibility Section */}
        <section className="account-settings" style={{ padding: '20px', border: '1px solid var(--soft-lavender)', borderRadius: '15px' }}>
          <h3 style={{ marginBottom: '20px' }}>Visual Accessibility</h3>
          <div className="settings-grid" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><span style={{ fontWeight: 'bold', display: 'block' }}>Large Text Scaling</span><span style={{ fontSize: '13px', color: '#666' }}>Increases font sizes.</span></div>
              <ToggleSwitch checked={accessSettings.textScaling} onChange={() => toggleSetting('textScaling')} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><span style={{ fontWeight: 'bold', display: 'block' }}>High Contrast Mode</span><span style={{ fontSize: '13px', color: '#666' }}>Pure black and white theme.</span></div>
              <ToggleSwitch checked={accessSettings.highContrast} onChange={() => toggleSetting('highContrast')} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><span style={{ fontWeight: 'bold', display: 'block' }}>Highlight Links</span><span style={{ fontSize: '13px', color: '#666' }}>Adds outlines to buttons.</span></div>
              <ToggleSwitch checked={accessSettings.linkHighlight} onChange={() => toggleSetting('linkHighlight')} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AccountPage;
