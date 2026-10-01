"use client";

import { useEffect, useRef, useState } from "react";
import NoteItem from "./NoteItem";

const STORAGE_KEY = "fieldnotes-notes";

export default function Home() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const titleInputRef = useRef(null);
  const normalizedTitle = title.trim().toLocaleLowerCase();
  const duplicateTitle = Boolean(
    normalizedTitle &&
      notes.some(
        (note) =>
          note.id !== editingId &&
          note.title.trim().toLocaleLowerCase() === normalizedTitle,
      ),
  );

  useEffect(() => {
    let isActive = true;
    Promise.resolve().then(() => {
      if (!isActive) return;
      try {
        const savedNotes = window.localStorage.getItem(STORAGE_KEY);
        if (savedNotes) {
          const parsedNotes = JSON.parse(savedNotes);
          if (Array.isArray(parsedNotes)) setNotes(parsedNotes);
        }
      } catch {
        // Ignore malformed or unavailable browser storage.
      }
      setIsLoaded(true);
    });
    return () => { isActive = false; };
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch {
      // Keep the notebook usable when browser storage is unavailable.
    }
  }, [isLoaded, notes]);

  useEffect(() => {
    titleInputRef.current?.setCustomValidity(
      duplicateTitle ? "You already have a note with this title." : "",
    );
  }, [duplicateTitle]);

  function resetForm() {
    setTitle("");
    setDescription("");
    setEditingId(null);
  }

  function handleSubmit(event) {
    event.preventDefault();
    const cleanTitle = title.trim();
    const cleanDescription = description.trim();
    if (!cleanTitle || !cleanDescription || duplicateTitle) return;

    if (editingId) {
      setNotes((currentNotes) =>
        currentNotes.map((note) =>
          note.id === editingId
            ? { ...note, title: cleanTitle, description: cleanDescription }
            : note,
        ),
      );
    } else {
      setNotes((currentNotes) => [
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          title: cleanTitle,
          description: cleanDescription,
          createdAt: new Date().toISOString(),
        },
        ...currentNotes,
      ]);
    }
    resetForm();
  }

  function startEditing(note) {
    setTitle(note.title);
    setDescription(note.description);
    setEditingId(note.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function deleteNote(id) {
    setNotes((currentNotes) => currentNotes.filter((note) => note.id !== id));
    if (editingId === id) resetForm();
  }

  return (
    <main className="notebook-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Playbook home">
          <span className="brand-mark" aria-hidden="true">P</span>
          <span>PLAYBOOK</span>
        </a>
        <div className="sync-status">
          <span className="status-dot" />
          Home team · Saved on this device
        </div>
      </header>

      <div className="workspace" id="top">
        <section className="intro">
          <p className="eyebrow">THE TEAM PLAYBOOK</p>
          <h1>Own the<br />next play.</h1>
          <p className="intro-copy">Drills, calls, and ideas worth bringing to the next game.</p>
          <div className="note-count">
            <span className="count-number">{notes.length.toString().padStart(2, "0")}</span>
            <span>{notes.length === 1 ? "play on the board" : "plays on the board"}</span>
          </div>
          <div className="intro-rule" />
          <p className="privacy-note"><span aria-hidden="true">✳</span> Your playbook stays on this device.</p>
        </section>

        <section className="editor-panel" aria-labelledby="editor-heading">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{editingId ? "UPDATE PLAY" : "NEW PLAY"}</p>
              <h2 id="editor-heading">{editingId ? "Edit the play" : "Draw up a play"}</h2>
            </div>
            {editingId && (
              <button className="text-button" type="button" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>

          <form className="note-form" onSubmit={handleSubmit}>
            <label htmlFor="note-title">Play name</label>
            <input
              id="note-title"
              maxLength={80}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Fast break set"
              required
              ref={titleInputRef}
              value={title}
            />
            {duplicateTitle && (
              <p className="field-hint" role="status">You already have a note with this title.</p>
            )}
            <label htmlFor="note-description">Details &amp; coaching notes</label>
            <textarea
              id="note-description"
              maxLength={2000}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Add the setup, key calls, or what to remember..."
              required
              rows={5}
              value={description}
            />
            <div className="form-footer">
              <span className="character-count">{description.length} / 2000</span>
              <button className="save-button" disabled={!isLoaded || duplicateTitle} type="submit">
                <span aria-hidden="true">{editingId ? "↗" : "+"}</span>
                {editingId ? "Save changes" : "Add to playbook"}
              </button>
            </div>
          </form>
        </section>

        <section className="notes-section" aria-labelledby="notes-heading">
          <div className="notes-heading-row">
            <div>
              <p className="eyebrow">THE PLAYBOOK</p>
              <h2 id="notes-heading">Game plan <span className="heading-count">{notes.length}</span></h2>
            </div>
            <span className="sort-label">LATEST PLAYS</span>
          </div>

          {!isLoaded ? (
            <div className="empty-state"><span className="empty-mark">···</span><p>Opening the playbook...</p></div>
          ) : notes.length ? (
            <div className="notes-grid">
              {notes.map((note, index) => (
                <NoteItem
                  key={note.id}
                  note={note}
                  onDelete={deleteNote}
                  onEdit={startEditing}
                  position={index}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-mark" aria-hidden="true">✳</span>
              <p>Your first play starts here.</p>
              <span>Add a play above to get the team started.</span>
            </div>
          )}
        </section>
      </div>
      <footer className="page-footer"><span>PLAYBOOK · 01</span><span>Prepared for the next game.</span></footer>
    </main>
  );
}
