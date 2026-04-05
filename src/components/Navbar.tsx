'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/CartContext';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/woods', label: 'Our Woods' },
  { href: '/stain-samples', label: 'Stain Samples' },
  { href: '/products', label: 'Products' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { itemCount, openCart } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled
            ? 'backdrop-blur-xl border-b shadow-sm'
            : 'bg-transparent'
        )}
        style={isScrolled ? {
          backgroundColor: 'color-mix(in srgb, var(--color-ivory) 90%, transparent)',
          borderColor: 'var(--color-stone)',
        } : undefined}
      >
        <nav className="container-wide">
          <div className="flex items-center justify-between h-16 sm:h-20">

            {/* Logo — links to home */}
            <Link href="/" className="flex items-center gap-3 group flex-shrink-0" aria-label="The Haymarket Woodshop — Home">
              <div className="relative w-20 h-20 sm:w-[100px] sm:h-[100px] transition-transform duration-200 group-hover:scale-105 -my-3">
                <Image
                  src="/logo.png"
                  alt="The Haymarket Woodshop"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span
                className="hidden sm:block text-base font-semibold tracking-tight transition-colors duration-200"
                style={{ color: 'var(--color-charcoal)' }}
              >
                The Haymarket Woodshop
              </span>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.filter(l => l.href !== '/').map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-4 py-2 text-sm font-medium rounded-full transition-all duration-200',
                  )}
                  style={pathname === link.href ? {
                    backgroundColor: 'var(--color-walnut)',
                    color: 'white',
                  } : {
                    color: 'color-mix(in srgb, var(--color-charcoal) 65%, transparent)',
                  }}
                  onMouseEnter={e => {
                    if (pathname !== link.href) {
                      (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-ivory-dark)';
                      (e.currentTarget as HTMLElement).style.color = 'var(--color-charcoal)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (pathname !== link.href) {
                      (e.currentTarget as HTMLElement).style.backgroundColor = '';
                      (e.currentTarget as HTMLElement).style.color = 'color-mix(in srgb, var(--color-charcoal) 65%, transparent)';
                    }
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right side: cart + mobile menu */}
            <div className="flex items-center gap-1">
              {/* Cart */}
              <button
                onClick={openCart}
                className="relative p-2 rounded-full transition-colors duration-200"
                style={{ color: 'color-mix(in srgb, var(--color-charcoal) 65%, transparent)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-charcoal)'; (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-ivory-dark)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = ''; (e.currentTarget as HTMLElement).style.backgroundColor = ''; }}
                aria-label="Open cart"
              >
                <ShoppingBag size={22} />
                {itemCount > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 w-5 h-5 text-white text-xs font-bold rounded-full flex items-center justify-center leading-none"
                    style={{ backgroundColor: 'var(--color-walnut)' }}
                  >
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </button>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 -mr-1 rounded-full transition-colors duration-200"
                style={{ color: 'color-mix(in srgb, var(--color-charcoal) 65%, transparent)' }}
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            <div
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 bottom-0 w-72 shadow-2xl"
              style={{ backgroundColor: 'var(--color-ivory)' }}
            >
              {/* Mobile logo */}
              <div className="flex items-center gap-3 px-6 pt-6 pb-4" style={{ borderBottom: '1px solid var(--color-stone)' }}>
                <div className="relative w-14 h-14">
                  <Image src="/logo.png" alt="The Haymarket Woodshop" fill className="object-contain" />
                </div>
                <span className="text-sm font-semibold" style={{ color: 'var(--color-charcoal)' }}>
                  The Haymarket Woodshop
                </span>
              </div>

              <div className="flex flex-col px-4 py-4">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.07 }}
                  >
                    <Link
                      href={link.href}
                      className={cn(
                        'block px-4 py-3 my-0.5 text-base font-medium rounded-xl transition-colors duration-150',
                      )}
                      style={pathname === link.href ? {
                        backgroundColor: 'var(--color-walnut)',
                        color: 'white',
                      } : {
                        color: 'color-mix(in srgb, var(--color-charcoal) 70%, transparent)',
                      }}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
