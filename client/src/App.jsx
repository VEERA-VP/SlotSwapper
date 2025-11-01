import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import { api } from './api';
import './styles.css';

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const nav = useNavigate();

  useEffect(() => {
    api('/auth/me').then(d => setUser(d.user)).catch(() => {});
  }, []);

  function logout() {
    api('/auth/logout', { method: 'POST' }).finally(() => {
      setUser(null);
      setToken(null);
      nav('/login');
    });
  }

  return (
    <div className="app-container">
      <header className="header">
        <div className="content-wrapper">
          <div className="header-content">
            <Link to="/" className="logo">SlotSwapper</Link>
            <nav className="nav">
              {user ? (<>
                <Link to="/" className="nav-link">Dashboard</Link>
                <button onClick={logout} className="btn btn-outline btn-sm">Logout</button>
              </>) : (<>
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/signup" className="btn btn-primary btn-sm">Sign Up</Link>
              </>)}
            </nav>
          </div>
        </div>
      </header>
      <main className="main-content">
        <Routes>
          <Route path="/" element={user ? <Dashboard user={user} token={token} /> : <Navigate to="/login" />} />
          <Route path="/login" element={<Login onAuth={(u, t) => { setUser(u); setToken(t); nav('/'); }} />} />
          <Route path="/signup" element={<Signup onAuth={(u, t) => { setUser(u); setToken(t); nav('/'); }} />} />
        </Routes>
      </main>
    </div>
  );
}
