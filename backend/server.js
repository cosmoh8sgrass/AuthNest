const path = require("path");
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("./db");
const notesRouter = require("./notes");
const { JWT_SECRET } = require("./auth");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Simple CORS headers for local development and file:// testing.
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE");
  return next();
});

// Serve the frontend so everything works from one server.
const frontendPath = path.join(__dirname, "..", "frontend");
app.use(express.static(frontendPath));

// Create a new user account.
app.post("/signup", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  db.get("SELECT id FROM users WHERE email = ?", [email], (err, row) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }
    if (row) {
      return res.status(400).json({ error: "Email already exists" });
    }

    bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
      if (hashErr) {
        return res.status(500).json({ error: "Password hashing failed" });
      }

      db.run(
        "INSERT INTO users (email, password) VALUES (?, ?)",
        [email, hashedPassword],
        function insertUser(insertErr) {
          if (insertErr) {
            return res.status(500).json({ error: "Database error" });
          }
          return res.status(201).json({ id: this.lastID, email });
        }
      );
    });
  });
});

// Log in and return a signed JWT.
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  db.get(
    "SELECT id, email, password FROM users WHERE email = ?",
    [email],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      bcrypt.compare(password, user.password, (compareErr, isMatch) => {
        if (compareErr) {
          return res.status(500).json({ error: "Password check failed" });
        }
        if (!isMatch) {
          return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign(
          { id: user.id, email: user.email },
          JWT_SECRET,
          { expiresIn: "1h" }
        );

        return res.json({ token });
      });
    }
  );
});

// Protected notes routes.
app.use("/notes", notesRouter);

app.listen(PORT, () => {
  console.log(`AuthNest server running on http://localhost:${PORT}`);
});
