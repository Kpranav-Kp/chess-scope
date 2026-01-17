import Panel from "../ui/Panel";
import Button from "../ui/Button";

export default function PlaybackControls({ currentIndex, maxIndex, onChange }) {
  return (
    <Panel>
      <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
        <Button onClick={() => onChange(-1)}>⏮</Button>
        <Button onClick={() => onChange(Math.max(-1, currentIndex - 1))}>◀</Button>
        <Button onClick={() => onChange(Math.min(maxIndex, currentIndex + 1))}>▶</Button>
        <Button onClick={() => onChange(maxIndex)}>⏭</Button>
      </div>
    </Panel>
  );
}
