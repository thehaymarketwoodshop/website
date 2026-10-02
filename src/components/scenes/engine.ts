/**
 * A tiny orthographic 3D renderer for SVG.
 *
 * Scenes are built from flat polygons ("faces") in metres, y up. Each face
 * carries a wood texture that is affine-mapped onto it, so the grain runs
 * along the real piece of timber at any angle. Faces are lit by one soft
 * key light and drawn back-to-front. That is all a furniture illustration
 * needs, and it keeps everything crisp, scalable and dependency-free.
 */

export type V3 = [number, number, number];

export type Tex = 'walnut' | 'walnut-dark' | 'oak' | 'maple' | 'ply' | 'none';

export type Face = {
  pts: V3[];
  normal: V3;
  tex: Tex;
  /** solid colour used for `tex: 'none'` (and under textures while they load) */
  color: string;
  /** world-space grain direction and the in-plane axis across it */
  u: V3;
  v: V3;
  origin: V3;
  /** world metres covered by one texture tile along the grain */
  tile: number;
  /** 0–1 pale wash (raw, unfinished wood) */
  raw?: number;
  /** 0–1 extra sheen (finish) */
  sheen?: number;
  /** 0–1 emissive warm glow (lights) */
  glow?: number;
  opacity?: number;
  /** room surfaces (floor, wall): always painted first, unlit */
  bg?: boolean;
  /** paint-order bucket: lower buckets are always drawn first (e.g. a base before the top it carries) */
  layer?: number;
};

export type Camera = { yaw: number; pitch: number; scale: number; cx: number; cy: number };

const TEX_URL: Record<Exclude<Tex, 'none'>, string> = {
  walnut: '/media/tex-walnut.jpg',
  'walnut-dark': '/media/tex-walnut-dark.jpg',
  oak: '/media/tex-oak.jpg',
  maple: '/media/tex-maple.jpg',
  ply: '/media/tex-maple.jpg',
};
const TEX_ASPECT = 1.6; // texture images are 1.6 : 1

/* ── vector helpers ── */
export const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const mul = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const norm = (a: V3): V3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
export const rotY = (p: V3, a: number, pivot: V3 = [0, 0, 0]): V3 => {
  const c = Math.cos(a), s = Math.sin(a);
  const x = p[0] - pivot[0], z = p[2] - pivot[2];
  return [pivot[0] + x * c + z * s, p[1], pivot[2] - x * s + z * c];
};
const rotYv = (v: V3, a: number): V3 => rotY(v, a);

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const smooth = (v: number) => {
  const t = clamp01(v);
  return t * t * (3 - 2 * t);
};
export const phase = (p: number, a: number, b: number) => smooth((p - a) / (b - a));

/* ── geometry builders ── */

type BoxOpts = {
  /** min corner and size, metres */
  at: V3;
  size: V3;
  tex: Tex;
  color?: string;
  /** axis the grain runs along */
  grain?: 'x' | 'y' | 'z';
  tile?: number;
  /** rotate the whole box about a vertical axis through `pivot` */
  yaw?: number;
  pivot?: V3;
  offset?: V3;
  raw?: number;
  sheen?: number;
  glow?: number;
  opacity?: number;
  /** skip faces that are never seen (saves work) */
  skip?: ('top' | 'bottom' | 'left' | 'right' | 'front' | 'back')[];
};

const AXES: Record<'x' | 'y' | 'z', V3> = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] };

export function box(o: BoxOpts): Face[] {
  const [x, y, z] = o.at;
  const [w, h, d] = o.size;
  const P = (i: number, j: number, k: number): V3 => [x + i * w, y + j * h, z + k * d];
  const grain = AXES[o.grain ?? 'x'];
  const defs: { key: NonNullable<BoxOpts['skip']>[number]; pts: V3[]; n: V3 }[] = [
    { key: 'top', pts: [P(0, 1, 0), P(1, 1, 0), P(1, 1, 1), P(0, 1, 1)], n: [0, 1, 0] },
    { key: 'bottom', pts: [P(0, 0, 0), P(0, 0, 1), P(1, 0, 1), P(1, 0, 0)], n: [0, -1, 0] },
    { key: 'front', pts: [P(0, 0, 1), P(0, 1, 1), P(1, 1, 1), P(1, 0, 1)], n: [0, 0, 1] },
    { key: 'back', pts: [P(0, 0, 0), P(1, 0, 0), P(1, 1, 0), P(0, 1, 0)], n: [0, 0, -1] },
    { key: 'left', pts: [P(0, 0, 0), P(0, 1, 0), P(0, 1, 1), P(0, 0, 1)], n: [-1, 0, 0] },
    { key: 'right', pts: [P(1, 0, 0), P(1, 0, 1), P(1, 1, 1), P(1, 1, 0)], n: [1, 0, 0] },
  ];
  return defs
    .filter((f) => !o.skip?.includes(f.key))
    .map((f) => {
      // grain axis projected into the face plane; fall back to the face's first edge
      let u = sub(grain, mul(f.n, dot(grain, f.n)));
      if (Math.hypot(...u) < 0.5) u = norm(sub(f.pts[1], f.pts[0]));
      u = norm(u);
      const v: V3 = norm([f.n[1] * u[2] - f.n[2] * u[1], f.n[2] * u[0] - f.n[0] * u[2], f.n[0] * u[1] - f.n[1] * u[0]]);
      return transform(
        { pts: f.pts, normal: f.n, tex: o.tex, color: o.color ?? '#6b4a2d', u, v, origin: P(0, 0, 0), tile: o.tile ?? 0.9, raw: o.raw, sheen: o.sheen, glow: o.glow, opacity: o.opacity },
        o.yaw ?? 0,
        o.pivot ?? [x + w / 2, y, z + d / 2],
        o.offset ?? [0, 0, 0],
      );
    });
}

