import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useNavigate, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import { api } from './api';
import './styles.css';

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();
  const location = useLocation();

  useEffect(() => {
    api('/auth/me')
      .then(d => {
        setUser(d.user);
      })
      .catch(() => {
        setUser(null);
        setToken(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  function logout() {
    api('/auth/logout', { method: 'POST' }).finally(() => {
      setUser(null);
      setToken(null);
      nav('/login');
    });
  }

  if (loading) {
    return (
      <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  const showLogout = user && !isAuthPage;

  return (
    <div className="app-container">
      <header className="header">
        <div className="content-wrapper">
          <div className="header-content">
            <Link to="/" className="logo">SlotSwapper</Link>
            <nav className="nav">
              {showLogout ? (
                <>
                  <Link to="/" className="nav-link">Dashboard</Link>
                  <button onClick={logout} className="btn btn-outline btn-sm">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="nav-link">Login</Link>
                  <Link to="/signup" className="btn btn-primary btn-sm">Sign Up</Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>
      <main className="main-content">
        <Routes>
          <Route path="/" element={user ? <Dashboard user={user} token={token} /> : <Navigate to="/login" />} />
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login onAuth={(u, t) => { setUser(u); setToken(t); nav('/'); }} />} />
          <Route path="/signup" element={user ? <Navigate to="/" /> : <Signup onAuth={(u, t) => { setUser(u); setToken(t); nav('/'); }} />} />
        </Routes>
      </main>
    </div>
  );
}
