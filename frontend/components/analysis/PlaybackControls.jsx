export default function PlaybackControls({ currentIndex, maxIndex, onChange }) {
  return (
    <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
      <button onClick={() => onChange(Math.max(0, currentIndex - 1))}>◀ Prev</button>
      <button onClick={() => onChange(Math.min(maxIndex, currentIndex + 1))}>Next ▶</button>
    </div>
  );
}
