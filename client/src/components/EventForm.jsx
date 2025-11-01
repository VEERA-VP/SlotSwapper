import React, { useState } from 'react';

function toLocalDateTimeValue(d) {
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EventForm({ onCreate }) {
  const now = new Date();
  now.setSeconds(0, 0);
  const startDefault = new Date(Math.ceil(now.getTime() / (15 * 60 * 1000)) * (15 * 60 * 1000));
  const endDefault = new Date(startDefault.getTime() + 60 * 60 * 1000);

  const [title, setTitle] = useState('');
  const [start, setStart] = useState(toLocalDateTimeValue(startDefault));
  const [end, setEnd] = useState(toLocalDateTimeValue(endDefault));
  const [err, setErr] = useState('');

  function submit(e) {
    e.preventDefault();
    setErr('');
    if (!title || !start || !end) return setErr('Please fill title, start, and end.');
    const s = new Date(start), en = new Date(end);
    if (isNaN(s) || isNaN(en)) return setErr('Invalid date/time.');
    if (en <= s) return setErr('End must be after start.');
    onCreate({ title, startTime: start, endTime: end, status: 'BUSY' });
    setTitle('');
    const ns = new Date(en.getTime());
    const ne = new Date(ns.getTime() + 60 * 60 * 1000);
    setStart(toLocalDateTimeValue(ns));
    setEnd(toLocalDateTimeValue(ne));
  }

  return (
    <form onSubmit={submit}>
      {err && <div className="alert alert-error">{err}</div>}
      <div className="form-group">
        <label className="form-label">Event Title</label>
        <input 
          className="form-input"
          placeholder="Enter event title" 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
          required 
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="form-group">
          <label className="form-label">Start Time</label>
          <input 
            className="form-input"
            type="datetime-local" 
            value={start} 
            onChange={e => setStart(e.target.value)} 
            step="60" 
            required 
          />
        </div>
        <div className="form-group">
          <label className="form-label">End Time</label>
          <input 
            className="form-input"
            type="datetime-local" 
            value={end} 
            onChange={e => setEnd(e.target.value)} 
            step="60" 
            required 
          />
        </div>
      </div>
      <button type="submit" className="btn btn-primary">Create Event</button>
    </form>
  );
}
