import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: { slug: string };
};

const BUCKET = 'products'; // change if your bucket name differs

export default async function ProductDetailPage({ params }: PageProps) {
  const idOrSlug = params.slug;

  const selectShape = `
    *,
    wood_types:wood_type ( id, name ),
    item_types:item_type ( id, name )
  `;

  // 1) Try by ID first (works with uuid links)
  let { data: product, error } = await supabase
    .from('products')
    .select(selectShape)
    .eq('id', idOrSlug)
    .maybeSingle();

  // 2) If not found, try by slug (only works if you add a `slug` column later)
  if (!product) {
    const res = await supabase
      .from('products')
      .select(selectShape)
      .eq('slug', idOrSlug)
      .maybeSingle();

    // If your table doesn't have `slug`, Supabase will return an error — we ignore it.
    if (res.data) product = res.data as any;
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

  const imagePath = (product as any).image_path as string | null | undefined;
  const imageUrl = imagePath
    ? supabase.storage.from(BUCKET).getPublicUrl(imagePath).data.publicUrl
    : '';

  const name = (product as any).name ?? 'Product';
  const price = (product as any).price;
  const soldOut = Boolean((product as any).sold_out ?? false);

  const woodName = (product as any).wood_types?.name ?? '';
  const itemName = (product as any).item_types?.name ?? '';

  const sizeIn =
    (product as any).size_in ??
    (product as any).size ??
    (product as any).dimensions ??
    '';

  const description = (product as any).description ?? '';
  const care = (product as any).care ?? '';
  const finish = (product as any).finish ?? '';
  const materials = (product as any).materials ?? '';

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
              {imageUrl ? (
                <img
                  src={imageUrl}
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
            <h1 className="text-3xl sm:text-4xl font-semibold text-neutral-900">
              {name}
            </h1>

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

              {soldOut ? (
                <span className="rounded-full bg-red-50 px-3 py-1 text-xs text-red-700">
                  Sold out
                </span>
              ) : (
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
                  In stock
                </span>
              )}
            </div>

            {typeof price === 'number' ? (
              <p className="mt-4 text-xl font-semibold text-neutral-900">
                ${price.toFixed(2)}
              </p>
            ) : null}

            <div className="mt-8">
              <h2 className="text-lg font-semibold text-neutral-900">Description</h2>
              <p className="mt-2 text-sm leading-6 text-neutral-700 whitespace-pre-line">
                {description || 'Description coming soon.'}
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-neutral-200 bg-white p-4">
                <p className="text-xs text-neutral-500">Item Type</p>
                <p className="mt-1 text-sm font-medium text-neutral-900">{itemName || '—'}</p>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-white p-4">
                <p className="text-xs text-neutral-500">Wood Type</p>
                <p className="mt-1 text-sm font-medium text-neutral-900">{woodName || '—'}</p>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-white p-4">
                <p className="text-xs text-neutral-500">Size (inches)</p>
                <p className="mt-1 text-sm font-medium text-neutral-900">{sizeIn || '—'}</p>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-white p-4">
                <p className="text-xs text-neutral-500">Finish</p>
                <p className="mt-1 text-sm font-medium text-neutral-900">{finish || '—'}</p>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-white p-4 sm:col-span-2">
                <p className="text-xs text-neutral-500">Materials</p>
                <p className="mt-1 text-sm font-medium text-neutral-900">{materials || '—'}</p>
              </div>
            </div>

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
