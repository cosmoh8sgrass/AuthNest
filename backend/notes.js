const express = require("express");
const db = require("./db");
const { authMiddleware } = require("./auth");

const router = express.Router();

// Get all notes for the logged-in user.
router.get("/", authMiddleware, (req, res) => {
  db.all(
    "SELECT id, content FROM notes WHERE userId = ? ORDER BY id DESC",
    [req.user.id],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }
      return res.json({ notes: rows });
    }
  );
});

// Create a note for the logged-in user.
router.post("/", authMiddleware, (req, res) => {
  const { content } = req.body;
  if (!content) {
    return res.status(400).json({ error: "Content is required" });
  }

  db.run(
    "INSERT INTO notes (content, userId) VALUES (?, ?)",
    [content, req.user.id],
    function insertNote(err) {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }
      return res.status(201).json({ id: this.lastID, content });
    }
  );
});

// Delete a note that belongs to the logged-in user.
router.delete("/:id", authMiddleware, (req, res) => {
  const noteId = Number(req.params.id);
  if (!noteId) {
    return res.status(400).json({ error: "Invalid note id" });
  }

  db.run(
    "DELETE FROM notes WHERE id = ? AND userId = ?",
    [noteId, req.user.id],
    function deleteNote(err) {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: "Note not found" });
      }
      return res.json({ success: true });
    }
  );
});

module.exports = router;
