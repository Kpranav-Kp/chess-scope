export default function EvalBar({ evalScore }) {
  const clamped = Math.max(-5, Math.min(5, evalScore));
  const percent = 50 + clamped * 10;

  return (
    <div
      style={{
        width: "20px",          
        height: "650px",        
        background: "#000",
        borderRadius: "6px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: `${percent}%`,
          background: "#fff",
          transition: "height 0.2s ease",
        }}
      />
    </div>
  );
}
