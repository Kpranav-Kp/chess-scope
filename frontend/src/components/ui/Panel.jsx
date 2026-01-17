export default function Panel({ children }) {
  return (
    <div
      style={{
        background: "rgba(28, 28, 28, 0.9)",
        borderRadius: "10px",
        padding: "14px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
      }}
    >
      {children}
    </div>
  );
}
