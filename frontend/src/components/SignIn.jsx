import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

/**
 * SignIn Component
 * Allows existing users to access their accounts.
 */
const SignIn = () => {
  // --- Form State ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  /**
   * handleSubmit
   * Processes the login request and updates the local session state.
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // --- Simulated Authentication ---
    // In this prototype, we consider any credentials valid as long as they are provided.
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', email);

    // Redirect user to their account dashboard
    navigate('/account');

    // Force refresh to trigger Navbar UI updates (showing "Account" instead of "Sign In")
    window.location.reload(); 
  };

  return (
    <div className="auth-container">
      {/* Visual branding/welcome */}
      <div className="auth-header">
        <h2>Sign In</h2>
        <p>Welcome back to ScenePass</p>
      </div>
      
      {/* Login Form */}
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email Address</label>
          <input 
            type="email" 
            required 
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label>Password</label>
          <input 
            type="password" 
            required 
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" className="auth-submit-btn">Sign In</button>
      </form>

      {/* Navigation link for new users */}
      <div className="auth-footer">
        Don't have an account? <Link to="/signup">Sign Up</Link>
      </div>
    </div>
  );
};

export default SignIn;
