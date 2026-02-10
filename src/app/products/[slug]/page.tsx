import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

type PageProps = { params: { slug: string } };

// If your storage bucket is NOT named "products", change it here:
const BUCKET = 'products';

function isHttpUrl(v: string) {
  return v.startsWith('http://') || v.startsWith('https://');
}

export default async function ProductDetailPage({ params }: PageProps) {
  const id = params.slug;

  // 1) Get product
  const { data: product, error: prodErr } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (prodErr) {
    return (
      <div className="min-h-screen pt-28 sm:pt-36">
        <div className="container-wide">
          <h1 className="text-2xl font-semibold">Error loading product</h1>
          <pre className="mt-4 text-xs bg-neutral-50 p-4 rounded-xl overflow-auto">
{JSON.stringify(prodErr, null, 2)}
          </pre>
          <Link className="mt-6 inline-block text-sm underline" href="/products">
            Back to products
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-28 sm:pt-36">
        <div className="container-wide">
          <h1 className="text-2xl font-semibold">Product not found</h1>
          <p className="mt-2 text-neutral-600">
            This item may have been removed or the link is invalid.
          </p>
          <Link className="mt-6 inline-block text-sm underline" href="/products">
            Back to products
          </Link>
        </div>
      </div>
    );
  }

  // ---- Read the fields your ADMIN PAGE actually saves ----
  const name = (product as any).name ?? 'Product';
  const description = (product as any).description ?? '';
  const care = (product as any).care ?? '';

  // ✅ price from admin is price_cents
  const priceCents = (product as any).price_cents as number | null | undefined;
  const price = typeof priceCents === 'number' ? priceCents / 100 : null;

  // ✅ stock from admin is is_in_stock
  const isInStock = Boolean((product as any).is_in_stock ?? true);

  // ✅ buy link from admin is buy_url
  const buyUrl = ((product as any).buy_url ?? '') as string;

  // ✅ size stored as dimensions OR size_label, etc.
  const sizeIn =
    (product as any).dimensions ??
    (product as any).size_in ??
    (product as any).size ??
    (product as any).size_label ??
    '';

  // ✅ wood/item ids from admin are *_id
  const woodId = (product as any).wood_type_id ?? null;
  const itemId = (product as any).item_type_id ?? null;

  // 2) Resolve wood/item names (optional pills)
  const { data: woodRow } = woodId
    ? await supabase.from('wood_types').select('id, name').eq('id', woodId).maybeSingle()
    : { data: null as any };

  const { data: itemRow } = itemId
    ? await supabase.from('item_types').select('id, name').eq('id', itemId).maybeSingle()
    : { data: null as any };

  const woodName = woodRow?.name ?? '';
  const itemName = itemRow?.name ?? '';

  // 3) Image handling
  // ✅ Admin saves image_url (sometimes a full URL, sometimes a storage path)
  const imageUrlRaw = ((product as any).image_url ?? '') as string;

  // You may also have legacy image_path — keep fallback
  const imagePathLegacy = ((product as any).image_path ?? '') as string;

  let finalImageUrl = '';

  if (imageUrlRaw) {
    // If it's already a full URL, use it
    if (isHttpUrl(imageUrlRaw)) {
      finalImageUrl = imageUrlRaw;
    } else {
      // Otherwise treat it as a storage path
      finalImageUrl = supabase.storage.from(BUCKET).getPublicUrl(imageUrlRaw).data.publicUrl;
    }
  } else if (imagePathLegacy) {
    finalImageUrl = supabase.storage.from(BUCKET).getPublicUrl(imagePathLegacy).data.publicUrl;
  }

  return (
    <div className="min-h-screen pt-28 sm:pt-36 pb-16">
      <div className="container-wide">
        <div className="mb-6">
          <Link href="/products" className="text-sm text-neutral-600 hover:underline">
            ← Back to products
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Image */}
          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
            <div className="aspect-[4/3] bg-neutral-100">
              {finalImageUrl ? (
                <img
                  src={finalImageUrl}
                  alt={name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-sm text-neutral-500">
                  No image yet
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold text-neutral-900">{name}</h1>

            {/* Optional pills */}
            <div className="mt-3 flex flex-wrap gap-2">
              {itemName ? (
                <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-700">
                  {itemName}
                </span>
              ) : null}

              {woodName ? (
                <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-700">
                  {woodName}
                </span>
              ) : null}

              {sizeIn ? (
                <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-700">
                  Size: {sizeIn}
                </span>
              ) : null}

              {isInStock ? (
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
                  In stock
                </span>
              ) : (
                <span className="rounded-full bg-red-50 px-3 py-1 text-xs text-red-700">
                  Sold out
                </span>
              )}
            </div>

            {typeof price === 'number' ? (
              <p className="mt-4 text-xl font-semibold text-neutral-900">${price.toFixed(2)}</p>
            ) : null}

            {/* ✅ Buy button (Etsy) */}
            {buyUrl ? (
              <div className="mt-6">
                <a
                  href={buyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-white hover:bg-neutral-800 transition-colors"
                >
                  Buy on Etsy
                </a>
              </div>
            ) : null}

            {/* Description */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-neutral-900">Description</h2>
              <p className="mt-2 text-sm leading-6 text-neutral-700 whitespace-pre-line">
                {description || 'Description coming soon.'}
              </p>
            </div>

            {/* Care Instructions */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-neutral-900">Care Instructions</h2>
              <p className="mt-2 text-sm leading-6 text-neutral-700 whitespace-pre-line">
                {care || 'Care instructions coming soon.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
