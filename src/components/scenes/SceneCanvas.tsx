'use client';

import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '@/lib/gsap';
import { Renderer } from './engine';
import { SCENES, SceneName } from './scenes';
import { cn } from '@/lib/utils';

/**
 * Draws one furniture scene and plays it with the scroll. The animation runs
 * while the panel slides in and through the hold spacer that follows it, so
 * the panel stays on screen until the piece is finished.
 */
export function SceneCanvas({ name, label }: { name: SceneName; label: string }) {
  const svg = useRef<SVGSVGElement>(null);
  const shadow = useRef<SVGEllipseElement>(null);

  useEffect(() => {
    const el = svg.current;
    if (!el) return;
    const scene = SCENES[name];
    const r = new Renderer(el);
    const panel = el.closest('[data-panel]');
    const step = panel?.querySelector<HTMLElement>('[data-readout-step]');
    const bar = panel?.querySelector<HTMLElement>('[data-readout-bar]');

    const render = (p: number) => {
      const frame = scene.build(p);
      if (frame.shadow && shadow.current) r.shadow(shadow.current, frame.shadow.center, frame.shadow.rx, frame.shadow.rz, frame.cam, frame.shadow.strength);
      r.draw(frame.faces, frame.cam);
      if (bar) bar.style.transform = `scaleX(${p})`;
      if (step) {
        let k = 0;
        scene.stepAt.forEach((at, i) => p >= at && (k = i));
        if (step.textContent !== scene.steps[k]) step.textContent = scene.steps[k];
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
  }, [name]);

  return (
    <svg
      ref={svg}
      viewBox="0 0 1000 700"
      preserveAspectRatio="xMidYMid meet"
      className={cn(
        'absolute inset-0 h-full w-full',
        // soften the room's edge where it meets the text column
        SCENES[name].room === 'left' && '[mask-image:linear-gradient(to_right,transparent,black_22%)]',
        SCENES[name].room === 'right' && '[mask-image:linear-gradient(to_left,transparent,black_22%)]',
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
