import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';

function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    const adminCredentials = {
      username: 'admin',
      password: '12345',
    };

    if (username === adminCredentials.username && password === adminCredentials.password) {
      localStorage.setItem('adminAuth', true);
      navigate('/admin');
    } else {
      alert('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="admin-login-container">
      {/* Back Icon */}
      <div className="back-icon" onClick={() => navigate('/login')}>
        ← Back
      </div>

      {/* Login Card */}
      <div className="admin-login-card">
        <h1>Admin Login</h1>
        <form onSubmit={handleLogin}>
          <div className="formz-group">
            <label>Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              placeholder="Enter your username"
              required 
            />
          </div>
          <div className="formz-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Enter your password"
              required 
            />
          </div>
          <button type="submit" className="login-button">Login</button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
