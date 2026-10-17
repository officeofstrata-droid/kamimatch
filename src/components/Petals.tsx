const PETALS = [
  { left: "4%", delay: "0s", dur: "15s", scale: 1 },
  { left: "18%", delay: "4s", dur: "19s", scale: 0.7 },
  { left: "31%", delay: "8s", dur: "13s", scale: 1.2 },
  { left: "45%", delay: "2s", dur: "21s", scale: 0.8 },
  { left: "58%", delay: "11s", dur: "17s", scale: 1 },
  { left: "69%", delay: "6s", dur: "14s", scale: 0.6 },
  { left: "80%", delay: "13s", dur: "20s", scale: 1.1 },
  { left: "92%", delay: "3s", dur: "16s", scale: 0.75 },
];

export function Petals() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {PETALS.map((p) => (
        <span
          key={p.left}
          className="petal"
          style={{ left: p.left, animationDelay: p.delay, animationDuration: p.dur, scale: String(p.scale) }}
        />
      ))}
    </div>
  );
}
