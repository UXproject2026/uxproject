import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    // Simulate signup
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userName', formData.name);
    localStorage.setItem('userEmail', formData.email);
    navigate('/account');
    window.location.reload(); // Refresh to update navbar
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <h2>Create Account</h2>
        <p>Join the Leeds theatre community</p>
      </div>
      
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

      <div className="auth-footer">
        Already have an account? <Link to="/signin">Sign In</Link>
      </div>
    </div>
  );
};

export default SignUp;
