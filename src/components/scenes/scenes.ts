import { Face, Camera, V3, box, quad, transform, phase } from './engine';

export type SceneFrame = { faces: Face[]; cam: Camera; shadow?: { center: V3; rx: number; rz: number; strength: number } };
export type SceneDef = { steps: string[]; stepAt: number[]; build: (p: number) => SceneFrame; /** the scene draws a room that should fade out toward the text column */ room?: 'left' | 'right' };

/* ───────────── Dining table: live-edge walnut slab on V-shaped sled bases ───────────── */

const L = 2.2, D = 0.95, H = 0.75, T = 0.055;
const wave = (x: number) => 0.035 * Math.sin(x * 2.3 + 0.4) + 0.018 * Math.sin(x * 6.1 + 1.3) + 0.01 * Math.sin(x * 13 + 2);

function slab(lift: number, twist: number, raw: number, sheen: number, opacity: number): Face[] {
  const N = 28;
  const back: V3[] = Array.from({ length: N + 1 }, (_, i) => {
    const x = -L / 2 + (i / N) * L;
    return [x, H, -D / 2 + wave(x)];
  });
  const extra = { raw, sheen, opacity };
  const faces: Face[] = [];
  // top: straight front edge, natural back edge
  faces.push({
    pts: [[-L / 2, H, D / 2], [L / 2, H, D / 2], ...back.slice().reverse()],
    normal: [0, 1, 0], tex: 'walnut', color: '#5c3d26', u: [1, 0, 0], v: [0, 0, 1], origin: [-L / 2, H, -D / 2], tile: 1.5, ...extra,
  });
  // front edge
  faces.push(quad([[-L / 2, H - T, D / 2], [L / 2, H - T, D / 2], [L / 2, H, D / 2], [-L / 2, H, D / 2]], [0, 0, 1], 'walnut', '#4a3020', { tile: 1.5, ...extra }));
  // ends (end grain)
  for (const s of [-1, 1]) {
    const x = (s * L) / 2;
    const zb = -D / 2 + wave(x);
    faces.push(quad([[x, H - T, zb], [x, H - T, D / 2], [x, H, D / 2], [x, H, zb]], [s, 0, 0], 'walnut-dark', '#3a2616', { tile: 0.3, ...extra }));
  }
  // live edge strip, slightly paler like sapwood under oil
  for (let i = 0; i < N; i++) {
    const a = back[i], b = back[i + 1];
    const n: V3 = [-(b[2] - a[2]), 0, -(b[0] - a[0])];
    const l = Math.hypot(n[0], n[2]) || 1;
    faces.push(quad([[b[0], H - T, b[2]], [a[0], H - T, a[2]], a, b], [n[0] / l, 0, n[2] / l], 'walnut', '#6b4a2d', { tile: 0.5, ...extra, raw: raw + 0.12 }));
  }
  return faces.map((f) => ({ ...transform(f, twist, [0, 0, 0], [0, lift, 0]), layer: 1 }));
}

function sledBase(s: number, drop: number, slide: number, raw: number, sheen: number, opacity: number): Face[] {
  const x0 = s * (L / 2 - 0.32);
  const zLeg = D / 2 - 0.13;
  const legH = H - T;
  const t = 0.07;
  const common = { tex: 'walnut' as const, raw, sheen, opacity, offset: [s * slide, drop, 0] as V3 };
  const faces: Face[] = [];
  for (const z of [-zLeg, zLeg]) faces.push(...box({ at: [x0 - t / 2, 0, z - t / 2], size: [t, legH, t], grain: 'y', tile: 0.8, skip: ['top', 'bottom'], ...common }));
  // rail under the top joining the two legs
  faces.push(...box({ at: [x0 - t / 2, legH - 0.075, -zLeg], size: [t, 0.075, zLeg * 2], grain: 'z', tile: 0.8, skip: ['top'], ...common }));
  // V runner on the floor: feet → apex pointing toward the table centre
  const apex: V3 = [x0 - s * 0.34, 0, 0];
  for (const z of [-zLeg, zLeg]) {
    const dx = apex[0] - x0, dz = apex[2] - z;
    const len = Math.hypot(dx, dz);
    const cx = (x0 + apex[0]) / 2, cz = (z + apex[2]) / 2;
    faces.push(
      ...box({ at: [cx - len / 2, 0, cz - t / 2], size: [len, 0.065, t], grain: 'x', tile: 0.8, yaw: Math.atan2(-dz, dx), pivot: [cx, 0, cz], skip: ['bottom'], ...common }),
    );
  }
  return faces;
}

