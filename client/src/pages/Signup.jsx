import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function Signup({ onAuth }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState(null);

  async function submit(e) {
    e.preventDefault();
    try {
      const { token, user } = await api('/auth/signup', { method: 'POST', body: { name, email, password } });
      onAuth(user, token);
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div className="form-container">
      <div className="auth-card">
        <h2 className="form-title">Create Account</h2>
        <p className="form-subtitle">Get started with SlotSwapper today</p>
        <form onSubmit={submit}>
          {err && <div className="alert alert-error">{err}</div>}
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              className="form-input"
              placeholder="Enter your name" 
              value={name} 
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              className="form-input"
              type="email"
              placeholder="Enter your email" 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              className="form-input"
              type="password" 
              placeholder="Create a password" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
            Create Account
          </button>
          <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-secondary)', fontSize: '14px' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '500' }}>Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
