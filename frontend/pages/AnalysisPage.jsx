import { useEffect, useState, useRef } from "react";
import ChessboardView from "../components/board/ChessboardView";
import MoveList from "../components/analysis/MoveList";
import PlaybackControls from "../components/analysis/PlaybackControls";
import ExplanationPanel from "../components/analysis/ExplanationPanel";
import EvalBar from "../components/analysis/EvalBar";
import AnalysisLoading from "../components/ui/AnalysisLoading";
import { useAuth } from "../context/AuthContext";
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
  return params.get("game");
}

export default function AnalysisPage() {
  const [plyIndex, setPlyIndex] = useState(0);
  const [moves, setMoves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();
  const pollInterval = useRef(null);

  const groupedMoves = groupMoves(moves);

  useEffect(() => {
    const gameId = getGameIdFromUrl();
    if (!gameId) {
      setError("No game ID specified");
      setLoading(false);
      return;
    }

    const fetchAnalysis = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/${gameId}/analysis/`, {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (res.status === 202) {
          setProcessing(true);
          return; // Keep polling
        }

        if (!res.ok) {
          if (res.status === 404) throw new Error("Game not found");
          throw new Error(`Request failed (${res.status})`);
        }

        const data = await res.json();
        setMoves(data.moves || []);
        setProcessing(false);
        setLoading(false);
        if (pollInterval.current) {
          clearInterval(pollInterval.current);
          pollInterval.current = null;
        }
      } catch (err) {
        setError(err.message);
        setLoading(false);
        if (pollInterval.current) {
          clearInterval(pollInterval.current);
        }
      }
    };

    // Initial fetch
    fetchAnalysis();

    // Poll if processing
    pollInterval.current = setInterval(fetchAnalysis, 2000);

    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
    }
  }, [token]);

  if (loading || processing) return <AnalysisLoading />;
  if (error) return <div className="flex h-screen items-center justify-center text-red-500">{error}</div>;
  if (!moves.length) return <div className="flex h-screen items-center justify-center text-gray-500">No moves available</div>;

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
