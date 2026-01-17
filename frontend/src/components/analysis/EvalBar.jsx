export default function EvalBar({ evalScore }) {
  const clamped = Math.max(-5, Math.min(5, evalScore));

  const whitePercent = ((clamped + 5) / 10) * 100;

  return (
    <div
      style={{
        width: "20px",
        height: "650px",
        background: "#111",
        borderRadius: "6px",
        overflow: "hidden",
        display: "flex",
        alignItems: "flex-end",
      }}
    >
      <div
        style={{
          width: "100%",
          height: `${whitePercent}%`,
          background: "#eee",
          transition: "height 0.25s ease",
        }}
      />
    </div>
  );
}
