// app/products/[slug]/page.tsx
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

type PageProps = { params: { slug: string } };

export default async function ProductDetailPage({ params }: PageProps) {
  // IMPORTANT:
  // Your route param is [slug], but this page is currently treating it like an ID.
  // If your URLs are /products/<product.id>, keep this as-is.
  // If your URLs are /products/<product.slug>, change `id` -> `slug` and query `.eq('slug', params.slug)`.
  const id = params.slug;

  const { data: product, error: prodErr } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
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

  const name = (product as any).name ?? "Product";
  const description = (product as any).description ?? "";

  // ✅ Editable fields from admin
  const materials = (product as any).materials ?? "";
  const dimensions = (product as any).dimensions ?? ""; // ✅ free text
  const weightText = (product as any).weight_text ?? "";
  const care = (product as any).care ?? "";

  const priceCents = (product as any).price_cents as number | null | undefined;
  const price = typeof priceCents === "number" ? priceCents / 100 : null;

  const buyUrl = ((product as any).buy_url ?? "") as string;

  // Image (multi first, fallback to single)
  const imageUrls = ((product as any).image_urls ?? []) as string[];
  const imageUrlSingle = ((product as any).image_url ?? "") as string;
  const finalImageUrl = (imageUrls[0] || imageUrlSingle || "") as string;

  return (
    <div className="min-h-screen pt-28 sm:pt-36 pb-16">
      <div className="container-wide">
        <div className="mb-6">
          <Link
            href="/products"
            className="text-sm text-neutral-600 hover:underline"
          >
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
            <h1 className="text-3xl sm:text-4xl font-semibold text-neutral-900">
              {name}
            </h1>

            {typeof price === "number" ? (
              <p className="mt-4 text-xl font-semibold text-neutral-900">
                ${price.toFixed(2)}
              </p>
            ) : null}

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

            {/* ✅ Order: Description → Materials → Dimensions → Weight → Care */}
            <div className="mt-8 space-y-8">
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">
                  Description
                </h2>
                <p className="mt-2 text-sm leading-6 text-neutral-700 whitespace-pre-line">
                  {description || "Description coming soon."}
                </p>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-neutral-900">
                  Materials Used
                </h2>
                <p className="mt-2 text-sm leading-6 text-neutral-700 whitespace-pre-line">
                  {materials || "Materials coming soon."}
                </p>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-neutral-900">
                  Dimensions
                </h2>
                <p className="mt-2 text-sm leading-6 text-neutral-700 whitespace-pre-line">
                  {dimensions || "Dimensions coming soon."}
                </p>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-neutral-900">Weight</h2>
                <p className="mt-2 text-sm leading-6 text-neutral-700 whitespace-pre-line">
                  {weightText || "Weight coming soon."}
                </p>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-neutral-900">
                  Care Instructions
                </h2>
                <p className="mt-2 text-sm leading-6 text-neutral-700 whitespace-pre-line">
                  {care || "Care instructions coming soon."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
