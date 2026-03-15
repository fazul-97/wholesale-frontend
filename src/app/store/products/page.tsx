'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Plus, Search, Edit2, Package, Loader2, X, Upload, ToggleLeft, ToggleRight } from 'lucide-react';
import { useStoreProducts } from '@/hooks/useApi';
import { api } from '@/lib/axios';
import { useQueryClient } from '@tanstack/react-query';
import { OrderStatusBadge } from '@/components/ui/OrderStatusBadge';
import { fmt } from '@/lib/utils';

interface Product { id: string; name: string; sku: string; unit: string; price: number; salePrice?: number | null; stockStatus: string; category?: string | null; imageUrl?: string | null; }

const BLANK_FORM = { name: '', sku: '', unit: 'piece', price: '', salePrice: '', category: '', stockStatus: 'IN_STOCK' as string, tags: '' };

export default function StoreProductsPage() {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useStoreProducts({ search: search || undefined });
  const products: Product[] = data?.data || [];
  const qc = useQueryClient();

  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({ ...BLANK_FORM });
  const [saving, setSaving] = useState(false);
  const [imgFile, setImgFile] = useState<File | null>(null);

  const openAdd = () => { setForm({ ...BLANK_FORM }); setEditProduct(null); setImgFile(null); setModal('add'); };
  const openEdit = (p: Product) => {
    setForm({ name: p.name, sku: p.sku, unit: p.unit, price: String(p.price), salePrice: p.salePrice ? String(p.salePrice) : '', category: p.category || '', stockStatus: p.stockStatus, tags: '' });
    setEditProduct(p); setImgFile(null); setModal('edit');
  };

  const save = async () => {
    setSaving(true);
    try {
      const body = { name: form.name, sku: form.sku, unit: form.unit, price: parseFloat(form.price), salePrice: form.salePrice ? parseFloat(form.salePrice) : undefined, category: form.category || undefined, stockStatus: form.stockStatus };
      let saved: Product;
      if (modal === 'edit' && editProduct) {
        const r = await api.put(`/products/${editProduct.id}`, body);
        saved = r.data.data;
      } else {
        const r = await api.post('/products', body);
        saved = r.data.data;
      }
      if (imgFile) {
        const fd = new FormData(); fd.append('image', imgFile);
        await api.post(`/products/${saved.id}/image`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      qc.invalidateQueries({ queryKey: ['store-products'] });
      setModal(null);
    } catch { /* TODO: toast */ }
    finally { setSaving(false); }
  };

  const toggleStock = async (p: Product) => {
    const next = p.stockStatus === 'IN_STOCK' ? 'OUT_OF_STOCK' : 'IN_STOCK';
    await api.patch(`/products/${p.id}/stock`, { stockStatus: next });
    qc.invalidateQueries({ queryKey: ['store-products'] });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-navy">Products</h1>
        <button onClick={openAdd} className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-navy font-bold px-4 py-2 rounded-xl text-sm transition-colors">
          <Plus size={16} /> Add
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 shadow-sm" />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16"><Loader2 size={28} className="animate-spin text-amber-500" /></div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <Package size={48} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-400 font-medium">No products yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-50">
            {products.map((p: Product) => (
              <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex-shrink-0 overflow-hidden">
                  {p.imageUrl ? <Image src={p.imageUrl} alt={p.name} width={48} height={48} className="object-cover w-full h-full" /> : <div className="w-full h-full flex items-center justify-center text-xl">📦</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-navy text-sm truncate">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.sku} · {fmt.currency(p.price)}/{p.unit}</p>
                </div>
                <div className="flex items-center gap-2">
                  <OrderStatusBadge status={p.stockStatus} />
                  <button onClick={() => toggleStock(p)} className="text-gray-400 hover:text-amber-500 p-1" title="Toggle stock">
                    {p.stockStatus === 'IN_STOCK' ? <ToggleRight size={18} className="text-green-500" /> : <ToggleLeft size={18} />}
                  </button>
                  <button onClick={() => openEdit(p)} className="text-gray-400 hover:text-navy p-1">
                    <Edit2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModal(null)} />
          <div className="relative bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-md max-h-[90vh] overflow-y-auto p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-navy">{modal === 'add' ? 'Add Product' : 'Edit Product'}</h2>
              <button onClick={() => setModal(null)}><X size={20} className="text-gray-400" /></button>
            </div>

            <div className="space-y-3">
              {[
                { key: 'name', label: 'Product Name *', placeholder: 'e.g. Unga Pembe 2kg' },
                { key: 'sku', label: 'SKU *', placeholder: 'e.g. UNGA-2KG' },
                { key: 'unit', label: 'Unit *', placeholder: 'e.g. bag, kg, piece' },
                { key: 'price', label: 'Price (KES) *', placeholder: '150', type: 'number' },
                { key: 'salePrice', label: 'Sale Price (KES)', placeholder: '120', type: 'number' },
                { key: 'category', label: 'Category', placeholder: 'e.g. Flour & Grains' },
              ].map(({ key, label, placeholder, type }) => (
                <div key={key}>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">{label}</label>
                  <input type={type || 'text'} value={form[key as keyof typeof form]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-500" />
                </div>
              ))}

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Stock Status</label>
                <select value={form.stockStatus} onChange={e => setForm(p => ({ ...p, stockStatus: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-500">
                  <option value="IN_STOCK">In Stock</option>
                  <option value="LIMITED">Limited</option>
                  <option value="OUT_OF_STOCK">Out of Stock</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Product Image</label>
                <label className="flex items-center gap-2 border-2 border-dashed border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:border-amber-300 transition-colors">
                  <Upload size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-500">{imgFile ? imgFile.name : 'Click to upload image'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={e => setImgFile(e.target.files?.[0] || null)} />
                </label>
              </div>

              <button onClick={save} disabled={saving || !form.name || !form.sku || !form.price} className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-navy font-bold py-3 rounded-xl transition-colors">
                {saving ? <Loader2 size={16} className="animate-spin mx-auto" /> : modal === 'add' ? 'Add Product' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
