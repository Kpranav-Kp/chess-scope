import { Chessboard } from "react-chessboard";

export default function ChessboardView() {
  return (
    <div className="board-container">
      <Chessboard
        position="start"
        arePiecesDraggable={false}
        animationDuration={200}
      />
    </div>
  );
}