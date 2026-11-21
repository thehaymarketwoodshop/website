'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Loader2, Copy, Check, Trash2, Send, FolderPlus, Pencil } from 'lucide-react';
import {
  checkIsAdmin,
  fetchInvoices,
  deleteInvoice,
  supabase,
  fetchInvoiceFolders,
  createInvoiceFolder,
  renameInvoiceFolder,
  deleteInvoiceFolder,
  moveInvoiceToFolder,
} from '@/lib/supabaseClient';
import { fmtCents } from '@/lib/invoiceMath';
import type { DbInvoice, DbInvoiceFolder, InvoiceStatus } from '@/types/invoice';
import { Button } from '@/components/Button';
import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<InvoiceStatus, string> = {
  draft: 'bg-neutral-100 text-neutral-600',
  sent: 'bg-blue-100 text-blue-700',
  viewed: 'bg-amber-100 text-amber-700',
  signed: 'bg-purple-100 text-purple-700',
  deposit_paid: 'bg-teal-100 text-teal-700',
  paid: 'bg-green-100 text-green-700',
  void: 'bg-red-100 text-red-700',
};

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  viewed: 'Viewed',
  signed: 'Signed',
  deposit_paid: 'Deposit Paid',
  paid: 'Paid',
  void: 'Void',
};

type ActiveFolder = 'all' | 'unsorted' | string;

