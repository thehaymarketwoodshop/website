'use client';

import { ElementType, useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '@/lib/gsap';
import { cn } from '@/lib/utils';

type Props = {
  /** Each entry renders as one masked line. Strings may include <em> via the `em` marker: "Kept for *generations.*" */
  lines: string[];
  as?: ElementType;
  className?: string;
  /** Play on mount (hero) instead of when scrolled into view. */
  immediate?: boolean;
  delay?: number;
};

function renderLine(line: string) {
  return line.split(/(\*[^*]+\*)/g).map((part, i) =>
    part.startsWith('*') ? <em key={i}>{part.slice(1, -1)}</em> : <span key={i}>{part}</span>,
  );
}

/** Headline whose lines rise out of a mask. Text stays real HTML for SEO and screen readers. */
export function RevealText({ lines, as: Tag = 'h2', className, immediate = false, delay = 0 }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const inner = el.querySelectorAll<HTMLElement>('[data-reveal-line] > span');
    if (prefersReducedMotion()) {
      gsap.set(inner, { yPercent: 0, y: 0 });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        inner,
        { yPercent: 105, y: 0 },
        {
          yPercent: 0,
          y: 0,
          duration: 1.3,
          ease: 'expo.out',
          stagger: 0.09,
          delay,
          scrollTrigger: immediate ? undefined : { trigger: el, start: 'top 85%', once: true },
        },
      );
    }, el);
    return () => ctx.revert();
  }, [immediate, delay]);

  return (
    <Tag ref={ref} className={cn(className)}>
      {lines.map((line, i) => (
        <span key={i} data-reveal-line="">
          <span>{renderLine(line)}</span>
        </span>
      ))}
    </Tag>
  );
}
