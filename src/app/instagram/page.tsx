import type { Metadata } from 'next';
import { Instagram } from 'lucide-react';
import { PageHero } from '@/components/ui/PageHero';
import { ArrowLink } from '@/components/ui/ArrowLink';
import { getFeaturedReels } from '@/lib/instagramMedia';
import { social } from '@/content/site';

export const revalidate = 60;

const instagram = social.find((s) => s.label === 'Instagram')!;

export const metadata: Metadata = {
  title: 'Instagram',
  description: 'Recent reels from the shop — follow along as new pieces are built.',
  openGraph: {
    title: 'Instagram | The Haymarket Woodshop',
    description: 'Recent reels from the shop — follow along as new pieces are built.',
  },
};

export default async function InstagramPage() {
  const reels = await getFeaturedReels(24).catch(() => []);

  return (
    <>
      <PageHero
        label="Instagram"
        lines={['From the shop,', '*as it happens.*']}
        lede={`Reels sync here automatically from ${instagram.handle} — the newest builds, finishes and process shots, straight from the bench.`}
      />

      <section aria-label="Recent reels" className="pb-[var(--section)]">
        <div className="container-wide">
          <div className="mb-10">
            <ArrowLink href={instagram.href}>Follow {instagram.handle} on Instagram</ArrowLink>
          </div>

          {reels.length === 0 ? (
            <div className="border-t border-border pt-10">
              <p className="t-lede max-w-xl">
                Reels will appear here shortly after they&apos;re posted. In the meantime, follow along on Instagram.
              </p>
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {reels.map((reel) => (
                <li key={reel.id}>
                  <a
                    href={reel.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative block aspect-[9/16] overflow-hidden bg-surface"
                  >
                    {reel.media_url && reel.media_type !== 'IMAGE' ? (
                      <video
                        src={reel.media_url}
                        poster={reel.thumbnail_url ?? undefined}
                        muted
                        loop
                        autoPlay
                        playsInline
                        preload="metadata"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={reel.thumbnail_url ?? reel.media_url ?? ''}
                        alt={reel.caption?.slice(0, 80) ?? 'Instagram post'}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}
                    <span className="absolute right-2 top-2 text-white drop-shadow">
                      <Instagram className="h-4 w-4" />
                    </span>
                    {reel.caption && (
                      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                        {reel.caption.slice(0, 90)}
                      </span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
