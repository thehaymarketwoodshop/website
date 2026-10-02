'use client';

import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '@/lib/gsap';
import { Renderer, bounds } from './engine';
import { SCENES, SceneName, SceneEnv } from './scenes';
import { cn } from '@/lib/utils';

// Room colours per panel tone, a shade off the panel so the room reads without a hard box.
const ROOMS: Record<'ivory' | 'bone' | 'espresso', SceneEnv> = {
  ivory: { wall: '#f0ebe3', floor: '#e8e1d6' },
  bone: { wall: '#e6dfd3', floor: '#ddd4c6' },
  espresso: { wall: '#241d18', floor: '#1d1713' },
};

type Props = {
  name: SceneName;
  label: string;
  tone: keyof typeof ROOMS;
  /** side of the canvas that meets the text column; a room fades out there (desktop only) */
  fade: 'left' | 'right';
};

const DESKTOP_VIEWBOX = '0 0 1000 700';

/**
 * Draws one furniture scene and plays it with the scroll. The animation runs
 * while the panel slides in and through the hold spacer that follows it, and
 * finishes early so the completed piece rests on screen.
 *
 * On phones the camera holds still at its final angle and the view is fitted
 * tightly to the piece, so it fills the space and only moving parts redraw.
 */
export function SceneCanvas({ name, label, tone, fade }: Props) {
  const svg = useRef<SVGSVGElement>(null);
  const shadow = useRef<SVGEllipseElement>(null);

  useEffect(() => {
    const el = svg.current;
    if (!el) return;
    const scene = SCENES[name];
    const env = ROOMS[tone];
    const r = new Renderer(el);
    const panel = el.closest('[data-panel]');
    const steps = panel ? Array.from(panel.querySelectorAll<HTMLElement>('[data-readout-step]')) : [];
    const bars = panel ? Array.from(panel.querySelectorAll<HTMLElement>('[data-readout-bar]')) : [];
    const compact = window.matchMedia('(max-width: 767px)').matches;

    // Phones: lock the camera to the finished view and frame the piece tightly.
    const finalFrame = scene.build(1, env);
    if (compact) {
      const [x0, y0, x1, y1] = bounds(finalFrame.faces, finalFrame.cam);
      const pad = Math.max(x1 - x0, y1 - y0) * 0.1;
      el.setAttribute('viewBox', `${(x0 - pad).toFixed(0)} ${(y0 - pad).toFixed(0)} ${(x1 - x0 + 2 * pad).toFixed(0)} ${(y1 - y0 + 2 * pad).toFixed(0)}`);
    } else {
      el.setAttribute('viewBox', DESKTOP_VIEWBOX);
    }

    let lastStep = '';
    const render = (p: number) => {
      const frame = scene.build(p, env);
      const cam = compact ? finalFrame.cam : frame.cam;
      if (frame.shadow && shadow.current) r.shadow(shadow.current, frame.shadow.center, frame.shadow.rx, frame.shadow.rz, cam, frame.shadow.strength);
      r.draw(frame.faces, cam);
      bars.forEach((b) => (b.style.transform = `scaleX(${p.toFixed(3)})`));
      let k = 0;
      scene.stepAt.forEach((at, i) => p >= at && (k = i));
      if (scene.steps[k] !== lastStep) {
        lastStep = scene.steps[k];
        steps.forEach((s) => (s.textContent = lastStep));
      }
    };

    if (prefersReducedMotion() || !panel) {
      render(1);
      return () => r.destroy();
    }
    render(0);
    const hold = panel.nextElementSibling as HTMLElement | null;
    const proxy = { p: 0 };
    const tween = gsap.to(proxy, {
      p: 1,
      ease: 'none',
      onUpdate: () => render(proxy.p),
      scrollTrigger: {
        trigger: hold ?? panel,
        start: () => `top bottom+=${Math.round(window.innerHeight * 0.45)}`,
        // finish well before the hold ends, so the completed piece rests on screen
        end: () => `bottom bottom+=${Math.round(window.innerHeight * 0.8)}`,
        scrub: 0.7,
      },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      r.destroy();
    };
  }, [name, tone]);

  return (
    <svg
      ref={svg}
      viewBox={DESKTOP_VIEWBOX}
      preserveAspectRatio="xMidYMid meet"
      className={cn(
        'absolute inset-x-0 top-0 bottom-9 h-[calc(100%-2.25rem)] w-full md:bottom-0 md:h-full',
        // phones: rooms fade out top and bottom instead of ending in a hard edge
        SCENES[name].room && 'max-md:[-webkit-mask-image:linear-gradient(to_bottom,transparent,black_14%,black_86%,transparent)] max-md:[mask-image:linear-gradient(to_bottom,transparent,black_14%,black_86%,transparent)]',
        // soften the room's edge where it meets the text column (side-by-side layouts only)
        SCENES[name].room && fade === 'left' && 'md:[-webkit-mask-image:linear-gradient(to_right,transparent,black_22%)] md:[mask-image:linear-gradient(to_right,transparent,black_22%)]',
        SCENES[name].room && fade === 'right' && 'md:[-webkit-mask-image:linear-gradient(to_left,transparent,black_22%)] md:[mask-image:linear-gradient(to_left,transparent,black_22%)]',
      )}
      role="img"
      aria-label={label}
    >
      <defs>
        <filter id={`soft-${name}`} x="-30%" y="-100%" width="160%" height="300%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>
      <ellipse ref={shadow} fill="#1a0f08" opacity="0" filter={`url(#soft-${name})`} />
    </svg>
  );
}
