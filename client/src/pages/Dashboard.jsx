import React, { useEffect, useState } from 'react';
import { api } from '../api';
import EventForm from '../components/EventForm';

export default function Dashboard({ user, token }) {
  const [events, setEvents] = useState([]);
  const [others, setOthers] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [error, setError] = useState(null);

  function formatDateRange(startTime, endTime) {
    if (!startTime || !endTime) return '';
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    const dateStr = `${start.getMonth() + 1}/${start.getDate()}/${start.getFullYear()}`;
    
    const formatTime = (date) => {
      let hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
      return `${hours}:${minutesStr} ${ampm}`;
    };
    
    const startTimeStr = formatTime(start);
    const endTimeStr = formatTime(end);
    
    return `${dateStr}, ${startTimeStr} - ${endTimeStr}`;
  }

  async function refresh() {
    try {
      const my   = await api('/events',                 { token });
      const other= await api('/swappable-slots',        { token });
      const inc  = await api('/swap-requests/incoming', { token });
      const out  = await api('/swap-requests/outgoing', { token });
      setEvents(my.events || []);
      setOthers(other.slots || []);
      setIncoming(inc.requests || []);
      setOutgoing(out.requests || []);
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    refresh();
  }, [token]);

  async function create(ev) {
    await api('/events', { method: 'POST', body: ev, token });
    refresh();
  }

  async function setStatus(id, status) {
    await api(`/events/${id}`, { method: 'PUT', body: { status }, token });
    refresh();
  }

  async function requestSwap(mySlotId, theirSlotId) {
    await api('/swap-request', { method: 'POST', body: { mySlotId, theirSlotId }, token });
    refresh();
  }

  async function respond(id, accept) {
    await api(`/swap-response/${id}`, { method: 'POST', body: { accept }, token });
    refresh();
  }

  return (
    <div className="content-wrapper">
      <div className="grid">
        <div className="welcome-section">
          <h1 className="welcome-title">Welcome, {user.name}</h1>
          <p className="welcome-subtitle">Manage your events and swap slots with others</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <section className="section">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Create New Event</h3>
              <p className="card-subtitle">Add a new event to your schedule</p>
            </div>
            <EventForm onCreate={create} />
          </div>
        </section>

        <section className="section">
          <h3 className="section-title">My Events</h3>
          {events.length === 0 ? (
            <div className="card empty-state">
              <div className="empty-state-icon">📅</div>
              <p>No events yet. Create your first event above!</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map(e => (
                    <tr key={e._id}>
                      <td><strong>{e.title}</strong></td>
                      <td>{new Date(e.startTime).toLocaleString()}</td>
                      <td>{new Date(e.endTime).toLocaleString()}</td>
                      <td>
                        <span className={`badge ${e.status === 'SWAPPABLE' ? 'badge-success' : 'badge-info'}`}>
                          {e.status}
                        </span>
                      </td>
                      <td>
                        {e.status !== 'SWAPPABLE' && (
                          <button 
                            onClick={() => setStatus(e._id, 'SWAPPABLE')}
                            className="btn btn-success btn-sm"
                          >
                            Make Swappable
                          </button>
                        )}
                        {e.status === 'SWAPPABLE' && (
                          <button 
                            onClick={() => setStatus(e._id, 'BUSY')}
                            className="btn btn-secondary btn-sm"
                          >
                            Mark Busy
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="section">
          <h3 className="section-title">Available Slots to Swap</h3>
          {others.length === 0 ? (
            <div className="card empty-state">
              <div className="empty-state-icon">🔍</div>
              <p>No swappable slots available from other users at the moment.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Time</th>
                    <th>Owner</th>
                    <th>Offer My Slot</th>
                  </tr>
                </thead>
                <tbody>
                  {others.map(o => (
                    <tr key={o._id}>
                      <td><strong>{o.title}</strong></td>
                      <td>
                        {new Date(o.startTime).toLocaleString()} – {new Date(o.endTime).toLocaleString()}
                      </td>
                      <td>{o.userId?.name ?? o.userId}</td>
                      <td>
                        <select 
                          className="form-select"
                          onChange={(ev) => {
                            const my = ev.target.value;
                            if (my) requestSwap(my, o._id);
                            ev.target.value = '';
                          }} 
                          defaultValue=""
                        >
                          <option value="" disabled>Choose my swappable slot</option>
                          {events.filter(e => e.status === 'SWAPPABLE').map(e => (
                            <option key={e._id} value={e._id}>
                              {e.title} ({new Date(e.startTime).toLocaleString()})
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="section">
          <div className="grid grid-2">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Incoming Requests</h3>
                <p className="card-subtitle">Requests from other users</p>
              </div>
              {incoming.length === 0 ? (
                <div className="empty-state" style={{ padding: '24px' }}>
                  <p>No incoming requests</p>
                </div>
              ) : (
                <ul className="list">
                  {incoming.map(r => (
                    <li key={r._id} className="list-item">
                      <p style={{ marginBottom: '12px' }}>
                        <strong>{r.requesterId?.name || 'Someone'}</strong> wants your{' '}
                        <strong>{r.theirSlotId?.title}</strong>
                        {r.theirSlotId?.startTime && r.theirSlotId?.endTime && (
                          <> scheduled from {formatDateRange(r.theirSlotId.startTime, r.theirSlotId.endTime)}</>
                        )}
                      </p>
                      <p style={{ marginBottom: '12px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                        They will give you: <strong>{r.mySlotId?.title}</strong>
                        {r.mySlotId?.startTime && r.mySlotId?.endTime && (
                          <> scheduled from {formatDateRange(r.mySlotId.startTime, r.mySlotId.endTime)}</>
                        )}
                      </p>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => respond(r._id, true)}
                          className="btn btn-success btn-sm"
                        >
                          Accept
                        </button>
                        <button 
                          onClick={() => respond(r._id, false)}
                          className="btn btn-danger btn-sm"
                        >
                          Reject
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">My Outgoing Requests</h3>
                <p className="card-subtitle">Requests you've sent</p>
              </div>
              {outgoing.length === 0 ? (
                <div className="empty-state" style={{ padding: '24px' }}>
                  <p>No outgoing requests</p>
                </div>
              ) : (
                <ul className="list">
                  {outgoing.map(r => (
                    <li key={r._id} className="list-item">
                      <p style={{ marginBottom: '8px' }}>
                        You requested <strong>{r.theirSlotId?.title}</strong> from{' '}
                        <strong>{r.responderId?.name || 'user'}</strong>
                        {r.theirSlotId?.startTime && r.theirSlotId?.endTime && (
                          <> scheduled from {formatDateRange(r.theirSlotId.startTime, r.theirSlotId.endTime)}</>
                        )}
                      </p>
                      <p style={{ marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                        You offered: <strong>{r.mySlotId?.title}</strong>
                        {r.mySlotId?.startTime && r.mySlotId?.endTime && (
                          <> scheduled from {formatDateRange(r.mySlotId.startTime, r.mySlotId.endTime)}</>
                        )}
                      </p>
                      <span className={`badge ${
                        r.status === 'ACCEPTED' ? 'badge-success' :
                        r.status === 'REJECTED' ? 'badge-warning' :
                        'badge-info'
                      }`}>
                        {r.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
