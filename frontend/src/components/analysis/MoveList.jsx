import { useEffect, useRef } from "react";
import Panel from "../ui/Panel";

export default function MoveList({ moves, currentPly, onSelect }) {
  const activeRowRef = useRef(null);

  useEffect(() => {
    if (activeRowRef.current) {
      activeRowRef.current.scrollIntoView({
        block: "center",
        behavior: "smooth",
      });
    }
  }, [currentPly]);

  return (
    <Panel>
      <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            {moves.map((row, i) => {
              const whiteSelected = currentPly === row.whiteIndex;
              const blackSelected = currentPly === row.blackIndex;

              return (
                <tr key={i} ref={whiteSelected || blackSelected ? activeRowRef : null}>
                  <td style={{ width: "32px", color: "#888", padding: "8px" }}>
                    {row.move_number}.
                  </td>

                  <td
                    style={{
                      padding: "8px",
                      cursor: row.whiteIndex !== null ? "pointer" : "default",
                      background: whiteSelected ? "#444" : "transparent",
                      borderRadius: "4px",
                    }}
                    onClick={() => row.whiteIndex !== null && onSelect(row.whiteIndex)}
                  >
                    {row.white ? row.white.san || row.white.uci : ""}
                  </td>

                  <td
                    style={{
                      padding: "8px",
                      cursor: row.blackIndex !== null ? "pointer" : "default",
                      background: blackSelected ? "#444" : "transparent",
                      borderRadius: "4px",
                    }}
                    onClick={() => row.blackIndex !== null && onSelect(row.blackIndex)}
                  >
                    {row.black ? row.black.san || row.black.uci : ""}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
