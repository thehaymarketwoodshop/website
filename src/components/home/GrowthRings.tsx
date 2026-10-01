// Original line drawing of a tree cross-section, generated deterministically
// (same output on server and client). Each ring uses pathLength=1 so it can
// be "grown" with a stroke-dashoffset animation without measuring.

function rng(seed: number) {
  return () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
}

type Ring = { d: string; late: boolean; bark?: boolean };

function buildRings(): { rings: Ring[]; checks: string[] } {
  const r = rng(1907);
  const rings: Ring[] = [];
  let radius = 10;
  let cx = 0;
  let cy = 0;
  const base = [r() * 6.28, r() * 6.28, r() * 6.28];
  const STEPS = 120;
  const COUNT = 38;
  for (let i = 0; i < COUNT; i++) {
    radius += 7 + r() * 9 + (i > 26 ? 2 : 0);
    cx += 0.9; // eccentric growth: the pith sits off-center, like real timber
    cy -= 0.5;
    // neighbouring rings share a shape, drifting slowly outward
    const p = base.map((b, j) => b + i * 0.03 * (j + 1) + (r() - 0.5) * 0.35);
    const amp = 0.008 + i * 0.00025;
    const pts: [number, number][] = [];
    for (let s = 0; s < STEPS; s++) {
      const t = (s / STEPS) * Math.PI * 2;
      const k = 1 + amp * Math.sin(2 * t + p[0]) + amp * 0.7 * Math.sin(3 * t + p[1]) + amp * 0.25 * Math.sin(5 * t + p[2]);
      pts.push([cx + Math.cos(t) * radius * k * 1.04, cy + Math.sin(t) * radius * k]);
    }
    // smooth closed path through midpoints
    const mid = (a: [number, number], b: [number, number]) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const m0 = mid(pts[STEPS - 1], pts[0]);
    let d = `M${m0[0].toFixed(1)} ${m0[1].toFixed(1)}`;
    for (let s = 0; s < STEPS; s++) {
      const a = pts[s];
      const m = mid(a, pts[(s + 1) % STEPS]);
      d += `Q${a[0].toFixed(1)} ${a[1].toFixed(1)} ${m[0].toFixed(1)} ${m[1].toFixed(1)}`;
    }
    rings.push({ d: d + 'Z', late: i % 3 === 0, bark: i === COUNT - 1 });
  }
  // two drying checks radiating from the pith
  const checks = [0.6, 3.9].map((a) => {
    const len = 120 + r() * 140;
    return `M${(Math.cos(a) * 18).toFixed(1)} ${(Math.sin(a) * 18).toFixed(1)}L${(Math.cos(a + 0.03) * len).toFixed(1)} ${(Math.sin(a + 0.03) * len).toFixed(1)}`;
  });
  return { rings, checks };
}

const { rings, checks } = buildRings();

export function GrowthRings({ className }: { className?: string }) {
  return (
    <svg viewBox="-520 -520 1040 1040" className={className} fill="none" stroke="currentColor" aria-hidden="true">
      {rings.map((ring, i) => (
        <path
          key={i}
          d={ring.d}
          pathLength={1}
          data-ring=""
          strokeWidth={ring.bark ? 3.2 : ring.late ? 1.25 : 0.7}
          strokeOpacity={ring.bark ? 0.85 : ring.late ? 0.6 : 0.32}
        />
      ))}
      {checks.map((d, i) => (
        <path key={`c${i}`} d={d} pathLength={1} data-ring="" strokeWidth={0.8} strokeOpacity={0.45} />
      ))}
      <circle cx="0" cy="0" r="3" fill="currentColor" stroke="none" opacity="0.7" />
    </svg>
  );
}
