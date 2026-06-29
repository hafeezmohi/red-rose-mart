import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { X, ChevronDown, ImagePlus } from 'lucide-react';
import { CATEGORIES } from '../constants';
import { API_URL } from '../config';

export function authHeaders() {
    const token = localStorage.getItem("admin-token");
    return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

// ── Image URL input ───────────────────────────────────────────────────────────
export function ImageInput({ images, onChange }) {
    const [url, setUrl] = useState("");
    const add = () => {
        if (!url.trim()) return;
        onChange([...images, url.trim()]);
        setUrl("");
    };
    return (
        <div>
            <div className="flex gap-2">
                <input type="text" placeholder="https://..." value={url}
                    onChange={e => setUrl(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && (e.preventDefault(), add())}
                    className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none text-black placeholder-gray-400" />
                <button type="button" onClick={add}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-semibold transition flex items-center justify-center">
                    <ImagePlus size={18} />
                </button>
            </div>
            {images.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {images.map((img, i) => (
                        <div key={i} className="relative group">
                            <img src={img} alt="" className="w-16 h-16 rounded-xl object-cover border border-gray-200" />
                            <button type="button"
                                onClick={() => onChange(images.filter((_, j) => j !== i))}
                                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                <X size={10} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Product Form (add / edit) ─────────────────────────────────────────────────
export function ProductForm({ initial, onSave, onCancel, saving }) {
    const [form, setForm] = useState(initial);
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = () => {
        if (!form.name.trim())     return toast.error("Name is required");
        if (!form.category)        return toast.error("Category is required");
        if (!form.price)           return toast.error("Price is required");
        if (!form.unit.trim())     return toast.error("Unit is required");
        onSave(form);
    };

    const inputCls = "border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none text-black placeholder-gray-400 w-full";

    return (
        <div className="space-y-4">
            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Product Name *</label>
                    <input type="text" placeholder="e.g. Toor Dal" value={form.name}
                        onChange={e => set("name", e.target.value)} className={inputCls} />
                </div>
                <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Category *</label>
                    <div className="relative">
                        <select value={form.category} onChange={e => set("category", e.target.value)}
                            className={`${inputCls} appearance-none pr-8`}>
                            <option value="">Select Category</option>
                            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Price (₹) *</label>
                    <input type="number" placeholder="90" value={form.price}
                        onChange={e => set("price", e.target.value)} className={inputCls} />
                </div>
                <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Discount Price (₹)</label>
                    <input type="number" placeholder="80" value={form.discountPrice}
                        onChange={e => set("discountPrice", e.target.value)} className={inputCls} />
                </div>
                <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Unit *</label>
                    <input type="text" placeholder="500g / 1kg / pack" value={form.unit}
                        onChange={e => set("unit", e.target.value)} className={inputCls} />
                </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={form.isFeatured}
                            onChange={e => set("isFeatured", e.target.checked)}
                            className="w-4 h-4 accent-red-500" />
                        <span className="text-sm font-medium text-black">Featured</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={form.isActive}
                            onChange={e => set("isActive", e.target.checked)}
                            className="w-4 h-4 accent-red-500" />
                        <span className="text-sm font-medium text-black">Active</span>
                    </label>
                </div>
            </div>

            {/* Images */}
            <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Images</label>
                <ImageInput images={form.images} onChange={v => set("images", v)} />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
                <button type="button" onClick={handleSubmit} disabled={saving}
                    className="bg-black hover:bg-gray-900 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition">
                    {saving ? "Saving…" : initial._id ? "Update Product" : "Add Product"}
                </button>
                <button type="button" onClick={onCancel}
                    className="border border-gray-300 hover:bg-gray-50 text-black px-6 py-2.5 rounded-xl text-sm font-semibold transition">
                    Cancel
                </button>
            </div>
        </div>
    );
}

// ── Edit Modal ────────────────────────────────────────────────────────────────
export function EditModal({ product, onClose, onUpdated }) {
    const [saving, setSaving] = useState(false);

    const handleSave = async (form) => {
        setSaving(true);
        try {
            const body = {
                name: form.name, category: form.category,
                price: Number(form.price),
                discountPrice: form.discountPrice ? Number(form.discountPrice) : undefined,
                unit: form.unit,
                isFeatured: form.isFeatured, isActive: form.isActive,
                images: form.images,
            };
            const res  = await fetch(`${API_URL}/api/products/${product._id}`, {
                method: "PATCH", headers: authHeaders(), body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!data.success) { toast.error(data.message || "Update failed"); return; }
            toast.success("Product updated");
            onUpdated(data.data?.product ?? data.product);
            onClose();
        } catch { toast.error("Network error"); }
        finally   { setSaving(false); }
    };

    const initial = {
        _id: product._id,
        name: product.name, category: product.category,
        price: product.price ?? "", discountPrice: product.discountPrice ?? "",
        unit: product.unit ?? "",
        isFeatured: product.isFeatured ?? false,
        isActive: product.isActive ?? true,
        images: product.images ?? [],
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-black">Edit Product</h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100">
                        <X size={18} />
                    </button>
                </div>
                <div className="p-6">
                    <ProductForm initial={initial} onSave={handleSave} onCancel={onClose} saving={saving} />
                </div>
            </div>
        </div>
    );
}
