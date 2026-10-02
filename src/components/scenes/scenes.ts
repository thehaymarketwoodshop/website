import { Face, Camera, V3, box, quad, transform, phase } from './engine';

export type SceneFrame = { faces: Face[]; cam: Camera; shadow?: { center: V3; rx: number; rz: number; strength: number } };
/** Room colours, matched to the panel the scene sits on. */
export type SceneEnv = { wall: string; floor: string };
export type SceneDef = {
  steps: string[];
  stepAt: number[];
  build: (p: number, env: SceneEnv) => SceneFrame;
  /** the scene draws a room whose edge should fade out toward the text column */
  room?: boolean;
};

const roomFaces = (env: SceneEnv, wallZ: number): Face[] => [
  quad([[-8, 0, wallZ], [8, 0, wallZ], [8, 0, 3], [-8, 0, 3]], [0, 1, 0], 'none', env.floor, { bg: true }),
  quad([[-8, 0, wallZ], [-8, 6, wallZ], [8, 6, wallZ], [8, 0, wallZ]], [0, 0, 1], 'none', env.wall, { bg: true }),
];

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

/* ───────────── Library: a three-bay walnut bookcase wall, built then installed ───────────── */

const BW = 2.4, BH = 2.3, BD = 0.36, BT = 0.026, WALL_Z = -0.42;
const BAYS = [-1.2, -0.4, 0.4];
const SHELVES = [0.55, 1.0, 1.45, 1.86];
const BOOKS = ['#6d3b2e', '#2f4a3a', '#c9b48f', '#3b4660', '#8a6a3c', '#d8cfc0', '#4b2e24'];

