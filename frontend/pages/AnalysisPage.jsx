import { useEffect, useState } from "react";
import ChessboardView from "../components/board/ChessboardView";
import MoveList from "../components/analysis/MoveList";
import PlaybackControls from "../components/analysis/PlaybackControls";
import ExplanationPanel from "../components/analysis/ExplanationPanel";
import EvalBar from "../components/analysis/EvalBar";
import "./AnalysisPage.css";

function groupMoves(moves) {
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

function getGameIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const q = params.get("game");
  if (q && /^\d+$/.test(q)) return q;

  const parts = window.location.pathname.split("/").filter(Boolean);
  const last = parts[parts.length - 1];
  if (last && /^\d+$/.test(last)) return last;

  return "1";
}

export default function AnalysisPage() {
  const [plyIndex, setPlyIndex] = useState(0);
  const [moves, setMoves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const groupedMoves = groupMoves(moves);

  useEffect(() => {
    const gameId = getGameIdFromUrl();

    fetch(`http://localhost:8000/api/${gameId}/analysis/`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(`Request failed (${res.status})`);
          setMoves([]);
        } else {
          setMoves(data.moves || []);
        }
        setPlyIndex(0);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ color: "#aaa" }}>Loading analysis…</div>;
  if (error) return <div style={{ color: "#f66" }}>Error loading analysis: {error}</div>;
  if (!moves.length) return <div style={{ color: "#aaa" }}>No moves available</div>;

  const currentMove = moves[plyIndex];
  const evalPawnUnits = (currentMove.evaluation ?? 0) / 100;

  return (
    <div className="analysis-container">
      <EvalBar evalScore={evalPawnUnits} />

      <ChessboardView
        fen={currentMove.fen_after}
        classification={currentMove.classification}
        uci={currentMove.uci}
      />

      <div className="right-panel">
        <ExplanationPanel
          explanation={currentMove.explanation_available ? currentMove.explanation_type : null}
        />

        <div style={{ flex: 1, overflowY: "auto" }}>
          <MoveList moves={groupedMoves} currentPly={plyIndex} onSelect={setPlyIndex} />
        </div>

        <PlaybackControls
          currentIndex={plyIndex}
          maxIndex={moves.length - 1}
          onChange={setPlyIndex}
        />
      </div>
    </div>
  );
}
