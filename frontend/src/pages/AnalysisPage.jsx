import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ChessboardView from "../components/board/ChessboardView";
import MoveList from "../components/analysis/MoveList";
import PlaybackControls from "../components/analysis/PlaybackControls";
import ExplanationPanel from "../components/analysis/ExplanationPanel";
import EvalBar from "../components/analysis/EvalBar";
import AnalysisLoading from "../components/ui/AnalysisLoading";
import { useAuth } from "../context/AuthContext";
import { groupMoves } from "../utils/chessUtils";
import "./AnalysisPage.css";

export default function AnalysisPage() {
  const [searchParams] = useSearchParams();
  const gameId = searchParams.get("game");

  const [plyIndex, setPlyIndex] = useState(-1);
  const [moves, setMoves] = useState([]);
  const [loading, setLoading] = useState(!!gameId);
  const [error] = useState(gameId ? null : "No game ID specified");
  const { token } = useAuth();

  const groupedMoves = groupMoves(moves);

  useEffect(() => {
    if (!gameId || !token) return;

    const url = `http://localhost:8000/api/stream/${gameId}/?token=${token}`;
    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.moves && data.moves.length > 0) {
          setMoves(data.moves);
          setLoading(false);
          // If we were at start (-1) or loading, maybe stay at start?
          // Or if it's the first load, maybe go to -1?
          // Default is -1, so it stays at start.
          eventSource.close();
        }
      } catch (err) {
        console.error("Error parsing SSE data", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("EventSource failed:", err);
      if (eventSource.readyState === EventSource.CLOSED) {
        setLoading(false);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [gameId, token]);

  if (loading) return <AnalysisLoading />;
  if (error)
    return <div className="flex h-screen items-center justify-center text-red-500">{error}</div>;
  if (!moves.length)
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        No moves available
      </div>
    );

  const currentMove = plyIndex >= 0 ? moves[plyIndex] : null;
  const evalPawnUnits = (currentMove?.evaluation ?? 0) / 100;

  const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

  return (
    <div className="analysis-container">
      <EvalBar evalScore={evalPawnUnits} />

      <ChessboardView
        fen={currentMove?.fen_after || START_FEN}
        classification={currentMove?.classification}
        uci={currentMove?.uci}
      />

      <div className="right-panel">
        <ExplanationPanel
          explanation={currentMove?.explanation_available ? currentMove?.explanation_type : null}
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
