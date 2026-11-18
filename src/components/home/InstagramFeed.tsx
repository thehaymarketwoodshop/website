import { Instagram } from 'lucide-react';
import { getFeaturedReels } from '@/lib/instagramMedia';
import { social } from '@/content/site';
import { RevealText } from '@/components/motion/RevealText';
import { ArrowLink } from '@/components/ui/ArrowLink';

const instagram = social.find((s) => s.label === 'Instagram');

export async function InstagramFeed() {
  const reels = await getFeaturedReels(6).catch(() => []);
  if (!instagram) return null;

  return (
    <section aria-labelledby="instagram-title" className="py-[var(--section)]">
      <div className="container-wide">
        <div className="mb-14 flex flex-col gap-6 md:mb-20 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="t-label mb-5 text-muted">On Instagram</p>
            <h2 id="instagram-title" className="sr-only">
              On Instagram
            </h2>
            <RevealText as="p" className="t-h2" lines={['Follow the process,', '*as it happens.*']} />
          </div>
          <ArrowLink href={instagram.href}>Follow {instagram.handle}</ArrowLink>
        </div>

        {reels.length === 0 ? (
          <div className="border-t border-border pt-10">
            <p className="t-lede max-w-xl">
              New reels from the shop land here automatically — follow along on Instagram in the meantime.
            </p>
            <div className="mt-6">
              <ArrowLink href={instagram.href}>Follow {instagram.handle}</ArrowLink>
            </div>
          </div>
        ) : (
          <>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
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
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-10">
              <ArrowLink href="/instagram">See more reels</ArrowLink>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
