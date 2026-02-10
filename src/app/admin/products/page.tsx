// app/admin/products/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Check,
  X,
  ImagePlus,
} from "lucide-react";

import {
  checkIsAdmin,
  fetchProducts,
  fetchWoodTypes,
  fetchItemTypes,
  createProduct,
  updateProduct,
  deleteProduct,
  DbProductWithRelations,
  DbWoodType,
  DbItemType,
  uploadProductImage,
} from "@/lib/supabaseClient";

import { cn } from "@/lib/utils";

type ProductFormData = {
  name: string;

  // Editable fields
  description: string;
  materials: string;

  // ✅ Dimensions stays FREE TEXT
  dimensions: string;

  weight_text: string;
  care: string;

  price: string; // USD string for input
  buy_url: string;

  // images
  image_url: string; // cover image (single) - set from image_urls[0]
  image_urls: string[]; // multiple images

  size_label: string;

  // optional numeric weight if you use it elsewhere
  weight_lbs: string;

  is_in_stock: boolean;
  wood_type_id: string;
  item_type_id: string;
};

const emptyFormData: ProductFormData = {
  name: "",

  description: "",
  materials: "",
  dimensions: "",
  weight_text: "",
  care: "",

  price: "",
  buy_url: "",

  image_url: "",
  image_urls: [],

  size_label: "",
  weight_lbs: "",

  is_in_stock: true,
  wood_type_id: "",
  item_type_id: "",
};

