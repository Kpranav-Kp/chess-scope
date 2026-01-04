import { useState } from "react";
import ChessboardView from "../components/board/ChessboardView";
import MoveList from "../components/analysis/MoveList";
import PlaybackControls from "../components/analysis/PlaybackControls";
import ExplanationPanel from "../components/analysis/ExplanationPanel";
import EvalBar from "../components/analysis/EvalBar";
import "./AnalysisPage.css";

const MOVES = [
  {
    white: "e4",
    black: "e5",
    fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
    explanation: "Both sides fight for the center.",
    eval: 0.2,
  },
  {
    white: "Nf3",
    black: "Nc6",
    fen: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
    explanation: "Development with tempo.",
    eval: 0.4,
  },
];

export default function AnalysisPage() {
  const [index, setIndex] = useState(0);
  const move = MOVES[index];

  return (
    <div className="analysis-container">
      <EvalBar evalScore={move.eval} />
      <ChessboardView fen={move.fen} />

      <div className="right-panel">
        <ExplanationPanel explanation={move.explanation} />
        <MoveList moves={MOVES} currentIndex={index} onSelect={setIndex} />
        <PlaybackControls currentIndex={index} maxIndex={MOVES.length - 1} onChange={setIndex} />
      </div>
    </div>
  );
}
