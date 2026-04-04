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
                  color: 'var(--text-dark)', 
                  cursor: 'pointer', 
                  fontWeight: '500',
                  padding: '0',
                  fontSize: 'inherit',
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

function App() {
  return (
    <Router>
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
          </Routes>
        </main>
        <ChatWidget />
      </div>
    </Router>
  )
}

export default App