export const dining: SceneDef = {
  steps: ['Slab chosen', 'Base set', 'Top lowered', 'Oil finish'],
  stepAt: [0, 0.18, 0.45, 0.7],
  build: (p) => {
    const base = phase(p, 0.08, 0.42);
    const lower = phase(p, 0.42, 0.7);
    const finish = phase(p, 0.68, 0.95);
    const raw = 0.38 * (1 - finish);
    const faces = [
      ...slab(0.62 * (1 - lower), 0.18 * (1 - lower), raw, finish, 1),
      ...sledBase(-1, 0.55 * (1 - base), -0.25 * (1 - base), raw, finish, base),
      ...sledBase(1, 0.55 * (1 - base), 0.25 * (1 - base), raw, finish, base),
    ];
    return {
      faces,
      cam: { yaw: -0.68 + 0.32 * p, pitch: 0.48, scale: 300, cx: 500, cy: 470 },
      shadow: { center: [0, 0, 0], rx: L / 2 + 0.05, rz: D / 2 + 0.05, strength: 0.4 + 0.6 * lower },
    };
  },
};

/* ───────────── Cabinetry: three white-oak base cabinets with a walnut top ───────────── */

const CW = 0.6, CH = 0.72, CD = 0.56, KICK = 0.1, PT = 0.018;
const FRONT_Z = CD / 2;

function carcass(x0: number): Face[] {
  const z0 = -CD / 2;
  const ply = { tex: 'ply' as const, tile: 0.9 };
  return [
    ...box({ at: [x0, KICK, z0], size: [PT, CH, CD], grain: 'y', ...ply }),
    ...box({ at: [x0 + CW - PT, KICK, z0], size: [PT, CH, CD], grain: 'y', ...ply }),
    ...box({ at: [x0, KICK, z0], size: [CW, PT, CD], ...ply }),
    ...box({ at: [x0, KICK, z0], size: [CW, CH, 0.012], grain: 'y', ...ply }),
  ];
}

function door(x: number, y: number, w: number, h: number, hinge: 'left' | 'right', open: number): Face[] {
  const pivot: V3 = hinge === 'left' ? [x, y, FRONT_Z] : [x + w, y, FRONT_Z];
  const yaw = (hinge === 'left' ? -1 : 1) * open * 1.75;
  const handleX = hinge === 'left' ? x + w - 0.05 : x + 0.035;
  return [
    ...box({ at: [x, y, FRONT_Z], size: [w, h, 0.02], tex: 'oak', grain: 'y', tile: 0.9, yaw, pivot }),
    ...box({ at: [handleX, y + h - 0.2, FRONT_Z + 0.02], size: [0.015, 0.14, 0.02], tex: 'none', color: '#1d1916', yaw, pivot }),
  ];
}

function drawer(x: number, y: number, w: number, h: number, slide: number): Face[] {
  const off: V3 = [0, 0, slide * 0.4];
  const inner = 0.46;
  return [
    // drawer box: sides, bottom and back in plywood
    ...box({ at: [x + 0.03, y + 0.03, FRONT_Z - inner], size: [PT, h - 0.06, inner], tex: 'ply', offset: off }),
    ...box({ at: [x + w - 0.03 - PT, y + 0.03, FRONT_Z - inner], size: [PT, h - 0.06, inner], tex: 'ply', offset: off }),
    ...box({ at: [x + 0.03, y + 0.03, FRONT_Z - inner], size: [w - 0.06, PT, inner], tex: 'ply', offset: off }),
    ...box({ at: [x + 0.03, y + 0.03, FRONT_Z - inner], size: [w - 0.06, h - 0.06, PT], tex: 'ply', offset: off }),
    // front and pull
    ...box({ at: [x, y, FRONT_Z], size: [w, h, 0.02], tex: 'oak', tile: 0.9, offset: off }),
    ...box({ at: [x + w / 2 - 0.08, y + h - 0.06, FRONT_Z + 0.02], size: [0.16, 0.015, 0.02], tex: 'none', color: '#1d1916', offset: off }),
  ];
}

