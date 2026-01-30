import Link from 'next/link';
import { Button } from '@/components';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center px-6">
        <h1 className="text-8xl font-bold text-neutral-200">404</h1>
        <h2 className="mt-4 text-2xl font-semibold text-neutral-900">
          Page Not Found
        </h2>
        <p className="mt-2 text-neutral-600 max-w-md mx-auto">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button>Return Home</Button>
          </Link>
          <Link href="/gallery">
            <Button variant="secondary">Browse Gallery</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
