'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

/* ─── Stain Data ─────────────────────────────────────────────────────────── */

type WoodType = 'Walnut' | 'Oak' | 'Maple';

interface StainOption {
  label: string;
  imagePath: string;
}

const stainData: Record<WoodType, StainOption[]> = {
  Walnut: [
    { label: 'Almond', imagePath: '/placeholders/walnutalmond.jpg' },
    { label: 'Pure', imagePath: '/placeholders/walnutpure.jpg' },
    { label: 'Walnut', imagePath: '/placeholders/walnutwalnut.jpg' },
  ],
  Oak: [
    { label: 'Honey', imagePath: '/placeholders/oakhoney.jpg' },
    { label: 'Pure', imagePath: '/placeholders/oakpure.jpg' },
    { label: 'Vanilla', imagePath: '/placeholders/oakvanilla.jpg' },
    { label: 'White', imagePath: '/placeholders/oakwhite.jpg' },
    { label: 'White 5%', imagePath: '/placeholders/oakwhite5.jpg' },
  ],
  Maple: [
    { label: 'Natural', imagePath: '/placeholders/maplenatural.jpg' },
    { label: 'White 5%', imagePath: '/placeholders/maplewhite5.jpg' },
  ],
};

const woodTypes: WoodType[] = ['Walnut', 'Oak', 'Maple'];

/* ─── Helper: Sort stains alphabetically ─────────────────────────────────── */

function getSortedStains(wood: WoodType): StainOption[] {
  return [...stainData[wood]].sort((a, b) => a.label.localeCompare(b.label));
}

/* ─── Page Component ─────────────────────────────────────────────────────── */

export default function StainSamplesPage() {
  const [selectedWood, setSelectedWood] = useState<WoodType>('Walnut');
  const [selectedStain, setSelectedStain] = useState<string>(() => {
    const sorted = getSortedStains('Walnut');
    return sorted[0]?.label ?? '';
  });
  const [imageError, setImageError] = useState(false);

  // Get sorted stains for current wood
  const sortedStains = useMemo(() => getSortedStains(selectedWood), [selectedWood]);

  // Get current image path
  const currentStainOption = sortedStains.find((s) => s.label === selectedStain);
  const currentImagePath = currentStainOption?.imagePath ?? '/placeholders/placeholder.jpg';

  // Handle wood change
  const handleWoodChange = (wood: WoodType) => {
    setSelectedWood(wood);
    setImageError(false);
    // Auto-select first stain alphabetically for the new wood
    const newSortedStains = getSortedStains(wood);
    setSelectedStain(newSortedStains[0]?.label ?? '');
  };

  // Handle stain change
  const handleStainChange = (stain: string) => {
    setSelectedStain(stain);
    setImageError(false);
  };

  return (
    <>
      {/* ━━ Page Header ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="pt-32 sm:pt-40 pb-10 sm:pb-14 bg-gradient-to-b from-woodshop-50 to-white">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
          <h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-neutral-900"
            style={{ fontFamily: 'var(--font-sf-display)', letterSpacing: '-0.025em' }}
          >
            Stain Samples
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-neutral-600 leading-relaxed max-w-2xl mx-auto">
            Preview how different stains look on each wood species.
          </p>
        </div>
      </section>

      {/* ━━ Stain Explorer ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
            {/* ─── LEFT: Selectors ─── */}
            <div className="lg:col-span-4 space-y-8">
              {/* Wood Selector */}
              <div>
                <label className="block text-xs font-semibold text-neutral-900 uppercase tracking-widest mb-3">
                  Wood Species
                </label>

                {/* Desktop: Segmented buttons */}
                <div className="hidden sm:flex p-1 bg-neutral-100 rounded-full">
                  {woodTypes.map((wood) => (
                    <button
                      key={wood}
                      onClick={() => handleWoodChange(wood)}
                      className={cn(
                        'flex-1 px-4 py-2.5 text-sm font-medium rounded-full transition-all duration-200',
                        'focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2',
                        selectedWood === wood
                          ? 'bg-neutral-900 text-white shadow-sm'
                          : 'text-neutral-600 hover:text-neutral-900'
                      )}
                    >
                      {wood}
                    </button>
                  ))}
                </div>

                {/* Mobile: Select dropdown */}
                <select
                  value={selectedWood}
                  onChange={(e) => handleWoodChange(e.target.value as WoodType)}
                  className="sm:hidden w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 font-medium focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                >
                  {woodTypes.map((wood) => (
                    <option key={wood} value={wood}>
                      {wood}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stain Selector */}
              <div>
                <label className="block text-xs font-semibold text-neutral-900 uppercase tracking-widest mb-3">
                  Stain Option
                </label>

                {/* Desktop & Tablet: Pill buttons */}
                <div className="hidden sm:flex flex-wrap gap-2">
                  {sortedStains.map((stain) => (
                    <button
                      key={stain.label}
                      onClick={() => handleStainChange(stain.label)}
                      className={cn(
                        'px-4 py-2 text-sm font-medium rounded-full border transition-all duration-200',
                        'focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2',
                        selectedStain === stain.label
                          ? 'bg-neutral-900 text-white border-neutral-900'
                          : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300 hover:text-neutral-900'
                      )}
                    >
                      {stain.label}
                    </button>
                  ))}
                </div>

                {/* Mobile: Select dropdown */}
                <select
                  value={selectedStain}
                  onChange={(e) => handleStainChange(e.target.value)}
                  className="sm:hidden w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 font-medium focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                >
                  {sortedStains.map((stain) => (
                    <option key={stain.label} value={stain.label}>
                      {stain.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Caption (desktop only - shown below selectors) */}
              <div className="hidden lg:block pt-4 border-t border-neutral-100">
                <p className="text-sm text-neutral-500">
                  Showing: <span className="text-neutral-900 font-medium">{selectedWood}</span> — <span className="text-neutral-900 font-medium">{selectedStain}</span>
                </p>
              </div>
            </div>

            {/* ─── RIGHT: Image Preview ─── */}
            <div className="lg:col-span-8">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl lg:rounded-3xl shadow-lg ring-1 ring-neutral-900/5 bg-neutral-100">
                {imageError ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-woodshop-100 to-woodshop-200">
                    <svg
                      className="w-16 h-16 text-woodshop-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="mt-3 text-sm text-woodshop-500">Preview unavailable</p>
                  </div>
                ) : (
                  <Image
                    key={currentImagePath}
                    src={currentImagePath}
                    alt={`${selectedWood} stain sample in ${selectedStain}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    className="object-cover"
                    onError={() => setImageError(true)}
                    priority
                  />
                )}
              </div>

              {/* Caption (mobile & tablet - shown below image) */}
              <div className="lg:hidden mt-4 text-center">
                <p className="text-sm text-neutral-500">
                  Showing: <span className="text-neutral-900 font-medium">{selectedWood}</span> — <span className="text-neutral-900 font-medium">{selectedStain}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
