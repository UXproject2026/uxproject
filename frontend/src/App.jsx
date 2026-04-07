import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Home from './components/Home'
import EventDetails from './components/EventDetails'
import PaymentPage from './components/PaymentPage'
import MyTickets from './components/MyTickets'
import SearchPage from './components/SearchPage'
import HelpPage from './components/HelpPage'
import AccountPage from './components/AccountPage'
import SignIn from './components/SignIn'
import SignUp from './components/SignUp'
import TermsOfService from './components/TermsOfService'
import PrivacyPolicy from './components/PrivacyPolicy'
import ScrollToTop from './components/ScrollToTop'
import ChatWidget from './components/ChatWidget'
import './App.css'

const TopNav = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    setIsLoggedIn(false);
    navigate('/signin');
    window.location.reload();
  };

  return (
    <nav className="top-nav">
      <div className="top-nav-content">
        <Link to="/" className="logo">
          Scene<span className="logo-accent">Pass</span>
        </Link>
        <div className="desktop-menu">
          <Link to="/">Home</Link>
          <Link to="/search">Search</Link>
          <Link to="/my-tickets">My Tickets</Link>
          <Link to="/help">Help</Link>
          {isLoggedIn ? (
            <>
              <Link to="/account" style={{ fontWeight: 'bold' }}>Profile</Link>
              <button 
                onClick={handleLogout}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: 'var(--text-main)', 
                  cursor: 'pointer', 
                  fontWeight: '600',
                  padding: '0',
                  fontSize: '15px',
                  fontFamily: 'inherit'
                }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link to="/signin" className="signin-nav-link">Sign In</Link>
          )}
        </div>
      </div>
    </nav>
  )
}

const Footer = () => {
  return (
    <footer className="main-footer">
      <div className="footer-content">
        <div className="footer-brand">
          <Link to="/" className="logo">
            Scene<span className="logo-accent">Pass</span>
          </Link>
          <p>The premier destination for discovering and booking the best performing arts events in Leeds.</p>
        </div>
        <div className="footer-links">
          <h4>Explore</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/search">Search Shows</Link></li>
            <li><Link to="/help">Help & FAQ</Link></li>
          </ul>
        </div>
        <div className="footer-links">
          <h4>Account</h4>
          <ul>
            <li><Link to="/signin">Sign In</Link></li>
            <li><Link to="/signup">Create Account</Link></li>
            <li><Link to="/my-tickets">My Tickets</Link></li>
          </ul>
        </div>
        <div className="footer-links">
          <h4>Connect</h4>
          <ul>
            <li><a href="#">Instagram</a></li>
            <li><a href="#">Twitter</a></li>
            <li><a href="#">Facebook</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2026 ScenePass Leeds. All rights reserved.</p>
        <div className="footer-legal">
          <Link to="/privacy" style={{ marginRight: '20px' }}>Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="app-container">
        <TopNav />
        <main className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/events/:eventId" element={<EventDetails />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/my-tickets" element={<MyTickets />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
          </Routes>
        </main>
        <Footer />
        <ChatWidget />
      </div>
    </Router>
  )
}

export default App
