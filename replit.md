# AuthNest

## Overview
AuthNest is a full-stack authentication demo app that teaches JWT-based authentication and SQLite database usage. Users can sign up, log in, and manage personal notes through JWT-protected APIs.

## Project Architecture

### Backend (Node.js/Express)
- `backend/server.js` - Main Express server, serves static frontend files and API endpoints
- `backend/auth.js` - JWT authentication utilities
- `backend/db.js` - SQLite database connection and setup
- `backend/notes.js` - Notes API routes

### Frontend (Vanilla HTML/JS)
- `frontend/index.html` - Login/signup page
- `frontend/dashboard.html` - Notes dashboard (protected)
- `frontend/script.js` - Client-side logic for auth and notes

### Database
- SQLite database auto-created at `backend/authnest.db`
- Tables: `users`, `notes`

## API Endpoints
- `POST /signup` - Create new user account
- `POST /login` - Authenticate and receive JWT
- `GET /notes` - List notes for logged-in user
- `POST /notes` - Create a note
- `DELETE /notes/:id` - Delete a note

## Running the App
The server runs on port 5000 and serves both the API and static frontend files.

## Environment Variables
- `JWT_SECRET` - Optional custom JWT signing secret (has default)
- `PORT` - Server port (defaults to 5000)
