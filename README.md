# AuthNest

AuthNest is a tiny full-stack app that teaches authentication and basic database usage. Users can sign up, log in, and manage their own notes with JWT-protected APIs.

## Setup

1. Install backend dependencies:
   - `cd backend`
   - `npm install`
2. Start the server:
   - `npm start`
3. Open the app:
   - Visit `http://localhost:3000` in your browser.

The SQLite database file is created automatically at `backend/authnest.db`.

## API Summary

- `POST /signup` -> create a new user
- `POST /login` -> get a JWT
- `GET /notes` -> list notes for the logged-in user
- `POST /notes` -> create a note for the logged-in user
- `DELETE /notes/:id` -> delete a note that belongs to the logged-in user

## Notes

- JWTs are stored in `localStorage` on the frontend.
- Set `JWT_SECRET` in your environment if you want a custom secret. Use `backend/.env.example` as a template.
