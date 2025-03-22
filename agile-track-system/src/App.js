import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Dashboard from './components/Dashboard/Dashboard';
import Login from './components/Login/Login';
import UserProfile from './components/UserProfile/UserProfile';
import SignUp from './components/SignUp/SignUp';
import { UserProvider, UserContext } from '../src/context/UserContext';
import './App.css';

const App = () => {
  return (
    <UserProvider>
      <Router>
        <div className="app">
          <Nav />
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/profiles" element={<UserProfile />} />
          </Routes>
        </div>
      </Router>
    </UserProvider>
  );
};

const Nav = () => {
  const location = useLocation();
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav>
      <div className="nav-links">
        <Link to="/dashboard" className="nav-item">Dashboard</Link>
        {!user && location.pathname !== "/login" && (
          <Link to="/login" className="nav-item">Login</Link>
        )}
        {user && <Link to="/profiles" className="nav-item">Profiles</Link>}
      </div>
      
      {user && (
        <div className="nav-right">
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      )}
    </nav>
  );
};

export default App;