export default function AdminInvoicesPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [invoices, setInvoices] = useState<DbInvoice[]>([]);
  const [folders, setFolders] = useState<DbInvoiceFolder[]>([]);
  const [activeFolder, setActiveFolder] = useState<ActiveFolder>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [grouping, setGrouping] = useState(false);
  const [groupError, setGroupError] = useState('');

  const [newFolderName, setNewFolderName] = useState('');
  const [addingFolder, setAddingFolder] = useState(false);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState('');

  useEffect(() => {
    (async () => {
      const admin = await checkIsAdmin();
      setIsAdmin(admin);
      if (admin) {
        // Folders can fail independently (e.g. its migration hasn't been run yet)
        // without blocking the invoice list itself from ever loading.
        const [inv, f] = await Promise.all([
          fetchInvoices().catch(() => []),
          fetchInvoiceFolders().catch(() => []),
        ]);
        setInvoices(inv);
        setFolders(f);
      }
      setIsLoading(false);
    })();
  }, []);

  function copyLink(inv: DbInvoice) {
    const url = `${window.location.origin}/invoice/${inv.public_token}`;
    navigator.clipboard.writeText(url);
    setCopiedId(inv.id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const selectedInvoices = useMemo(
    () => invoices.filter((inv) => selected.has(inv.id)),
    [invoices, selected]
  );

  const groupCanSend =
    selectedInvoices.length >= 2 &&
    selectedInvoices.every((inv) => inv.status === 'draft' && !inv.group_id && inv.buyer_email) &&
    selectedInvoices.every((inv) => inv.buyer_email === selectedInvoices[0].buyer_email);

  async function handleSendOptions() {
    setGroupError('');
    setGrouping(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/admin/invoice-groups/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ invoiceIds: Array.from(selected) }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to send options');
      setInvoices(await fetchInvoices());
      setSelected(new Set());
    } catch (err) {
      setGroupError(err instanceof Error ? err.message : 'Failed to send options');
    }
    setGrouping(false);
  }

  async function handleDelete(inv: DbInvoice) {
    const label = inv.buyer_company || inv.buyer_email || inv.invoice_no;
    if (!confirm(`Delete invoice ${inv.invoice_no} (${label})? This can't be undone.`)) return;
    try {
      await deleteInvoice(inv.id);
      setInvoices((prev) => prev.filter((i) => i.id !== inv.id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete invoice');
    }
  }

  async function handleMoveToFolder(invoiceId: string, folderId: string) {
    const newFolderId = folderId || null;
    setInvoices((prev) => prev.map((i) => (i.id === invoiceId ? { ...i, folder_id: newFolderId } : i)));
    try {
      await moveInvoiceToFolder(invoiceId, newFolderId);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to move invoice');
    }
  }

  async function handleAddFolder() {
    const name = newFolderName.trim();
    if (!name) return;
    setAddingFolder(true);
    try {
      const created = await createInvoiceFolder(name, 'stone');
      setFolders((prev) => [...prev, created]);
      setNewFolderName('');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create folder');
    }
    setAddingFolder(false);
  }

  async function handleRenameFolder(id: string) {
    const name = editingFolderName.trim();
    if (!name) { setEditingFolderId(null); return; }
    try {
      await renameInvoiceFolder(id, name);
      setFolders((prev) => prev.map((f) => (f.id === id ? { ...f, name } : f)));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to rename folder');
    }
    setEditingFolderId(null);
  }

  async function handleDeleteFolder(f: DbInvoiceFolder) {
    if (!confirm(`Delete the "${f.name}" folder? Invoices in it become Unsorted — nothing is deleted.`)) return;
    try {
      await deleteInvoiceFolder(f.id);
      setFolders((prev) => prev.filter((x) => x.id !== f.id));
      setInvoices((prev) => prev.map((i) => (i.folder_id === f.id ? { ...i, folder_id: null } : i)));
      if (activeFolder === f.id) setActiveFolder('all');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete folder');
    }
  }

  const visibleInvoices = useMemo(() => {
    if (activeFolder === 'all') return invoices;
    if (activeFolder === 'unsorted') return invoices.filter((i) => !i.folder_id);
    return invoices.filter((i) => i.folder_id === activeFolder);
  }, [invoices, activeFolder]);

  const unsortedCount = useMemo(() => invoices.filter((i) => !i.folder_id).length, [invoices]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--color-oak)' }} />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen pt-32 sm:pt-40 pb-20 container-narrow text-center">
        <h1 className="heading-section mb-4">Access Denied</h1>
        <Link href="/admin" className="link-subtle">Go to login →</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 sm:pt-40 pb-20 container-wide">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2 link-subtle">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="heading-section">Invoices</h1>
        </div>
        <Link href="/admin/invoices/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Invoice
          </Button>
        </Link>
      </div>

      <div className="card p-4 mb-4 text-sm" style={{ backgroundColor: 'var(--color-ivory-dark)' }}>
        <strong>Multiple options for the same client?</strong> Create one draft invoice per option (e.g. different
        material grades), give each an &quot;Option Label&quot; on its edit page, then check two or more below with the
        same buyer email and click &quot;Send as Options&quot;. The client gets one link, picks an option, and signs + pays —
        the other options are automatically voided.
      </div>

      {selected.size > 0 && (
        <div className="card p-4 mb-4 flex items-center justify-between gap-4 flex-wrap">
          <span className="text-sm">{selected.size} selected</span>
          <div className="flex items-center gap-3">
            {groupError && <span className="text-sm text-red-600">{groupError}</span>}
            <Button onClick={handleSendOptions} disabled={!groupCanSend || grouping}>
              <Send className="w-4 h-4 mr-2" />
              {grouping ? 'Sending…' : 'Send as Options'}
            </Button>
          </div>
        </div>
      )}
      {selected.size >= 2 && !groupCanSend && (
        <p className="text-sm text-red-600 mb-4">
          All selected invoices must be drafts, not already part of a group, and share the same buyer email.
        </p>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        <div className="card p-4 md:w-56 flex-none h-fit">
          <h2 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ opacity: 0.6 }}>Folders</h2>
          <ul className="flex flex-col gap-1 mb-4">
            <li>
              <button
                onClick={() => setActiveFolder('all')}
                className={cn('w-full text-left px-3 py-2 rounded-lg text-sm', activeFolder === 'all' ? 'font-semibold' : '')}
                style={{ backgroundColor: activeFolder === 'all' ? 'var(--color-ivory-dark)' : undefined }}
              >
                All <span style={{ opacity: 0.6 }}>({invoices.length})</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveFolder('unsorted')}
                className={cn('w-full text-left px-3 py-2 rounded-lg text-sm', activeFolder === 'unsorted' ? 'font-semibold' : '')}
                style={{ backgroundColor: activeFolder === 'unsorted' ? 'var(--color-ivory-dark)' : undefined }}
              >
                Unsorted <span style={{ opacity: 0.6 }}>({unsortedCount})</span>
              </button>
            </li>
            {folders.map((f) => {
              const count = invoices.filter((i) => i.folder_id === f.id).length;
              return (
                <li key={f.id} className="group flex items-center gap-1">
                  {editingFolderId === f.id ? (
                    <input
                      autoFocus
                      className="input-field flex-1 text-sm py-1"
                      value={editingFolderName}
                      onChange={(e) => setEditingFolderName(e.target.value)}
                      onBlur={() => handleRenameFolder(f.id)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleRenameFolder(f.id); if (e.key === 'Escape') setEditingFolderId(null); }}
                    />
                  ) : (
                    <>
                      <button
                        onClick={() => setActiveFolder(f.id)}
                        className={cn('flex-1 text-left px-3 py-2 rounded-lg text-sm truncate', activeFolder === f.id ? 'font-semibold' : '')}
                        style={{ backgroundColor: activeFolder === f.id ? 'var(--color-ivory-dark)' : undefined }}
                      >
                        {f.name} <span style={{ opacity: 0.6 }}>({count})</span>
                      </button>
                      <button
                        onClick={() => { setEditingFolderId(f.id); setEditingFolderName(f.name); }}
                        className="opacity-0 group-hover:opacity-100 p-1 link-subtle flex-none"
                        title="Rename"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteFolder(f)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 flex-none"
                        title="Delete folder"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
          <div className="flex items-center gap-1 pt-3 border-t" style={{ borderColor: 'var(--color-stone)' }}>
            <input
              className="input-field flex-1 text-sm py-1"
              placeholder="New folder…"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddFolder(); }}
            />
            <button onClick={handleAddFolder} disabled={addingFolder} className="p-2 link-subtle flex-none" title="Add folder">
              <FolderPlus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="card overflow-hidden flex-1">
          <table className="w-full">
            <thead style={{ backgroundColor: 'var(--color-ivory-dark)', borderBottom: '1px solid var(--color-stone)' }}>
              <tr>
                <th className="px-6 py-4 w-10"></th>
                <th className="text-left px-6 py-4 text-sm font-semibold">Invoice #</th>
                <th className="text-left px-6 py-4 text-sm font-semibold">Buyer</th>
                <th className="text-left px-6 py-4 text-sm font-semibold">Total</th>
                <th className="text-left px-6 py-4 text-sm font-semibold">Status</th>
                <th className="text-left px-6 py-4 text-sm font-semibold">Folder</th>
                <th className="text-right px-6 py-4 text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--color-stone)' }}>
              {visibleInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center body-regular">
                    {invoices.length === 0 ? 'No invoices yet. Click "New Invoice" to create one.' : 'No invoices in this folder.'}
                  </td>
                </tr>
              ) : (
                visibleInvoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="px-6 py-4">
                      <input type="checkbox" checked={selected.has(inv.id)} onChange={() => toggleSelected(inv.id)} />
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {inv.invoice_no}
                      {inv.option_label && (
                        <div className="text-xs font-normal mt-0.5" style={{ color: 'var(--color-walnut)' }}>
                          {inv.option_label}{inv.group_id ? ' · grouped' : ''}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 body-regular">{inv.buyer_company || inv.buyer_email || '—'}</td>
                    <td className="px-6 py-4 body-regular">{fmtCents(inv.total_cents)}</td>
                    <td className="px-6 py-4">
                      <span className={cn('inline-block px-3 py-1 rounded-full text-xs font-semibold', STATUS_STYLES[inv.status])}>
                        {STATUS_LABELS[inv.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        className="input-field text-xs py-1"
                        value={inv.folder_id || ''}
                        onChange={(e) => handleMoveToFolder(inv.id, e.target.value)}
                      >
                        <option value="">Unsorted</option>
                        {folders.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button onClick={() => copyLink(inv)} className="p-2 link-subtle" title="Copy customer link">
                          {copiedId === inv.id ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <Link href={`/admin/invoices/${inv.id}`} className="link-subtle text-sm font-medium">
                          Open →
                        </Link>
                        <button onClick={() => handleDelete(inv)} className="p-2 text-red-500 hover:text-red-700" title="Delete invoice">
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
      </div>
    </div>
  );
}
