
"use client";

import { useEffect, useState, type FormEvent } from "react";

type Note = {
  id: number;
  title: string;
  content: string;
  color: number;
};

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const savedNotes = localStorage.getItem("little-pages-notes");
      const savedLogin = localStorage.getItem("little-pages-login");

      if (savedNotes) setNotes(JSON.parse(savedNotes));
      if (savedLogin === "true") setLoggedIn(true);
    } catch {
      setNotes([]);
    }

    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) {
      localStorage.setItem("little-pages-notes", JSON.stringify(notes));
    }
  }, [notes, ready]);

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please fill in both fields.");
      return;
    }

    if (!/^[^\s@]+@gmail\.com$/i.test(email.trim())) {
      setError("Please enter a valid @gmail.com address.");
      return;
    }

    if (password.length <= 6) {
      setError("Password must be more than 6 characters.");
      return;
    }

    localStorage.setItem("little-pages-login", "true");
    setLoggedIn(true);
  }

  function saveNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim() || !content.trim()) return;

    if (editingId !== null) {
      setNotes((old) =>
        old.map((note) =>
          note.id === editingId
            ? { ...note, title: title.trim(), content: content.trim() }
            : note
        )
      );
    } else {
      setNotes((old) => [
        {
          id: Date.now(),
          title: title.trim(),
          content: content.trim(),
          color: old.length % 4,
        },
        ...old,
      ]);
    }

    setTitle("");
    setContent("");
    setEditingId(null);
  }

  function editNote(note: Note) {
    setTitle(note.title);
    setContent(note.content);
    setEditingId(note.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function deleteNote(id: number) {
    setNotes((old) => old.filter((note) => note.id !== id));

    if (editingId === id) {
      setTitle("");
      setContent("");
      setEditingId(null);
    }
  }

  function logout() {
    localStorage.removeItem("little-pages-login");
    setLoggedIn(false);
    setEmail("");
    setPassword("");
    setError("");
    setTitle("");
    setContent("");
    setEditingId(null);
  }

  const filteredNotes = notes.filter((note) =>
    `${note.title} ${note.content}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  if (!ready) return <main className="login-page" />;

  if (!loggedIn) {
    return (
      <main className="login-page">
        <span className="login-decoration sticker-star">✳</span>
        <span className="login-decoration sticker-heart">♡</span>

        <section className="login-card paper">
          <p className="eyebrow">YOUR PERSONAL NOTEBOOK</p>
          <div className="brand-mark">✎</div>
          <h1>little pages<span>.</span></h1>
          <p className="subtitle">
            A little place for everything on your mind.
          </p>

          <div className="tape" />

          <h2>Welcome back!</h2>
          <p className="muted">Ready to pick up where you left off?</p>

          <form onSubmit={handleLogin}>
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              placeholder="you@gmail.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="At least 7 characters"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            <button className="primary-button" type="submit">
              Open my notebook ↗
            </button>

            {error && (
              <p className="error-message" role="alert">
                {error}
              </p>
            )}
          </form>

          <p className="footer-note"> shai_proj ♡</p>
        </section>
      </main>
    );
  }

  return (
    <main className="notebook-page">
      <header className="topbar">
        <a className="wordmark" href="#">little pages<span>.</span></a>
        <button className="logout-button" onClick={logout}>
          Log out ↗
        </button>
      </header>

      <section className="welcome-section">
       
        <h1>A collection of thoughts<span>.</span></h1>
        <p>Keep the ideas, reminders, and thoughts you want to remember.</p>
      </section>

      <section className="editor paper">
        <div className="tape" />
        <p className="eyebrow">
          {editingId !== null ? "EDIT YOUR PAGE" : "A FRESH PAGE"}
        </p>

        <form onSubmit={saveNote}>
          <input
            className="note-title-input"
            placeholder="Title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={100}
            required
          />

          <textarea
            placeholder="Ano thought process mo?..."
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={4}
            required
          />

          <div className="editor-actions">
            {editingId !== null && (
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setTitle("");
                  setContent("");
                  setEditingId(null);
                }}
              >
                Cancel
              </button>
            )}

            <button className="primary-button" type="submit">
              {editingId !== null ? "Save changes ✓" : "Pin this note +"}
            </button>
          </div>
        </form>
      </section>

      <section className="notes-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">YOUR COLLECTION</p>
          </div>

          <input
            className="search-input"
            aria-label="Search notes"
            placeholder="⌕ Search pages..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {filteredNotes.length === 0 ? (
          <div className="empty-state paper">
            <span>✿</span>
            <h3>{search ? "No pages found." : "Your desk is still empty."}</h3>
            <p>
              {search
                ? "Try another search word."
                : "Write your first little note above."}
            </p>
          </div>
        ) : (
          <div className="notes-grid">
            {filteredNotes.map((note) => (
              <article
                className={`note-card note-color-${note.color}`}
                key={note.id}
              >
                <span className="pin">✦</span>
                <p className="note-label">
                  PAGE / {String(note.id).slice(-4)}
                </p>
                <h3>{note.title}</h3>
                <p className="note-content">{note.content}</p>

                <div className="note-actions">
                  <button type="button" onClick={() => editNote(note)}>
                    Edit ✎
                  </button>
                  <button type="button" onClick={() => deleteNote(note.id)}>
                    Delete ×
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer className="notebook-footer">
        collected with care · little pages © 2026
      </footer>
    </main>
  );
}
