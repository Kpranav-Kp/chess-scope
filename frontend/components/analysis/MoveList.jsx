export default function MoveList({ moves, currentIndex, onSelect }) {
  return (
    <div>
      <h4>Moves</h4>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {moves.map((move, i) => (
          <li
            key={i}
            onClick={() => onSelect(i)}
            style={{
              cursor: "pointer",
              padding: "4px 8px",
              background: i === currentIndex ? "#ddd" : "transparent",
            }}
          >
            {i + 1}. {move.san} ({move.classification})
          </li>
        ))}
      </ul>
    </div>
  );
}
