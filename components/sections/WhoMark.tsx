/**
 * Decorative line drawing of the name used in every locale, plus a short role stroke.
 * The greeting next to it carries the accessible name. Shapes morph only while motion is on.
 */
const NAME = [
  "M14 18 V66 H56",
  "M72 18 V46 C72 68 110 68 110 46 V18",
  "M126 18 V66",
  "M126 44 L164 18",
  "M126 44 L164 66",
  "M180 18 V66",
  "M180 18 H218",
  "M180 42 H210",
  "M180 66 H218",
];

export function WhoMark() {
  return (
    <div className="who-mark" aria-hidden="true">
      <span className="who-shape who-blue" />
      <span className="who-shape who-apricot" />
      <span className="who-shape who-coral" />
      <svg viewBox="0 0 280 96" className="who-glyph">
        {NAME.map((d, i) => (
          <path key={d} className="who-name" d={d} pathLength={1} style={{ animationDelay: `${0.12 + i * 0.07}s` }} />
        ))}
        <path className="who-role" d="M14 82 C78 74 150 92 218 78" pathLength={1} style={{ animationDelay: "0.9s" }} />
        <path className="who-role who-coral-stroke" d="M230 80 H264" pathLength={1} style={{ animationDelay: "1.15s" }} />
      </svg>
    </div>
  );
}
