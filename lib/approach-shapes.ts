const N = 96;
const C = 200;
const R = 132;

function shapePath(radius: (theta: number) => number, superN?: number) {
  const pts: string[] = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2 - Math.PI / 2;
    let x: number;
    let y: number;
    if (superN) {
      const c = Math.cos(a);
      const s = Math.sin(a);
      x = Math.sign(c) * Math.pow(Math.abs(c), 2 / superN) * R * 0.92;
      y = Math.sign(s) * Math.pow(Math.abs(s), 2 / superN) * R * 0.92;
    } else {
      const r = radius(a);
      x = Math.cos(a) * r;
      y = Math.sin(a) * r;
    }
    pts.push(`${(C + x).toFixed(2)},${(C + y).toFixed(2)}`);
  }
  return `M${pts.join("L")}Z`;
}

export const APPROACH_SHAPES = [
  shapePath(() => R, 4.2),
  shapePath((a) => R * (0.84 + 0.16 * Math.cos(4 * (a + Math.PI / 4)))),
  shapePath(() => R),
  shapePath((a) => R * (0.93 + 0.06 * Math.cos(10 * a))),
];
