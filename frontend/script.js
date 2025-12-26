const TOKEN_KEY = "authnest_token";

// Token helpers for localStorage.
function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// Display a message below a form or section.
function showMessage(element, message, isError) {
  if (!element) return;
  element.textContent = message;
  element.className = isError ? "message error" : "message success";
}

// Wrapper for fetch() that handles JSON and errors.
async function apiRequest(path, options = {}) {
  const headers = options.headers || {};
  headers["Content-Type"] = "application/json";

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(path, {
    ...options,
    headers,
  });

  let data = {};
  try {
    data = await response.json();
  } catch (err) {
    // If the server returns no JSON, keep data as empty object.
  }

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

// Logic for the login/signup page.
function initIndexPage() {
  const signupForm = document.getElementById("signup-form");
  const loginForm = document.getElementById("login-form");
  const signupMessage = document.getElementById("signup-message");
  const loginMessage = document.getElementById("login-message");

  if (getToken()) {
    window.location.href = "/dashboard.html";
    return;
  }

  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    showMessage(signupMessage, "", false);

    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value.trim();

    try {
      await apiRequest("/signup", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      showMessage(signupMessage, "Signup successful. You can log in now.", false);
      signupForm.reset();
    } catch (err) {
      showMessage(signupMessage, err.message, true);
    }
  });

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    showMessage(loginMessage, "", false);

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value.trim();

    try {
      const data = await apiRequest("/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setToken(data.token);
      window.location.href = "/dashboard.html";
    } catch (err) {
      showMessage(loginMessage, err.message, true);
    }
  });
}

// Render a list of notes on the dashboard page.
function renderNotes(notes) {
  const list = document.getElementById("notes-list");
  list.innerHTML = "";

  if (notes.length === 0) {
    const empty = document.createElement("li");
    empty.textContent = "No notes yet.";
    list.appendChild(empty);
    return;
  }

  notes.forEach((note) => {
    const item = document.createElement("li");
    const text = document.createElement("span");
    text.textContent = note.content;
    const delButton = document.createElement("button");
    delButton.textContent = "Delete";
    delButton.dataset.id = note.id;
    item.appendChild(text);
    item.appendChild(delButton);
    list.appendChild(item);
  });
}

// Load notes for the logged-in user.
async function loadNotes() {
  const noteMessage = document.getElementById("note-message");
  showMessage(noteMessage, "", false);

  try {
    const data = await apiRequest("/notes");
    renderNotes(data.notes || []);
  } catch (err) {
    showMessage(noteMessage, err.message, true);
  }
}

// Logic for the notes dashboard page.
function initDashboardPage() {
  const noteForm = document.getElementById("note-form");
  const noteInput = document.getElementById("note-content");
  const notesList = document.getElementById("notes-list");
  const noteMessage = document.getElementById("note-message");
  const logoutButton = document.getElementById("logout-button");

  if (!getToken()) {
    window.location.href = "/";
    return;
  }

  logoutButton.addEventListener("click", () => {
    clearToken();
    window.location.href = "/";
  });

  noteForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    showMessage(noteMessage, "", false);

    const content = noteInput.value.trim();
    if (!content) {
      showMessage(noteMessage, "Please enter note content.", true);
      return;
    }

    try {
      await apiRequest("/notes", {
        method: "POST",
        body: JSON.stringify({ content }),
      });
      noteForm.reset();
      await loadNotes();
    } catch (err) {
      showMessage(noteMessage, err.message, true);
    }
  });

  notesList.addEventListener("click", async (event) => {
    if (event.target.tagName !== "BUTTON") return;
    const noteId = event.target.dataset.id;
    if (!noteId) return;

    try {
      await apiRequest(`/notes/${noteId}`, { method: "DELETE" });
      await loadNotes();
    } catch (err) {
      showMessage(noteMessage, err.message, true);
    }
  });

  loadNotes();
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("signup-form")) {
    initIndexPage();
  }

  if (document.getElementById("note-form")) {
    initDashboardPage();
  }
});
