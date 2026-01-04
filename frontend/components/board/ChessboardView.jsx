import { Chessboard } from "react-chessboard";

export default function ChessboardView({ fen }) {
  return (
    <div style={{ width: "650px" }}>
      <Chessboard position={fen} arePiecesDraggable={false} animationDuration={0} />
    </div>
  );
}
