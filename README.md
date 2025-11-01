# SlotSwapper

A peer‑to‑peer time‑slot scheduling app where users can mark busy calendar events as **swappable** and trade them with other users.

## Tech Stack
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT auth
- **Frontend:** React (Vite), React Router, Fetch API
- **Auth:** HTTP-only cookie (or Bearer) JWT
- **Tooling:** Concurrent dev via `npm run dev` at root

## Quick Start

### 0) Prereqs
- Node.js 18+
- MongoDB (Atlas or local)

### 1) Clone & Install
```bash
# from the extracted zip
cd slotswapper
npm install
cd server && npm install
cd ../client && npm install
```

### 2) Configure Environment
Copy `server/.env.example` to `server/.env` and set values:
```
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/slotswapper
JWT_SECRET=dev_secret_change_me
CORS_ORIGIN=http://localhost:5173
COOKIE_SECURE=false
```

### 3) Run (dev)
```bash
# in one terminal
cd server && npm run dev
# in another
cd client && npm run dev
```
- API: http://localhost:4000/api
- Web: http://localhost:5173

### 4) Build
```bash
cd client && npm run build
```

## API Overview

### Auth
- `POST /api/auth/signup` — { name, email, password }
- `POST /api/auth/login` — { email, password } → JWT
- `GET  /api/auth/me` — current user (auth)
- `POST /api/auth/logout` — clear cookie

### Events
- `GET    /api/events` — list my events
- `POST   /api/events` — create { title, startTime, endTime, status }
- `PUT    /api/events/:id` — update
- `DELETE /api/events/:id` — delete

### Swapping
- `GET  /api/swappable-slots` — other users' `SWAPPABLE` events
- `POST /api/swap-request` — { mySlotId, theirSlotId }
- `POST /api/swap-response/:requestId` — { accept: boolean }
- `GET  /api/swap-requests/incoming` — my incoming (PENDING)
- `GET  /api/swap-requests/outgoing` — my outgoing

### Status enum
`BUSY | SWAPPABLE | SWAP_PENDING`

##  Live Demo

**Frontend (Deployed App):** [https://slotswapper-1-npp1.onrender.com](https://slotswapper-1-npp1.onrender.com)

If you encounter any issues or “Unauthorized” errors while using the deployed version,
please **clone the repository and run it locally** by following the setup instructions in this README.

##  Test Credentials

You can use any of the following demo accounts to explore the app:

| Email             | Password   |
| ----------------- | ---------- |
| `test1@gmail.com` | `password` |
| `test2@gmail.com` | `password` |
| `john@gmail.com`  | `john`     |

You can also **sign up** with a new account if you prefer.