/** Rotate (about a vertical axis) and translate a face. */
export function transform(f: Face, yaw: number, pivot: V3, offset: V3): Face {
  if (!yaw && !offset[0] && !offset[1] && !offset[2]) return f;
  const tp = (p: V3) => add(rotY(p, yaw, pivot), offset);
  return { ...f, pts: f.pts.map(tp), origin: tp(f.origin), normal: rotYv(f.normal, yaw), u: rotYv(f.u, yaw), v: rotYv(f.v, yaw) };
}

export function quad(pts: V3[], normal: V3, tex: Tex, color: string, extra: Partial<Face> = {}): Face {
  const u = norm(sub(pts[1], pts[0]));
  const n = normal;
  const v: V3 = norm([n[1] * u[2] - n[2] * u[1], n[2] * u[0] - n[0] * u[2], n[0] * u[1] - n[1] * u[0]]);
  return { pts, normal, tex, color, u, v, origin: pts[0], tile: 1, ...extra };
}

/* ── projection + drawing ── */

const LIGHT = norm([-0.45, 0.8, 0.55]);

function project(p: V3, cam: Camera): [number, number, number] {
  const cy = Math.cos(cam.yaw), sy = Math.sin(cam.yaw);
  const x1 = p[0] * cy + p[2] * sy;
  const z1 = -p[0] * sy + p[2] * cy;
  const cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);
  const y2 = p[1] * cp - z1 * sp;
  const z2 = p[1] * sp + z1 * cp;
  return [cam.cx + x1 * cam.scale, cam.cy - y2 * cam.scale, z2];
}

function viewNormalZ(n: V3, cam: Camera) {
  const z1 = -n[0] * Math.sin(cam.yaw) + n[2] * Math.cos(cam.yaw);
  return n[1] * Math.sin(cam.pitch) + z1 * Math.cos(cam.pitch);
}

const NS = 'http://www.w3.org/2000/svg';

/** Owns the SVG nodes for one scene and redraws them from a list of faces. */
export class Renderer {
  private defs: SVGDefsElement;
  private layer: SVGGElement;
  private pool: { pat: SVGPatternElement; img: SVGImageElement; tex: SVGPathElement; shade: SVGPathElement; fx: SVGPathElement }[] = [];
  private id = Math.random().toString(36).slice(2, 7);

  constructor(private svg: SVGSVGElement) {
    this.defs = document.createElementNS(NS, 'defs');
    this.layer = document.createElementNS(NS, 'g');
    svg.append(this.defs, this.layer);
  }

  private slot(i: number) {
    while (this.pool.length <= i) {
      const k = this.pool.length;
      const pat = document.createElementNS(NS, 'pattern');
      pat.setAttribute('id', `t${this.id}-${k}`);
      pat.setAttribute('patternUnits', 'userSpaceOnUse');
      pat.setAttribute('width', '1');
      pat.setAttribute('height', '1');
      const img = document.createElementNS(NS, 'image');
      img.setAttribute('width', '1');
      img.setAttribute('height', '1');
      img.setAttribute('preserveAspectRatio', 'none');
      pat.append(img);
      this.defs.append(pat);
      const tex = document.createElementNS(NS, 'path');
      const shade = document.createElementNS(NS, 'path');
      const fx = document.createElementNS(NS, 'path');
      tex.setAttribute('stroke-linejoin', 'round');
      shade.setAttribute('pointer-events', 'none');
      fx.setAttribute('pointer-events', 'none');
      this.layer.append(tex, shade, fx);
      this.pool.push({ pat, img, tex, shade, fx });
    }
    return this.pool[i];
  }

