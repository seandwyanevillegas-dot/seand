function formatDate(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Just now";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default function NoteItem({ note, onEdit, onDelete }) {
  return (
    <article className="note-item">
      <div className="note-item-topline">
        <span className="note-date">{formatDate(note.createdAt)}</span>
        <span className="note-spark" aria-hidden="true">✳</span>
      </div>
      <h3>{note.title}</h3>
      <p className="note-description">{note.description}</p>
      <div className="note-actions">
        <button aria-label={`Edit ${note.title}`} onClick={() => onEdit(note)} type="button">
          <span aria-hidden="true">↗</span> Edit
        </button>
        <button
          aria-label={`Delete ${note.title}`}
          className="delete-action"
          onClick={() => onDelete(note.id)}
          type="button"
        >
          <span aria-hidden="true">×</span> Delete
        </button>
      </div>
    </article>
  );
}