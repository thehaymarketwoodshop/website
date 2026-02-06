'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Pencil, Trash2, Loader2, Check, X } from 'lucide-react';
import {
  checkIsAdmin,
  fetchWoodTypes,
  fetchItemTypes,
  createWoodType,
  updateWoodType,
  deleteWoodType,
  createItemType,
  updateItemType,
  deleteItemType,
  DbWoodType,
  DbItemType,
} from '@/lib/supabaseClient';
import { cn } from '@/lib/utils';

type FilterType = 'wood' | 'item';

type FormData = {
  name: string;
  sort_order: string;
  is_active: boolean;
};

const emptyFormData: FormData = {
  name: '',
  sort_order: '0',
  is_active: true,
};

export default function AdminFiltersPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [woodTypes, setWoodTypes] = useState<DbWoodType[]>([]);
  const [itemTypes, setItemTypes] = useState<DbItemType[]>([]);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingType, setEditingType] = useState<FilterType>('wood');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyFormData);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    checkAuth();
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
    const [woodTypesData, itemTypesData] = await Promise.all([
      fetchWoodTypes(),
      fetchItemTypes(),
    ]);
    setWoodTypes(woodTypesData);
    setItemTypes(itemTypesData);
  }

  function openCreateForm(type: FilterType) {
    setFormData({
      ...emptyFormData,
      sort_order: type === 'wood' 
        ? String(woodTypes.length + 1) 
        : String(itemTypes.length + 1),
    });
    setEditingType(type);
    setEditingId(null);
    setIsFormOpen(true);
    setError('');
  }

  function openEditForm(type: FilterType, item: DbWoodType | DbItemType) {
    setFormData({
      name: item.name,
      sort_order: String(item.sort_order),
      is_active: item.is_active,
    });
    setEditingType(type);
    setEditingId(item.id);
    setIsFormOpen(true);
    setError('');
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData(emptyFormData);
    setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      const data = {
        name: formData.name,
        sort_order: parseInt(formData.sort_order) || 0,
        is_active: formData.is_active,
      };

      if (editingType === 'wood') {
        if (editingId) {
          await updateWoodType(editingId, data);
        } else {
          await createWoodType(data);
        }
      } else {
        if (editingId) {
          await updateItemType(editingId, data);
        } else {
          await createItemType(data);
        }
      }

      await loadData();
      closeForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(type: FilterType, id: string) {
    if (!confirm('Are you sure you want to delete this filter option?')) return;
    
    try {
      if (type === 'wood') {
        await deleteWoodType(id);
      } else {
        await deleteItemType(id);
      }
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    }
  }

  async function handleToggleActive(type: FilterType, item: DbWoodType | DbItemType) {
    try {
      if (type === 'wood') {
        await updateWoodType(item.id, { is_active: !item.is_active });
      } else {
        await updateItemType(item.id, { is_active: !item.is_active });
      }
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update');
    }
  }

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
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin" className="p-2 text-neutral-500 hover:text-neutral-900 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-semibold text-neutral-900">Manage Filters</h1>
        </div>

        <div className="space-y-12">
          {/* Wood Types */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-neutral-900">Wood Types</h2>
              <button
                onClick={() => openCreateForm('wood')}
                className="px-3 py-1.5 bg-neutral-900 text-white text-sm font-medium rounded-full hover:bg-neutral-800 transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
            <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-neutral-900">Name</th>
                    <th className="text-center px-4 py-3 text-sm font-semibold text-neutral-900">Order</th>
                    <th className="text-center px-4 py-3 text-sm font-semibold text-neutral-900">Active</th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-neutral-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {woodTypes.length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-neutral-500">No wood types</td></tr>
                  ) : woodTypes.map((item) => (
                    <tr key={item.id} className="hover:bg-neutral-50">
                      <td className="px-4 py-3 font-medium text-neutral-900">{item.name}</td>
                      <td className="px-4 py-3 text-center text-neutral-600">{item.sort_order}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleToggleActive('wood', item)}
                          className={cn(
                            'w-7 h-7 rounded-full flex items-center justify-center transition-colors',
                            item.is_active ? 'bg-green-100 text-green-600' : 'bg-neutral-100 text-neutral-400'
                          )}
                        >
                          {item.is_active ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => openEditForm('wood', item)} className="p-1.5 text-neutral-500 hover:text-neutral-900">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete('wood', item.id)} className="p-1.5 text-neutral-500 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Item Types */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-neutral-900">Item Types</h2>
              <button
                onClick={() => openCreateForm('item')}
                className="px-3 py-1.5 bg-neutral-900 text-white text-sm font-medium rounded-full hover:bg-neutral-800 transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
            <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-neutral-900">Name</th>
                    <th className="text-center px-4 py-3 text-sm font-semibold text-neutral-900">Order</th>
                    <th className="text-center px-4 py-3 text-sm font-semibold text-neutral-900">Active</th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-neutral-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {itemTypes.length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-neutral-500">No item types</td></tr>
                  ) : itemTypes.map((item) => (
                    <tr key={item.id} className="hover:bg-neutral-50">
                      <td className="px-4 py-3 font-medium text-neutral-900">{item.name}</td>
                      <td className="px-4 py-3 text-center text-neutral-600">{item.sort_order}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleToggleActive('item', item)}
                          className={cn(
                            'w-7 h-7 rounded-full flex items-center justify-center transition-colors',
                            item.is_active ? 'bg-green-100 text-green-600' : 'bg-neutral-100 text-neutral-400'
                          )}
                        >
                          {item.is_active ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => openEditForm('item', item)} className="p-1.5 text-neutral-500 hover:text-neutral-900">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete('item', item.id)} className="p-1.5 text-neutral-500 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Form Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={closeForm} />
            <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-4">
              <div className="border-b border-neutral-100 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-neutral-900">
                  {editingId ? 'Edit' : 'Add'} {editingType === 'wood' ? 'Wood Type' : 'Item Type'}
                </h2>
                <button onClick={closeForm} className="p-2 text-neutral-500 hover:text-neutral-900">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Sort Order</label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-5 h-5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                  />
                  <span className="font-medium text-neutral-900">Active</span>
                </label>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={closeForm} className="flex-1 px-6 py-3 bg-neutral-100 text-neutral-900 font-medium rounded-full hover:bg-neutral-200 transition-colors">Cancel</button>
                  <button type="submit" disabled={isSaving} className="flex-1 px-6 py-3 bg-neutral-900 text-white font-medium rounded-full hover:bg-neutral-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                    {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
