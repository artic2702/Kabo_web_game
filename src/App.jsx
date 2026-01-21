import Card from "./components/Card";

export default function App() {
  return (
    <div style={{ display: "flex", gap: "10px", padding: "20px" }}>
      <Card value={5} visible={true} />
      <Card value={"K"} visible={true} />
      <Card value={9} visible={false} />
      <Card value={"Q"} visible={false} />
    </div>
  );
}
