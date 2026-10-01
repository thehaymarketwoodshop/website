'use client';

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import { gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/gsap';

const LenisContext = createContext<Lenis | null>(null);
export const useLenis = () => useContext(LenisContext);

// Working pages (admin tools, invoice signing) keep plain native scrolling.
const NATIVE_SCROLL_ROUTES = ['/admin', '/invoice'];

export function SmoothScroll({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();
  const first = useRef(true);
  const native = NATIVE_SCROLL_ROUTES.some((r) => pathname.startsWith(r));

  useEffect(() => {
    if (native || prefersReducedMotion()) return;
    const instance = new Lenis({
      lerp: 0.09,
      smoothWheel: true,
      wheelMultiplier: 0.9,
      anchors: { offset: -80 },
      // Let scrollable boxes (cart list, invoice agreement text) scroll themselves.
      allowNestedScroll: true,
    });
    instance.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    lenisRef.current = instance;
    setLenis(instance);
    return () => {
      gsap.ticker.remove(tick);
      instance.destroy();
      lenisRef.current = null;
      setLenis(null);
    };
  }, [native]);

  // New route: start at the top and re-measure every trigger.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const hash = window.location.hash;
    if (!hash) {
      lenisRef.current?.scrollTo(0, { immediate: true });
      window.scrollTo(0, 0);
    }
    const id = window.setTimeout(() => {
      ScrollTrigger.refresh();
      // Deep link (e.g. /woods#stains): land on the section once layout settles.
      const target = hash ? document.querySelector<HTMLElement>(hash) : null;
      if (target && lenisRef.current) lenisRef.current.scrollTo(target, { offset: -80, immediate: true });
      else target?.scrollIntoView();
    }, 120);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
