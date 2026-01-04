export default function ExplanationPanel({ move }) {
  if (!move.explanation) {
    return <p style={{ fontStyle: "italic" }}>No explanation</p>;
  }

  return (
    <div style={{ marginBottom: "12px" }}>
      <strong>Explanation</strong>
      <p>{move.explanation}</p>
    </div>
  );
}
