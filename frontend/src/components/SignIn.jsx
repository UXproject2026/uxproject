import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate login
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', email);
    navigate('/account');
    window.location.reload(); // Refresh to update navbar
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <h2>Sign In</h2>
        <p>Welcome back to ScenePass</p>
      </div>
      
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

      <div className="auth-footer">
        Don't have an account? <Link to="/signup">Sign Up</Link>
      </div>
    </div>
  );
};

export default SignIn;
