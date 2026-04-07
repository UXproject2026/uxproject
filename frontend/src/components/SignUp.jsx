import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

/**
 * SignUp Component
 * Handles new user registration through a form-based interface.
 */
const SignUp = () => {
  // --- Form State ---
  // Captures all necessary user details for account creation
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const navigate = useNavigate();

  /**
   * handleSubmit
   * Validates the form and simulates a successful registration by storing user data in localStorage.
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simple client-side validation
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // --- Simulated Registration Logic ---
    // In a real app, this would be an API call to a /register endpoint.
    // For this prototype, we use localStorage to persist the "session".
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userName', formData.name);
    localStorage.setItem('userEmail', formData.email);

    // Redirect to Account page after "registration"
    navigate('/account');
    
    // Force a reload to ensure the Navbar and other components detect the new login state
    window.location.reload(); 
  };

  return (
    <div className="auth-container">
      {/* Header section with branding/intro */}
      <div className="auth-header">
        <h2>Create Account</h2>
        <p>Join the Leeds theatre community</p>
      </div>
      
      {/* Registration Form */}
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Full Name</label>
          <input 
            type="text" 
            required 
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>

        <div className="form-group">
          <label>Email Address</label>
          <input 
            type="email" 
            required 
            placeholder="your@email.com"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </div>
        
        <div className="form-group">
          <label>Password</label>
          <input 
            type="password" 
            required 
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
        </div>

        <div className="form-group">
          <label>Confirm Password</label>
          <input 
            type="password" 
            required 
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
          />
        </div>

        <button type="submit" className="auth-submit-btn">Create Account</button>
      </form>

      {/* Footer link for existing users */}
      <div className="auth-footer">
        Already have an account? <Link to="/signin">Sign In</Link>
      </div>
    </div>
  );
};

export default SignUp;
