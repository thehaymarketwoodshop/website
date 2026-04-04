'use client';

import { useState } from 'react';
import { ShoppingBag, Check, Loader2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface Variant {
  id: string;
  title: string;
  availableForSale: boolean;
  priceV2: { amount: string; currencyCode: string };
}

interface AddToCartButtonProps {
  variants: Variant[];
  /** If true, renders a compact version for the product card */
  compact?: boolean;
}

export function AddToCartButton({ variants, compact = false }: AddToCartButtonProps) {
  const { addToCart, isAdding } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState(variants[0]?.id ?? '');
  const [justAdded, setJustAdded] = useState(false);

  const selectedVariant = variants.find((v) => v.id === selectedVariantId) ?? variants[0];
  const hasMultipleVariants = variants.length > 1 && variants[0]?.title !== 'Default Title';

  const handleAdd = async () => {
    if (!selectedVariantId || !selectedVariant?.availableForSale) return;
    await addToCart(selectedVariantId);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  if (!selectedVariant) return null;

  return (
    <div className={compact ? '' : 'space-y-3'}>
      {/* Variant selector — only shown on detail page when multiple variants exist */}
      {!compact && hasMultipleVariants && (
        <div className="flex flex-wrap gap-2">
          {variants.map((v) => (
            <button
              key={v.id}
              onClick={() => setSelectedVariantId(v.id)}
              disabled={!v.availableForSale}
              className={[
                'px-4 py-2 text-sm font-medium rounded-full border transition-all',
                selectedVariantId === v.id
                  ? 'bg-brand-walnut text-white border-brand-walnut'
                  : 'bg-brand-ivory text-neutral-700 border-neutral-300 hover:border-brand-walnut',
                !v.availableForSale ? 'opacity-40 cursor-not-allowed line-through' : '',
              ].join(' ')}
            >
              {v.title}
            </button>
          ))}
        </div>
      )}

      {/* Add to Cart button */}
      {selectedVariant.availableForSale ? (
        <button
          onClick={handleAdd}
          disabled={isAdding || justAdded}
          className={[
            'flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-200',
            compact
              ? 'w-full px-4 py-2.5 text-sm'
              : 'w-full px-6 py-3.5 text-sm',
            justAdded
              ? 'bg-emerald-600 text-white'
              : 'bg-brand-walnut text-white hover:bg-brand-walnut-light',
            (isAdding || justAdded) ? 'cursor-not-allowed' : '',
          ].join(' ')}
        >
          {isAdding ? (
            <><Loader2 size={compact ? 14 : 16} className="animate-spin" /> Adding…</>
          ) : justAdded ? (
            <><Check size={compact ? 14 : 16} /> Added!</>
          ) : (
            <><ShoppingBag size={compact ? 14 : 16} /> Add to Cart</>
          )}
        </button>
      ) : (
        <button
          disabled
          className={[
            'flex items-center justify-center w-full font-medium rounded-full bg-neutral-100 text-neutral-400 cursor-not-allowed',
            compact ? 'px-4 py-2.5 text-sm' : 'px-6 py-3.5 text-sm',
          ].join(' ')}
        >
          Sold Out
        </button>
      )}
    </div>
  );
}
