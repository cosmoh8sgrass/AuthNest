const path = require("path");
const sqlite3 = require("sqlite3").verbose();

// Create or open the local SQLite database file.
const dbPath = path.join(__dirname, "authnest.db");
const db = new sqlite3.Database(dbPath);

// Create tables if they do not exist.
db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )`
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      userId INTEGER NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id)
    )`
  );
});

module.exports = db;
