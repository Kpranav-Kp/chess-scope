import Panel from "../ui/Panel";

export default function MoveList({ moves, currentIndex, onSelect }) {
  return (
    <Panel>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          {moves.map((move, i) => (
            <tr
              key={i}
              style={{
                background: i === currentIndex ? "#333" : "transparent",
                cursor: "pointer",
              }}
              onClick={() => onSelect(i)}
            >
              <td style={{ width: "32px", color: "#888" }}>{i + 1}.</td>
              <td style={{ paddingRight: "12px" }}>{move.white}</td>
              <td style={{ color: "#ccc" }}>{move.black || ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
}
