export function groupMoves(moves) {
  const grouped = {};

  moves.forEach((m, idx) => {
    const player = (m.player || "").toLowerCase();
    if (!grouped[m.move_number]) {
      grouped[m.move_number] = { move_number: m.move_number };
    }
    grouped[m.move_number][player] = m;
    if (player === "white") grouped[m.move_number].whiteIndex = idx;
    if (player === "black") grouped[m.move_number].blackIndex = idx;
  });

  return Object.values(grouped).sort((a, b) => a.move_number - b.move_number);
}