export const cabinetry: SceneDef = {
  steps: ['Doors closed', 'Doors open', 'Drawers out', 'Soft close'],
  stepAt: [0, 0.08, 0.32, 0.62],
  build: (p) => {
    const close = phase(p, 0.62, 0.9);
    const openA = phase(p, 0.06, 0.32) * (1 - close);
    const openB = phase(p, 0.12, 0.38) * (1 - close);
    const slides = [0, 1, 2].map((k) => phase(p, 0.3 + k * 0.07, 0.52 + k * 0.07) * (1 - close));
    const xs = [-0.9, -0.3, 0.3];
    const g = 0.003;
    const faces: Face[] = [
      // toe kick and countertop
      ...box({ at: [-0.9 + 0.02, 0, -CD / 2], size: [1.8 - 0.04, KICK, CD - 0.06], tex: 'none', color: '#2a211b', skip: ['bottom'] }),
      ...box({ at: [-0.93, KICK + CH, -CD / 2 - 0.01], size: [1.86, 0.04, CD + 0.06], tex: 'walnut', tile: 1.4, sheen: 0.6, skip: ['bottom'] }),
      ...xs.flatMap(carcass),
      // shelves inside the door cabinets
      ...box({ at: [xs[0] + PT, KICK + 0.36, -CD / 2 + 0.02], size: [CW - 2 * PT, PT, CD - 0.06], tex: 'ply' }),
      ...box({ at: [xs[2] + PT, KICK + 0.36, -CD / 2 + 0.02], size: [CW - 2 * PT, PT, CD - 0.06], tex: 'ply' }),
      // left cabinet: one door, hinged left
      ...door(xs[0] + g, KICK + g, CW - 2 * g, CH - 2 * g, 'left', openA),
      // middle cabinet: three drawers
      ...drawer(xs[1] + g, KICK + g, CW - 2 * g, 0.27, slides[2]),
      ...drawer(xs[1] + g, KICK + 0.27 + 2 * g, CW - 2 * g, 0.24, slides[1]),
      ...drawer(xs[1] + g, KICK + 0.51 + 3 * g, CW - 2 * g, 0.2, slides[0]),
      // right cabinet: pair of doors hinged at the outside edges
      ...door(xs[2] + g, KICK + g, CW / 2 - 1.5 * g, CH - 2 * g, 'left', openB),
      ...door(xs[2] + CW / 2 + 0.5 * g, KICK + g, CW / 2 - 1.5 * g, CH - 2 * g, 'right', openB),
    ];
    return {
      faces,
      cam: { yaw: 0.52 - 0.18 * p, pitch: 0.36, scale: 390, cx: 500, cy: 520 },
      shadow: { center: [0, 0, 0.05], rx: 1.0, rz: 0.4, strength: 1 },
    };
  },
};

/* ───────────── Built-in: a three-bay walnut library wall, built then installed ───────────── */

const BW = 2.4, BH = 2.3, BD = 0.36, BT = 0.026, WALL_Z = -0.42;
const BAYS = [-1.2, -0.4, 0.4];
const SHELVES = [0.55, 1.0, 1.45, 1.86];
const BOOKS = ['#6d3b2e', '#2f4a3a', '#c9b48f', '#3b4660', '#8a6a3c', '#d8cfc0', '#4b2e24'];

