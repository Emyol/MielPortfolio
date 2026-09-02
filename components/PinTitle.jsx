export default function PinTitle({ id, children }) {
  const words = String(children).split(' ').filter(Boolean);

  return (
    <div className="field-pin-col" data-pin-title>
      <h2 id={id} className="field-pin-title">
        {words.map((word) => (
          <span key={word} className="field-pin-clip">
            <span className="field-pin-inner">{word}</span>
          </span>
        ))}
      </h2>
    </div>
  );
}
