import React from 'react';
import { Navigate } from 'react-router-dom';
import './Admin.css';

function Admin() {
  const isAuthenticated = localStorage.getItem('adminAuth');

  if (!isAuthenticated) {
    return <Navigate to="/admin-login" />;
  }

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    window.location.href = '/admin-login';
  };

  const handleCreateShop = (e) => {
    e.preventDefault();
    alert('Shop Created Successfully!');
  };

  return (
    <div className="admin-dashboard-container">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Create and manage shops with ease</p>
      </div>

      {/* Form Section */}
      <form className="dashboard-form" onSubmit={handleCreateShop}>
        <div className="form-group">
          <label>Shop ID</label>
          <input type="text" placeholder="Enter Shop ID" required />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" placeholder="Enter Email Address" required />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" placeholder="Enter Password" required />
        </div>
        <button type="submit" className="submit-button">Create Shop</button>
      </form>

      {/* Logout Button */}
      <button onClick={handleLogout} className="floating-logout-button" title="Logout">
        <span>🔒</span>
      </button>
    </div>
  );
}

export default Admin;
