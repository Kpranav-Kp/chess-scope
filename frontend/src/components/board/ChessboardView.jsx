import { Chessboard } from "react-chessboard";

const CLASS_COLORS = {
  best: "rgba(0,200,0,0.35)",
  great: "rgba(0,200,0,0.35)",
  brilliant: "rgba(0,180,255,0.45)",
  good: "rgba(180,180,180,0.25)",
  inaccuracy: "rgba(255,200,0,0.3)",
  mistake: "rgba(255,120,0,0.35)",
  blunder: "rgba(255,0,0,0.45)",
};

function uciToSquare(uci) {
  return uci ? uci.slice(2, 4) : null;
}

export default function ChessboardView({ fen, uci, classification }) {
  // console.log("ChessboardView FEN:", fen);
  const square = uciToSquare(uci);

  const customSquareStyles =
    square && classification
      ? {
        [square]: {
          backgroundColor: CLASS_COLORS[classification],
        },
      }
      : {};

  return (
    <div style={{ width: "650px" }}>
      <Chessboard
        position={fen}
        arePiecesDraggable={true}
        animationDuration={300}
        customSquareStyles={customSquareStyles}
        customDarkSquareStyle={{ backgroundColor: "#779954" }}
        customLightSquareStyle={{ backgroundColor: "#e9edcc" }}
        customBoardStyle={{
          borderRadius: "4px",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
        }}
      />
    </div>
  );
}