export default function AdminProductsPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [products, setProducts] = useState<DbProductWithRelations[]>([]);
  const [woodTypes, setWoodTypes] = useState<DbWoodType[]>([]);
  const [itemTypes, setItemTypes] = useState<DbItemType[]>([]);

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(emptyFormData);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // Multi-image upload state
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function checkAuth() {
    const admin = await checkIsAdmin();
    setIsAdmin(admin);
    if (admin) await loadData();
    setIsLoading(false);
  }

  async function loadData() {
    const [productsData, woodTypesData, itemTypesData] = await Promise.all([
      fetchProducts(),
      fetchWoodTypes(),
      fetchItemTypes(),
    ]);
    setProducts(productsData);
    setWoodTypes(woodTypesData);
    setItemTypes(itemTypesData);
  }

  function resetImageState() {
    setImageFiles([]);
    setImagePreviews([]);
    setIsUploadingImages(false);
  }

  function openCreateForm() {
    setFormData(emptyFormData);
    setEditingId(null);
    setIsFormOpen(true);
    setError("");
    resetImageState();
  }

  function openEditForm(product: DbProductWithRelations) {
    const existingImageUrls =
      ((product as any).image_urls as string[] | null | undefined) ?? [];

    const cover = (product as any).image_url || existingImageUrls[0] || "";

    setFormData({
      name: product.name,

      description: (product.description as any) || "",
      materials: ((product as any).materials as string) || "",
      dimensions: ((product as any).dimensions as string) || "",
      weight_text: ((product as any).weight_text as string) || "",
      care: ((product as any).care as string) || "",

      price: (product.price_cents / 100).toFixed(2),
      buy_url: (product.buy_url as any) || "",

      image_url: cover || "",
      image_urls:
        existingImageUrls.length > 0 ? existingImageUrls : cover ? [cover] : [],

      size_label: (product.size_label as any) || "",
      weight_lbs: product.weight_lbs?.toString() || "",

      is_in_stock: product.is_in_stock,
      wood_type_id: (product.wood_type_id as any) || "",
      item_type_id: (product.item_type_id as any) || "",
    });

    setEditingId(product.id);
    setIsFormOpen(true);
    setError("");
    resetImageState();
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData(emptyFormData);
    setError("");
    resetImageState();
  }

  function handlePickImages(files: FileList) {
    const arr = Array.from(files);
    setImageFiles(arr);
    setImagePreviews(arr.map((f) => URL.createObjectURL(f)));
  }

  async function uploadAllSelectedImages(): Promise<string[]> {
    if (imageFiles.length === 0) return [];

    setIsUploadingImages(true);
    try {
      const urls = await Promise.all(
        imageFiles.map((f) => uploadProductImage(f))
      );
      return (urls || []).filter(Boolean) as string[];
    } finally {
      setIsUploadingImages(false);
    }
  }

  function removeSavedImage(index: number) {
    const next = formData.image_urls.filter((_, i) => i !== index);
    const nextCover = next[0] || "";
    setFormData({
      ...formData,
      image_urls: next,
      image_url: nextCover,
    });
  }

  function setCoverImage(index: number) {
    const urls = [...formData.image_urls];
    const [picked] = urls.splice(index, 1);
    const reordered = [picked, ...urls].filter(Boolean);
    setFormData({
      ...formData,
      image_urls: reordered,
      image_url: reordered[0] || "",
    });
  }

  function addManualImageUrl(url: string) {
    const trimmed = url.trim();
    if (!trimmed) return;

    const next = Array.from(new Set([...(formData.image_urls || []), trimmed]));
    setFormData({
      ...formData,
      image_urls: next,
      image_url: next[0] || "",
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      const priceInCents = Math.round(parseFloat(formData.price || "0") * 100);

      // Upload selected images (if any)
      const uploadedUrls = await uploadAllSelectedImages();

      // Merge saved + uploaded
      const merged = Array.from(
        new Set([...(formData.image_urls || []), ...uploadedUrls].filter(Boolean))
      );

      // Ensure cover is first
      const cover = formData.image_url?.trim() || merged[0] || "";
      const normalized = cover
        ? [cover, ...merged.filter((u) => u !== cover)]
        : merged;

      const productData = {
        name: formData.name,

        description: formData.description || null,
        materials: formData.materials || null,

        // ✅ free text dimensions field saved to DB
        dimensions: formData.dimensions || null,

        weight_text: formData.weight_text || null,
        care: formData.care || null,

        price_cents: priceInCents,
        buy_url: formData.buy_url || null,

        // cover
        image_url: normalized[0] || null,
        // multiple
        image_urls: normalized,

        size_label: formData.size_label || null,
        weight_lbs: formData.weight_lbs
          ? parseFloat(formData.weight_lbs)
          : null,

        is_in_stock: formData.is_in_stock,
        wood_type_id: formData.wood_type_id || null,
        item_type_id: formData.item_type_id || null,
      };

      if (editingId) {
        await updateProduct(editingId, productData);
      } else {
        await createProduct(productData);
      }

      await loadData();
      closeForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await deleteProduct(id);
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete product");
    }
  }

  async function handleToggleStock(product: DbProductWithRelations) {
    try {
      await updateProduct(product.id, { is_in_stock: !product.is_in_stock });
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update stock status");
    }
  }

  const coverPreviewSrc = useMemo(() => {
    return formData.image_url || formData.image_urls[0] || "";
  }, [formData.image_url, formData.image_urls]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen pt-32 sm:pt-40 pb-20">
        <div className="max-w-md mx-auto px-6 text-center">
          <h1 className="text-3xl font-semibold text-neutral-900 mb-4">
            Access Denied
          </h1>
          <Link href="/admin" className="text-neutral-600 hover:text-neutral-900">
            Go to login →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 sm:pt-40 pb-20">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="p-2 text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-3xl font-semibold text-neutral-900">Products</h1>
          </div>
          <button
            onClick={openCreateForm}
            className="px-4 py-2 bg-neutral-900 text-white font-medium rounded-full hover:bg-neutral-800 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>

        {/* Products Table */}
        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-900">
                  Product
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-900">
                  Price
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-900">
                  Type
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-900">
                  Wood
                </th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-neutral-900">
                  In Stock
                </th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-neutral-900">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-100">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-neutral-500">
                    No products yet. Click &quot;Add Product&quot; to create one.
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const cover =
                    (product as any).image_url ||
                    ((product as any).image_urls?.[0] as string | undefined) ||
                    "";

                  return (
                    <tr key={product.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {cover && (
                            <img
                              src={cover}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover bg-neutral-100"
                              loading="lazy"
                            />
                          )}
                          <div>
                            <p className="font-medium text-neutral-900">{product.name}</p>
                            {product.size_label && (
                              <p className="text-sm text-neutral-500">{product.size_label}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-neutral-600">
                        ${(product.price_cents / 100).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-neutral-600">
                        {product.item_types?.name || "—"}
                      </td>
                      <td className="px-6 py-4 text-neutral-600">
                        {product.wood_types?.name || "—"}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleToggleStock(product)}
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                            product.is_in_stock
                              ? "bg-green-100 text-green-600 hover:bg-green-200"
                              : "bg-red-100 text-red-600 hover:bg-red-200"
                          )}
                        >
                          {product.is_in_stock ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditForm(product)}
                            className="p-2 text-neutral-500 hover:text-neutral-900 transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2 text-neutral-500 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Form Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={closeForm}
            />
            <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-neutral-100 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-neutral-900">
                  {editingId ? "Edit Product" : "Add Product"}
                </h2>
                <button
                  onClick={closeForm}
                  className="p-2 text-neutral-500 hover:text-neutral-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Materials Used
                  </label>
                  <textarea
                    rows={3}
                    value={formData.materials}
                    onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none"
                    placeholder="Example: Walnut + Maple, food-safe oil finish..."
                  />
                </div>

                {/* ✅ Dimensions is FREE TEXT input */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Dimensions
                    </label>
                    <input
                      type="text"
                      value={formData.dimensions}
                      onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                      placeholder='Example: 18" x 12" x 1.5"'
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Weight (text)
                    </label>
                    <input
                      type="text"
                      value={formData.weight_text}
                      onChange={(e) => setFormData({ ...formData, weight_text: e.target.value })}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                      placeholder="Example: ~3.5 lbs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Care Instructions
                  </label>
                  <textarea
                    rows={3}
                    value={formData.care}
                    onChange={(e) => setFormData({ ...formData, care: e.target.value })}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none"
                    placeholder="Example: Hand wash only. Re-oil monthly..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Price (USD)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Weight (lbs) (optional)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.weight_lbs}
                      onChange={(e) => setFormData({ ...formData, weight_lbs: e.target.value })}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                      placeholder="0.0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Buy URL (Etsy)
                  </label>
                  <input
                    type="url"
                    value={formData.buy_url}
                    onChange={(e) => setFormData({ ...formData, buy_url: e.target.value })}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    placeholder="https://etsy.com/..."
                  />
                </div>

                {/* Images */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-neutral-700">
                      Product Images
                    </label>
                    <span className="text-xs text-neutral-500">Cover image = first</span>
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      if (e.target.files) handlePickImages(e.target.files);
                    }}
                    className="block w-full text-sm"
                  />

                  {/* Selected previews */}
                  {imagePreviews.length > 0 && (
                    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                      <div className="flex items-center gap-2 text-sm text-neutral-700 mb-3">
                        <ImagePlus className="w-4 h-4" />
                        Selected images will upload when you Save.
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        {imagePreviews.map((src) => (
                          <img
                            key={src}
                            src={src}
                            alt=""
                            className="h-20 w-full object-cover rounded-lg border border-neutral-200 bg-white"
                            loading="lazy"
                          />
                        ))}
                      </div>
                      {isUploadingImages && (
                        <div className="mt-3 inline-flex items-center gap-2 text-sm text-neutral-600">
                          <Loader2 className="w-4 h-4 animate-spin" /> Uploading…
                        </div>
                      )}
                    </div>
                  )}

                  {/* Saved images */}
                  {formData.image_urls.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-neutral-700">Saved Images</p>
                      <div className="grid grid-cols-4 gap-3">
                        {formData.image_urls.map((url, idx) => (
                          <div key={`${url}-${idx}`} className="relative">
                            <img
                              src={url}
                              alt=""
                              className="h-20 w-full object-cover rounded-lg border border-neutral-200 bg-neutral-50"
                              loading="lazy"
                            />
                            {idx === 0 && (
                              <span className="absolute bottom-1 left-1 text-[10px] px-2 py-1 rounded bg-black/70 text-white">
                                Cover
                              </span>
                            )}

                            <div className="absolute top-1 right-1 flex gap-1">
                              {idx !== 0 && (
                                <button
                                  type="button"
                                  onClick={() => setCoverImage(idx)}
                                  className="text-[10px] px-2 py-1 rounded bg-black/70 text-white hover:bg-black"
                                  title="Set as cover"
                                >
                                  Cover
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => removeSavedImage(idx)}
                                className="text-[10px] px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                                title="Remove"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Manual URL add */}
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-2">
                      Add image by URL (optional)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        className="flex-1 px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                        placeholder="https://..."
                      />
                      <button
                        type="button"
                        onClick={() => addManualImageUrl(formData.image_url)}
                        className="px-4 py-3 rounded-xl bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800"
                      >
                        Add
                      </button>
                    </div>
                    {coverPreviewSrc ? (
                      <p className="mt-2 text-xs text-neutral-500">
                        Current cover: {coverPreviewSrc}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Size Label
                  </label>
                  <input
                    type="text"
                    value={formData.size_label}
                    onChange={(e) => setFormData({ ...formData, size_label: e.target.value })}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    placeholder='Example: 18" x 12"'
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Wood Type
                    </label>
                    <select
                      value={formData.wood_type_id}
                      onChange={(e) => setFormData({ ...formData, wood_type_id: e.target.value })}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    >
                      <option value="">Select wood type</option>
                      {woodTypes.map((wt) => (
                        <option key={wt.id} value={wt.id}>
                          {wt.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Item Type
                    </label>
                    <select
                      value={formData.item_type_id}
                      onChange={(e) => setFormData({ ...formData, item_type_id: e.target.value })}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    >
                      <option value="">Select item type</option>
                      {itemTypes.map((it) => (
                        <option key={it.id} value={it.id}>
                          {it.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_in_stock}
                      onChange={(e) => setFormData({ ...formData, is_in_stock: e.target.checked })}
                      className="w-5 h-5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                    />
                    <span className="font-medium text-neutral-900">In Stock</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="flex-1 px-6 py-3 bg-neutral-100 text-neutral-900 font-medium rounded-full hover:bg-neutral-200 transition-colors"
                    disabled={isSaving || isUploadingImages}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving || isUploadingImages}
                    className="flex-1 px-6 py-3 bg-neutral-900 text-white font-medium rounded-full hover:bg-neutral-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : editingId ? (
                      "Update Product"
                    ) : (
                      "Create Product"
                    )}
                  </button>
                </div>

                {imageFiles.length > 0 && (
                  <p className="text-xs text-neutral-500">
                    Note: Selected images will upload when you click Save.
                  </p>
                )}
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