  draw(faces: Face[], cam: Camera) {
    const visible = faces
      .filter((f) => (f.opacity ?? 1) > 0.01 && viewNormalZ(f.normal, cam) > 0.0001)
      .map((f) => {
        const pr = f.pts.map((p) => project(p, cam));
        const depth = pr.reduce((s, p) => s + p[2], 0) / pr.length;
        return { f, pr, depth };
      })
      .sort((a, b) => {
        const la = a.f.bg ? -1 : a.f.layer ?? 0;
        const lb = b.f.bg ? -1 : b.f.layer ?? 0;
        return la !== lb ? la - lb : a.depth - b.depth;
      });

    // reorder DOM only when needed: append in paint order
    visible.forEach(({ f, pr }, i) => {
      const s = this.slot(i);
      const d = 'M' + pr.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('L') + 'Z';
      const op = String(f.opacity ?? 1);

      if (f.tex === 'none') {
        s.tex.setAttribute('fill', f.color);
      } else {
        // affine map of one texture tile onto the face
        const o = project(f.origin, cam);
        const pu = project(add(f.origin, mul(f.u, f.tile)), cam);
        const pv = project(add(f.origin, mul(f.v, f.tile / TEX_ASPECT)), cam);
        s.pat.setAttribute('patternTransform', `matrix(${pu[0] - o[0]} ${pu[1] - o[1]} ${pv[0] - o[0]} ${pv[1] - o[1]} ${o[0]} ${o[1]})`);
        const href = TEX_URL[f.tex];
        if (s.img.getAttribute('href') !== href) s.img.setAttribute('href', href);
        s.tex.setAttribute('fill', `url(#${s.pat.id})`);
      }
      s.tex.setAttribute('d', d);
      s.tex.setAttribute('opacity', op);
      s.tex.setAttribute('stroke', f.bg ? 'none' : 'rgba(30,18,10,0.35)');
      s.tex.setAttribute('stroke-width', '0.6');

      // light: darker when facing away from the key light; plywood/raw get a pale wash
      const lit = 0.55 + 0.45 * Math.max(0, dot(norm(f.normal), LIGHT));
      s.shade.setAttribute('d', d);
      s.shade.setAttribute('fill', '#140a04');
      s.shade.setAttribute('opacity', f.bg ? '0' : String((1 - lit) * 0.85 * (f.opacity ?? 1)));

      const raw = (f.raw ?? 0) + (f.tex === 'ply' ? 0.35 : 0);
      const glow = f.glow ?? 0;
      const sheen = f.sheen ?? 0;
      s.fx.setAttribute('d', d);
      if (glow > 0) {
        s.fx.setAttribute('fill', '#ffd9a0');
        s.fx.setAttribute('opacity', String(glow * (f.opacity ?? 1)));
      } else if (raw > 0) {
        s.fx.setAttribute('fill', '#f3e7d3');
        s.fx.setAttribute('opacity', String(Math.min(0.75, raw) * (f.opacity ?? 1)));
      } else if (sheen > 0) {
        s.fx.setAttribute('fill', '#fff4e6');
        s.fx.setAttribute('opacity', String(sheen * 0.16 * (f.opacity ?? 1)));
      } else {
        s.fx.setAttribute('opacity', '0');
      }

      // keep paint order: move to the end in sorted order
      this.layer.append(s.tex, s.shade, s.fx);
    });

    // hide unused slots
    for (let i = visible.length; i < this.pool.length; i++) {
      const s = this.pool[i];
      s.tex.setAttribute('d', '');
      s.shade.setAttribute('d', '');
      s.fx.setAttribute('d', '');
    }
  }

  /** soft contact shadow under an object, projected onto the floor */
  shadow(el: SVGEllipseElement, center: V3, rx: number, rz: number, cam: Camera, strength = 1) {
    const c = project(center, cam);
    const a = project(add(center, [rx, 0, 0]), cam);
    const b = project(add(center, [0, 0, rz]), cam);
    el.setAttribute('cx', c[0].toFixed(1));
    el.setAttribute('cy', c[1].toFixed(1));
    el.setAttribute('rx', Math.max(Math.hypot(a[0] - c[0], a[1] - c[1]), Math.hypot(b[0] - c[0], b[1] - c[1])).toFixed(1));
    el.setAttribute('ry', Math.max(4, Math.abs(b[1] - c[1]) + Math.abs(a[1] - c[1])).toFixed(1));
    el.setAttribute('opacity', String(0.16 * strength));
  }

  destroy() {
    this.defs.remove();
    this.layer.remove();
  }
}
