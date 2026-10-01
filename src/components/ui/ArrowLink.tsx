import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Arrow({ className }: { className?: string }) {
  return (
    <svg className={cn('arrow', className)} width="16" height="10" viewBox="0 0 16 10" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
      <path d="M0 5h15M11 1l4 4-4 4" />
    </svg>
  );
}

/** Quiet editorial link with an animated underline and arrow. */
export function ArrowLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Link href={href} className={cn('link-line link-line--hint text-[0.95rem] tracking-[0.02em]', className)}>
      <span>{children}</span>
      <Arrow />
    </Link>
  );
}

/** Two stacked copies of a label; hovering slides the second into place. */
export function SlideLabel({ children }: { children: string }) {
  return (
    <span className="slide-label">
      <span>{children}</span>
      <span aria-hidden="true">{children}</span>
    </span>
  );
}
