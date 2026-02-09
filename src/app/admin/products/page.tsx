'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Pencil, Trash2, Loader2, Check, X } from 'lucide-react';

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
  DbProduct,
  uploadProductImage,
} from '@/lib/supabaseClient';

import { cn } from '@/lib/utils';

type ProductFormData = {
  name: string;
  description: string;
  price: string; // USD string for input
  buy_url: string;
  image_url: string; // will be set from upload or manual URL
  size_label: string;
  weight_lbs: string;
  is_in_stock: boolean;
  wood_type_id: string;
  item_type_id: string;
};

const emptyFormData: ProductFormData = {
  name: '',
  description: '',
  price: '',
  buy_url: '',
  image_url: '',
  size_label: '',
  weight_lbs: '',
  is_in_stock: true,
  wood_type_id: '',
  item_type_id: '',
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
  const [error, setError] = useState('');

  // ✅ Image upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function checkAuth() {
    const admin = await checkIsAdmin();
    setIsAdmin(admin);
    if (admin) {
      await loadData();
    }
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

  function openCreateForm() {
    setFormData(emptyFormData);
    setEditingId(null);
    setIsFormOpen(true);
    setError('');

    // reset image state
    setImageFile(null);
    setImagePreview(null);
    setIsUploadingImage(false);
  }

  function openEditForm(product: DbProductWithRelations) {
    setFormData({
      name: product.name,
      description: product.description || '',
      price: (product.price_cents / 100).toFixed(2),
      buy_url: product.buy_url || '',
      image_url: product.image_url || '',
      size_label: product.size_label || '',
      weight_lbs: product.weight_lbs?.toString() || '',
      is_in_stock: product.is_in_stock,
      wood_type_id: product.wood_type_id || '',
      item_type_id: product.item_type_id || '',
    });

    setEditingId(product.id);
    setIsFormOpen(true);
    setError('');

    // reset image state (keep existing image_url as preview if no new file)
    setImageFile(null);
    setImagePreview(null);
    setIsUploadingImage(false);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData(emptyFormData);
    setError('');

    setImageFile(null);
    setImagePreview(null);
    setIsUploadingImage(false);
  }

  function handlePickImage(file: File) {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function uploadIfNeeded(): Promise<string | null> {
    if (!imageFile) return null;

    setIsUploadingImage(true);
    try {
      const url = await uploadProductImage(imageFile);
      return url;
    } finally {
      setIsUploadingImage(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      const priceInCents = Math.round(parseFloat(formData.price || '0') * 100);

      // ✅ If user selected a local image, upload and override image_url
      let finalImageUrl: string | null = formData.image_url || null;
      if (imageFile) {
        const uploadedUrl = await uploadIfNeeded();
        if (uploadedUrl) finalImageUrl = uploadedUrl;
      }

      const productData: Omit<DbProduct, 'id' | 'created_at' | 'updated_at'> = {
        name: formData.name,
        description: formData.description || null,
        price_cents: priceInCents,
        buy_url: formData.buy_url || null,
        image_url: finalImageUrl,
        size_label: formData.size_label || null,
        weight_lbs: formData.weight_lbs ? parseFloat(formData.weight_lbs) : null,
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
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await deleteProduct(id);
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete product');
    }
  }

  async function handleToggleStock(product: DbProductWithRelations) {
    try {
      await updateProduct(product.id, { is_in_stock: !product.is_in_stock });
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update stock status');
    }
  }

  const modalImageSrc = useMemo(() => {
    // Show selected file preview first, otherwise existing image_url
    return imagePreview || formData.image_url || '';
  }, [imagePreview, formData.image_url]);

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
          <h1 className="text-3xl font-semibold text-neutral-900 mb-4">Access Denied</h1>
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
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.image_url && (
                          <img
                            src={product.image_url}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover bg-neutral-100"
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
                    <td className="px-6 py-4 text-neutral-600">{product.item_types?.name || '—'}</td>
                    <td className="px-6 py-4 text-neutral-600">{product.wood_types?.name || '—'}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleStock(product)}
                        className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center transition-colors',
                          product.is_in_stock
                            ? 'bg-green-100 text-green-600 hover:bg-green-200'
                            : 'bg-red-100 text-red-600 hover:bg-red-200'
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
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Form Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={closeForm} />
            <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-neutral-100 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-neutral-900">
                  {editingId ? 'Edit Product' : 'Add Product'}
                </h2>
                <button onClick={closeForm} className="p-2 text-neutral-500 hover:text-neutral-900">
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
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Price (USD)</label>
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
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Weight (lbs)</label>
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
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Buy URL</label>
                  <input
                    type="url"
                    value={formData.buy_url}
                    onChange={(e) => setFormData({ ...formData, buy_url: e.target.value })}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    placeholder="https://etsy.com/..."
                  />
                </div>

                {/* ✅ NEW: Local upload + preview */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-neutral-700">Product Image</label>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handlePickImage(f);
                    }}
                    className="block w-full text-sm"
                  />

                  {modalImageSrc && (
                    <div className="flex items-center gap-4">
                      <img
                        src={modalImageSrc}
                        alt="Preview"
                        className="w-24 h-24 rounded-xl object-cover border border-neutral-200 bg-neutral-50"
                      />
                      <div className="text-sm text-neutral-600">
                        {isUploadingImage ? (
                          <span className="inline-flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" /> Uploading…
                          </span>
                        ) : imageFile ? (
                          <span>Selected: {imageFile.name}</span>
                        ) : formData.image_url ? (
                          <span>Using saved image URL</span>
                        ) : (
                          <span>No image yet</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Optional manual URL (still allowed) */}
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-2">
                      Or paste an Image URL (optional)
                    </label>
                    <input
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Size Label</label>
                  <input
                    type="text"
                    value={formData.size_label}
                    onChange={(e) => setFormData({ ...formData, size_label: e.target.value })}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    placeholder="e.g., Small, Medium, Large"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Wood Type</label>
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
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Item Type</label>
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
                    disabled={isSaving || isUploadingImage}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving || isUploadingImage}
                    className="flex-1 px-6 py-3 bg-neutral-900 text-white font-medium rounded-full hover:bg-neutral-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : editingId ? (
                      'Update Product'
                    ) : (
                      'Create Product'
                    )}
                  </button>
                </div>

                {imageFile && (
                  <p className="text-xs text-neutral-500">
                    Note: The selected image will upload when you click Save.
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
