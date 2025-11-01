import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function Login({ onAuth }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState(null);

  async function submit(e) {
    e.preventDefault();
    try {
      const { token, user } = await api('/auth/login', { method: 'POST', body: { email, password } });
      onAuth(user, token);
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div className="form-container">
      <div className="auth-card">
        <h2 className="form-title">Welcome Back</h2>
        <p className="form-subtitle">Sign in to your account to continue</p>
        <form onSubmit={submit}>
          {err && <div className="alert alert-error">{err}</div>}
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
              placeholder="Enter your password" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
            Sign In
          </button>
          <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-secondary)', fontSize: '14px' }}>
            Don't have an account? <Link to="/signup" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '500' }}>Sign up</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