export const builtIn: SceneDef = {
  room: 'left',
  steps: ['Uprights', 'Carcass', 'Shelves', 'Installed', 'Lit & styled'],
  stepAt: [0, 0.18, 0.3, 0.58, 0.8],
  build: (p) => {
    const install = phase(p, 0.6, 0.8);
    const zOff = 0.75 * (1 - install);
    const unitZ = WALL_Z + 0.005;
    const wal = (extra: object = {}) => ({ tex: 'walnut' as const, tile: 1.2, ...extra });
    const faces: Face[] = [
      // room: floor and wall
      quad([[-8, 0, WALL_Z], [8, 0, WALL_Z], [8, 0, 3], [-8, 0, 3]], [0, 1, 0], 'none', '#e8e1d6', { bg: true }),
      quad([[-8, 0, WALL_Z], [-8, 6, WALL_Z], [8, 6, WALL_Z], [8, 0, WALL_Z]], [0, 0, 1], 'none', '#f0ebe3', { bg: true }),
    ];

    // uprights rise one by one
    [-1.2, -0.4, 0.4, 1.2].forEach((x, i) => {
      const a = phase(p, 0.02 + i * 0.04, 0.16 + i * 0.04);
      faces.push(
        ...box({ at: [x - BT / 2, 0.1, unitZ], size: [BT, BH - 0.2, BD], grain: 'y', ...wal({ offset: [0, 0.9 * (1 - a), zOff], opacity: a }) }),
      );
    });
    // plinth, top and back
    const carc = phase(p, 0.18, 0.32);
    faces.push(
      ...box({ at: [-1.2, 0, unitZ], size: [BW, 0.1, BD], ...wal({ offset: [-0.6 * (1 - carc), 0, zOff], opacity: carc }) }),
      ...box({ at: [-1.2, BH - 0.1, unitZ], size: [BW, BT, BD], ...wal({ offset: [0.6 * (1 - carc), 0, zOff], opacity: carc }) }),
    );
    const back = phase(p, 0.48, 0.6);
    const warm = phase(p, 0.84, 0.97);
    faces.push(...box({ at: [-1.2, 0.1, unitZ], size: [BW, BH - 0.2, 0.012], tex: 'walnut-dark', tile: 1.2, grain: 'y', offset: [0, 0, zOff - 0.5 * (1 - back)], opacity: back, glow: 0.2 * warm }));

    // shelves drop in, bay by bay
    BAYS.forEach((bx, b) =>
      SHELVES.forEach((y, k) => {
        const a = phase(p, 0.3 + (b * 4 + k) * 0.012, 0.4 + (b * 4 + k) * 0.012);
        faces.push(...box({ at: [bx + BT / 2, y, unitZ + 0.012], size: [0.8 - BT, BT, BD - 0.02], ...wal({ offset: [0, 0.6 * (1 - a), zOff], opacity: a }) }));
      }),
    );

    // trim after install: crown and base
    const trim = phase(p, 0.8, 0.9);
    faces.push(
      ...box({ at: [-1.24, BH - 0.075, unitZ], size: [BW + 0.08, 0.075, BD + 0.04], ...wal({ offset: [0, 0.4 * (1 - trim), 0], opacity: trim }) }),
      ...box({ at: [-1.22, 0, unitZ + BD], size: [BW + 0.04, 0.1, 0.02], ...wal({ opacity: trim }) }),
    );

    // lights and books once it is in place
    const lit = phase(p, 0.84, 0.97);
    BAYS.forEach((bx) =>
      SHELVES.slice(1).forEach((y) => {
        // slim LED strip tucked under the shelf front, facing the room
        faces.push(quad([[bx + 0.05, y - 0.012, unitZ + BD - 0.035], [bx + 0.75, y - 0.012, unitZ + BD - 0.035], [bx + 0.75, y - 0.003, unitZ + BD - 0.035], [bx + 0.05, y - 0.003, unitZ + BD - 0.035]], [0, 0, 1], 'none', '#fff3dc', { opacity: lit, layer: 2 }));
      }),
    );
    let seed = 3;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    BAYS.forEach((bx, b) =>
      [SHELVES[0], SHELVES[2]].forEach((y, k) => {
        let x = bx + 0.08 + (b + k) * 0.05;
        const n = 5 + ((b + k) % 3);
        for (let i = 0; i < n; i++) {
          const w = 0.035 + rnd() * 0.03, h = 0.2 + rnd() * 0.1;
          faces.push(...box({ at: [x, y + BT, unitZ + 0.08], size: [w, h, 0.2], tex: 'none', color: BOOKS[(i + b * 2 + k) % BOOKS.length], opacity: lit, skip: ['bottom', 'back'] }).map((f) => ({ ...f, layer: 2 })));
          x += w + 0.004;
        }
      }),
    );

    return {
      faces,
      cam: { yaw: -0.36 + 0.12 * p, pitch: 0.2, scale: 225, cx: 500, cy: 640 },
    };
  },
};

export const SCENES = { dining, cabinetry, builtIn };
export type SceneName = keyof typeof SCENES;
