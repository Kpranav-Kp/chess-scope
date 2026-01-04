import { useState } from "react";
import ChessboardView from "../components/board/ChessboardView";
import MoveList from "../components/analysis/MoveList";
import PlaybackControls from "../components/analysis/PlaybackControls";
import ExplanationPanel from "../components/analysis/ExplanationPanel";

const MOCK_ANALYSIS = {
  moves: [
    {
      index: 0,
      san: "e4",
      fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
      classification: "best",
      explanation: null,
    },
    {
      index: 1,
      san: "e5",
      fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
      classification: "good",
      explanation: "Black mirrors White’s central control.",
    },
  ],
};

export default function AnalysisPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const moves = MOCK_ANALYSIS.moves;

  const currentMove = moves[currentIndex];

  return (
    <div style={{ display: "flex", gap: "24px", padding: "24px" }}>
      <ChessboardView fen={currentMove.fen} />
      <div style={{ width: "320px" }}>
        <ExplanationPanel move={currentMove} />
        <MoveList moves={moves} currentIndex={currentIndex} onSelect={setCurrentIndex} />
        <PlaybackControls
          currentIndex={currentIndex}
          maxIndex={moves.length - 1}
          onChange={setCurrentIndex}
        />
      </div>
    </div>
  );
}