export const library: SceneDef = {
  room: true,
  steps: ['Uprights', 'Carcass', 'Shelves', 'Installed', 'Lit & styled'],
  stepAt: [0, 0.18, 0.3, 0.58, 0.8],
  build: (p, env) => {
    const install = phase(p, 0.6, 0.8);
    const zOff = 0.75 * (1 - install);
    const unitZ = WALL_Z + 0.005;
    const wal = (extra: object = {}) => ({ tex: 'walnut' as const, tile: 1.2, ...extra });
    const faces: Face[] = roomFaces(env, WALL_Z);

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
    // the back panel sits behind every shelf and upright, so it is always painted first
    faces.push(
      ...box({ at: [-1.2, 0.1, unitZ], size: [BW, BH - 0.2, 0.012], tex: 'walnut-dark', tile: 1.2, grain: 'y', offset: [0, 0, zOff - 0.5 * (1 - back)], opacity: back, glow: 0.2 * warm }).map((f) => ({ ...f, layer: -0.5 })),
    );

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

/* ───────────── Media wall: oak slat feature wall, floating console, floating shelves, TV ───────────── */

/** Light falling off from a rectangle: stacked, growing, fading quads in one plane. */
function softGlow(c: V3, w: number, h: number, plane: 'wall' | 'floor', color: string, strength: number, layer: number): Face[] {
  const rings = 10;
  return Array.from({ length: rings }, (_, i) => {
    const g = 1 + i * 0.09;
    const hw = (w / 2) * g + i * 0.018, hh = (h / 2) * g + i * 0.018;
    const pts: V3[] =
      plane === 'wall'
        ? [[c[0] - hw, c[1] - hh, c[2]], [c[0] + hw, c[1] - hh, c[2]], [c[0] + hw, c[1] + hh, c[2]], [c[0] - hw, c[1] + hh, c[2]]]
        : [[c[0] - hw, c[1], c[2] - hh], [c[0] + hw, c[1], c[2] - hh], [c[0] + hw, c[1], c[2] + hh], [c[0] - hw, c[1], c[2] + hh]];
    return quad(pts, plane === 'wall' ? [0, 0, 1] : [0, 1, 0], 'none', color, { opacity: (strength / rings) * 1.15, layer });
  });
}

const MW_Z = -0.3;
const SLATS = 17;
const SLAT_W = 0.06, SLAT_GAP = 0.045, SLAT_H = 2.6, SLAT_D = 0.03;
const SLAT_X0 = -((SLATS * SLAT_W + (SLATS - 1) * SLAT_GAP) / 2);
const SLAT_SPAN = SLATS * SLAT_W + (SLATS - 1) * SLAT_GAP;
const SHELF_W = 0.62, SHELF_GAP = 0.12;
// the floating console spans exactly from the outer edge of the left shelves to the outer edge of the right ones
const WALL_SPAN = SLAT_SPAN + 2 * (SHELF_GAP + SHELF_W);
const CON = { x: -WALL_SPAN / 2, w: WALL_SPAN, y: 0.26, h: 0.4, d: 0.42 };
const TV = { w: 1.45, h: 0.83, cy: 1.42 };
const SHELF_YS = [1.02, 1.42, 1.82];
const DECOR = ['#e7e0d4', '#b9a58a', '#3d3a36', '#8c5a3c', '#d6cfc3'];

export const mediaWall: SceneDef = {
  room: true,
  steps: ['Slat wall', 'Floating console', 'Floating shelves', 'TV mounted', 'Lit & styled'],
  stepAt: [0, 0.24, 0.42, 0.6, 0.76],
  build: (p, env) => {
    const faces: Face[] = roomFaces(env, MW_Z);
    const back = MW_Z + 0.004;

    // dark backer, then vertical white-oak slats rising one by one
    const backer = phase(p, 0, 0.06);
    const slatW = SLATS * SLAT_W + (SLATS - 1) * SLAT_GAP;
    faces.push(quad([[SLAT_X0, 0, back], [SLAT_X0 + slatW, 0, back], [SLAT_X0 + slatW, SLAT_H, back], [SLAT_X0, SLAT_H, back]], [0, 0, 1], 'none', '#1f1a16', { opacity: backer, layer: -0.6 }));
    for (let i = 0; i < SLATS; i++) {
      const mid = Math.abs(i - (SLATS - 1) / 2);
      const a = phase(p, 0.02 + mid * 0.018, 0.12 + mid * 0.018);
      faces.push(
        ...box({ at: [SLAT_X0 + i * (SLAT_W + SLAT_GAP), 0, back], size: [SLAT_W, SLAT_H, SLAT_D], tex: 'oak', grain: 'y', tile: 1.4, offset: [0, 0.7 * (1 - a), 0], opacity: a, skip: ['bottom', 'back'] }).map((f) => ({ ...f, layer: -0.5 })),
      );
    }

    // lights (painted early so the pieces sit in front of them)
    const lit = phase(p, 0.76, 0.9);
    // warm halo on the slats behind the TV, falling off softly
    faces.push(...softGlow([0, TV.cy, back + SLAT_D + 0.002], TV.w * 0.9, TV.h * 0.8, 'wall', '#ffcf8f', 0.55 * lit, -0.4));
    // glow pooling on the floor under the floating console
    faces.push(...softGlow([0, 0.002, back + CON.d * 0.6], CON.w * 0.8, CON.d * 0.5, 'floor', '#ffd59a', 0.6 * lit, -0.4));

    // floating console slides in and fixes to the wall
    const con = phase(p, 0.24, 0.44);
    const cOff: V3 = [0, 0, 0.9 * (1 - con)];
    faces.push(...box({ at: [CON.x, CON.y, back + SLAT_D], size: [CON.w, CON.h, CON.d], tex: 'walnut', tile: 1.6, offset: cOff, opacity: con }));
    // door seams across the front (handle-less push-to-open doors)
    for (let k = 1; k < 5; k++) {
      const x = CON.x + (CON.w / 5) * k;
      faces.push(...box({ at: [x - 0.003, CON.y + 0.02, back + SLAT_D + CON.d], size: [0.006, CON.h - 0.04, 0.003], tex: 'none', color: '#1a120c', offset: cOff, opacity: con, skip: ['back', 'bottom'] }).map((f) => ({ ...f, layer: 1 })));
    }
    // LED strip along the console's underside edge
    faces.push(quad([[CON.x + 0.06, CON.y - 0.004, back + SLAT_D + CON.d - 0.03], [CON.x + CON.w - 0.06, CON.y - 0.004, back + SLAT_D + CON.d - 0.03], [CON.x + CON.w - 0.06, CON.y + 0.006, back + SLAT_D + CON.d - 0.03], [CON.x + 0.06, CON.y + 0.006, back + SLAT_D + CON.d - 0.03]], [0, 0, 1], 'none', '#fff3dc', { opacity: lit, layer: 2 }));

    // floating shelves, no visible brackets, both sides of the slat wall
    const sideX = [SLAT_X0 - SHELF_GAP - SHELF_W, SLAT_X0 + slatW + SHELF_GAP];
    sideX.forEach((sx, side) =>
      SHELF_YS.forEach((y, k) => {
        const a = phase(p, 0.42 + (k * 2 + side) * 0.025, 0.54 + (k * 2 + side) * 0.025);
        const off: V3 = [0, 0, 0.5 * (1 - a)];
        faces.push(...box({ at: [sx, y, back], size: [SHELF_W, 0.05, 0.26], tex: 'walnut', tile: 1.0, offset: off, opacity: a }));
        faces.push(quad([[sx + 0.04, y - 0.01, back + 0.24], [sx + SHELF_W - 0.04, y - 0.01, back + 0.24], [sx + SHELF_W - 0.04, y - 0.002, back + 0.24], [sx + 0.04, y - 0.002, back + 0.24]], [0, 0, 1], 'none', '#fff3dc', { opacity: lit, layer: 2 }));
      }),
    );

    // TV lowered onto its mount
    const tv = phase(p, 0.6, 0.76);
    const tvOff: V3 = [0, 0.25 * (1 - tv), 0.35 * (1 - tv)];
    const tvZ = back + SLAT_D + 0.03;
    faces.push(
      ...box({ at: [-TV.w / 2, TV.cy - TV.h / 2, tvZ], size: [TV.w, TV.h, 0.035], tex: 'none', color: '#0c0d0f', offset: tvOff, opacity: tv }).map((f) => ({ ...f, layer: 1 })),
    );
    const on = phase(p, 0.82, 0.94);
    const inset = 0.012;
    faces.push(
      quad([[-TV.w / 2 + inset, TV.cy - TV.h / 2 + inset, tvZ + 0.036], [TV.w / 2 - inset, TV.cy - TV.h / 2 + inset, tvZ + 0.036], [TV.w / 2 - inset, TV.cy + TV.h / 2 - inset, tvZ + 0.036], [-TV.w / 2 + inset, TV.cy + TV.h / 2 - inset, tvZ + 0.036]], [0, 0, 1], 'none', '#1f2a3b', { opacity: 0.9 * on * tv, layer: 1.5 }),
      // soft diagonal glare across the glass
      quad([[-TV.w / 2 + inset, TV.cy + TV.h / 2 - inset, tvZ + 0.037], [-TV.w / 2 + 0.55, TV.cy + TV.h / 2 - inset, tvZ + 0.037], [-TV.w / 2 + 0.2, TV.cy - TV.h / 2 + inset, tvZ + 0.037], [-TV.w / 2 + inset, TV.cy - TV.h / 2 + inset, tvZ + 0.037]], [0, 0, 1], 'none', '#ffffff', { opacity: 0.06 * tv, layer: 1.6 }),
    );

    // decor appears last: ceramics and short book stacks
    const decor = phase(p, 0.86, 0.97);
    let n = 0;
    sideX.forEach((sx) =>
      SHELF_YS.forEach((y, k) => {
        const c = DECOR[(n++ * 2) % DECOR.length];
        if ((k + n) % 2 === 0) {
          faces.push(...box({ at: [sx + 0.12, y + 0.05, back + 0.07], size: [0.11, 0.18 + k * 0.03, 0.11], tex: 'none', color: c, opacity: decor, skip: ['bottom', 'back'] }).map((f) => ({ ...f, layer: 2 })));
        } else {
          [0, 1, 2].forEach((j) =>
            faces.push(...box({ at: [sx + 0.3, y + 0.05 + j * 0.035, back + 0.06], size: [0.22 - j * 0.02, 0.033, 0.16], tex: 'none', color: DECOR[(j + k) % DECOR.length], opacity: decor, skip: ['bottom', 'back'] }).map((f) => ({ ...f, layer: 2 }))),
          );
        }
      }),
    );

    return { faces, cam: { yaw: -0.32 + 0.12 * p, pitch: 0.12, scale: 180, cx: 500, cy: 612 } };
  },
};

export const SCENES = { dining, cabinetry, library, mediaWall };
export type SceneName = keyof typeof SCENES;
