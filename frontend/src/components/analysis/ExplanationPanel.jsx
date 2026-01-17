import Panel from "../ui/Panel";

export default function ExplanationPanel({ explanation }) {
  return (
    <Panel>
      <strong>Explanation</strong>
      <p style={{ marginTop: "8px", color: "#ddd" }}>
        {explanation || "No explanation available."}
      </p>
    </Panel>
  );
}
