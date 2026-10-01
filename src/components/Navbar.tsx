'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useLenis } from '@/components/motion/SmoothScroll';
import { brand, nav, secondaryNav, legalNav } from '@/content/site';
import { cn } from '@/lib/utils';

// Routes whose first screen is dark, so the bar starts in light type.
const DARK_HERO_ROUTES = ['/'];

function BagIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 8h14l-1.2 12H6.2z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const lenis = useLenis();
  const { itemCount, openCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastY = useRef(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Transparent at the top → solid after scroll → hides going down, returns going up.
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      setHidden(y > 240 && y > lastY.current + 2);
      if (y < lastY.current - 2) setHidden(false);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  // Menu: lock scroll, trap Escape, move focus in and back out.
  useEffect(() => {
    if (!menuOpen) return;
    const toggle = toggleRef.current;
    lenis?.stop();
    document.body.style.overflow = 'hidden';
    menuRef.current?.querySelector<HTMLElement>('a')?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      lenis?.start();
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
      toggle?.focus();
    };
  }, [menuOpen, lenis]);

  const onDark = DARK_HERO_ROUTES.includes(pathname) && !scrolled && !menuOpen;
  const light = onDark || menuOpen;

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-[transform,background-color,color,border-color] duration-700 ease-out-expo',
          hidden && !menuOpen ? '-translate-y-full' : 'translate-y-0',
          scrolled && !menuOpen ? 'border-b border-border bg-background/85 backdrop-blur-md' : 'border-b border-transparent bg-transparent',
          light ? 'text-on-dark' : 'text-foreground',
        )}
      >
        <div className="container-wide flex h-[72px] items-center justify-between gap-6 lg:h-[84px]">
          <Link href="/" className="t-label !tracking-[0.32em] font-medium" aria-label={`${brand.name} — home`}>
            <span className="hidden sm:inline">{brand.name}</span>
            <span className="sm:hidden">Haymarket</span>
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-9 lg:flex">
            {nav.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={pathname.startsWith(l.href) ? 'page' : undefined}
                className={cn('link-line text-[0.9rem] tracking-[0.04em]', pathname.startsWith(l.href) && 'after:!scale-x-100')}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={openCart}
              className="relative flex h-11 min-w-11 items-center justify-center gap-1.5 px-2"
              aria-label={`Open bag, ${itemCount} item${itemCount === 1 ? '' : 's'}`}
            >
              <BagIcon />
              {itemCount > 0 && <span className="text-xs tabular-nums">{itemCount > 9 ? '9+' : itemCount}</span>}
            </button>
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-controls="site-menu"
              className="flex h-11 items-center gap-3 pl-2 text-[0.9rem] tracking-[0.04em] lg:hidden"
            >
              <span>{menuOpen ? 'Close' : 'Menu'}</span>
              <span className="relative block h-[9px] w-[22px]" aria-hidden="true">
                <span className={cn('absolute right-0 top-0 h-px bg-current transition-all duration-500 ease-out-expo', menuOpen ? 'top-1 w-[22px] rotate-45' : 'w-[22px]')} />
                <span className={cn('absolute bottom-0 right-0 h-px bg-current transition-all duration-500 ease-out-expo', menuOpen ? 'bottom-1 w-[22px] -rotate-45' : 'w-4')} />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Full-screen mobile / tablet menu */}
      <div
        id="site-menu"
        ref={menuRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        hidden={!menuOpen}
        className={cn('on-dark grain grain-dark fixed inset-0 z-40 flex-col bg-surface-alt px-[var(--gutter)] pb-10 pt-28 text-on-dark lg:hidden', menuOpen ? 'flex' : 'hidden')}
      >
        <nav aria-label="Menu" className="relative z-[2] flex flex-col">
          {[...nav, ...secondaryNav].map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              className="font-serif text-[clamp(2.4rem,9vw,3.6rem)] font-light leading-[1.15] opacity-0 [animation:page-in_0.8s_cubic-bezier(0.16,1,0.3,1)_forwards]"
              style={{ animationDelay: `${80 + i * 55}ms` }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="relative z-[2] mt-auto flex flex-col gap-6 border-t border-white/15 pt-6">
          <div className="text-[0.95rem] leading-relaxed text-on-dark-muted">
            <p>{brand.location}</p>
            <a href={`mailto:${brand.email}`} className="text-on-dark">
              {brand.email}
            </a>
          </div>
          <div className="flex gap-6 text-sm text-on-dark-muted">
            {legalNav.map((l) => (
              <Link key={l.href} href={l.href}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
