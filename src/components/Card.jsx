export default function Card({ value, visible, onClick }) {
  return (
    <div className={`card ${visible ? "front" : "back"}`} onClick={onClick}>
      {visible ? value : ""}
    </div>
  );
}
