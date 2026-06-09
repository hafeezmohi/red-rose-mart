"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";
import {
    Search, Plus, Pencil, Trash2, X, ChevronDown,
    ImagePlus, PackageX, Star, Eye, EyeOff,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://red-rose-backend.onrender.com";
const LIMIT = 25;

const CATEGORIES = [
    { id: "fruits-vegetables", label: "Fruits & Vegetables" },
    { id: "dairy-eggs",        label: "Dairy & Eggs" },
    { id: "rice-grains",       label: "Rice & Grains" },
    { id: "snacks",            label: "Snacks" },
    { id: "beverages",         label: "Beverages" },
    { id: "personal-care",     label: "Personal Care" },
    { id: "haircare",          label: "Haircare" },
    { id: "household",         label: "Household" },
    { id: "frozen",            label: "Frozen" },
    { id: "other",             label: "Other" },
    { id: "instant-foods", label: "Instant Foods" },
    { id: "oil-masala", label: "Oil & Masala" },
    { id: "beauty-hygiene", label: "Beauty & Hygiene" },
    { id: "offers", label: "Special Offers" },
];

const CATEGORY_LABEL = Object.fromEntries(CATEGORIES.map(c => [c.id, c.label]));

const EMPTY_FORM = {
    name: "", category: "", price: "", discountPrice: "",
    unit: "", stock: "", lowStockThreshold: "10",
    isFeatured: false, isActive: true, images: [],
};

// ── helpers ──────────────────────────────────────────────────────────────────
function authHeaders() {
    const token = localStorage.getItem("admin-token");
    return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

function stockBadge(product) {
    if (product.stock === 0)
        return <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-red-100 text-red-600">Out of Stock</span>;
    if (product.stock <= (product.lowStockThreshold ?? 10))
        return <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-yellow-100 text-yellow-700">{product.stock} Low</span>;
    return <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-green-100 text-green-700">{product.stock} In Stock</span>;
}

// ── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonRow() {
    return (
        <tr className="border-b border-gray-100 animate-pulse">
            <td className="p-4"><div className="flex items-center gap-3"><div className="w-12 h-12 rounded-xl bg-gray-200 shrink-0" /><div className="h-3 w-24 bg-gray-200 rounded" /></div></td>
            <td className="p-4"><div className="h-3 w-20 bg-gray-200 rounded" /></td>
            <td className="p-4"><div className="h-3 w-14 bg-gray-200 rounded" /></td>
            <td className="p-4"><div className="h-3 w-14 bg-gray-200 rounded" /></td>
            <td className="p-4"><div className="h-5 w-16 bg-gray-200 rounded-lg" /></td>
            <td className="p-4"><div className="flex gap-2"><div className="w-8 h-8 rounded-lg bg-gray-200" /><div className="w-8 h-8 rounded-lg bg-gray-200" /><div className="w-8 h-8 rounded-lg bg-gray-200" /></div></td>
        </tr>
    );
}

function SkeletonCard() {
    return (
        <div className="bg-white rounded-2xl p-4 border border-gray-200 animate-pulse">
            <div className="flex gap-3 mb-3">
                <div className="w-16 h-16 rounded-xl bg-gray-200 shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                    <div className="h-3 w-28 bg-gray-200 rounded" />
                    <div className="h-2.5 w-20 bg-gray-100 rounded" />
                    <div className="h-2.5 w-16 bg-gray-100 rounded" />
                </div>
            </div>
            <div className="flex justify-between"><div className="h-6 w-16 bg-gray-200 rounded-lg" /><div className="flex gap-2"><div className="w-8 h-8 bg-gray-200 rounded-lg" /><div className="w-8 h-8 bg-gray-200 rounded-lg" /></div></div>
        </div>
    );
}

// ── Image URL input ───────────────────────────────────────────────────────────
function ImageInput({ images, onChange }) {
    const [url, setUrl] = useState("");

    const add = () => {
        const trimmed = url.trim();
        if (!trimmed) return;
        onChange([...images, trimmed]);
        setUrl("");
    };

    return (
        <div>
            <div className="flex gap-2 mb-2">
                <input
                    type="text"
                    placeholder="Paste image URL and press Add"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && (e.preventDefault(), add())}
                    className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none text-black placeholder-gray-400"
                />
                <button type="button" onClick={add}
                    className="bg-black text-white px-4 py-2.5 rounded-xl text-sm font-semibold shrink-0 flex items-center gap-1.5">
                    <ImagePlus size={15} /> Add
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
function ProductForm({ initial, onSave, onCancel, saving }) {
    const [form, setForm] = useState(initial);
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = () => {
        if (!form.name.trim())     return toast.error("Name is required");
        if (!form.category)        return toast.error("Category is required");
        if (!form.price)           return toast.error("Price is required");
        if (!form.unit.trim())     return toast.error("Unit is required");
        if (form.stock === "")     return toast.error("Stock is required");
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Stock *</label>
                    <input type="number" placeholder="80" value={form.stock}
                        onChange={e => set("stock", e.target.value)} className={inputCls} />
                </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Low Stock Threshold</label>
                    <input type="number" placeholder="10" value={form.lowStockThreshold}
                        onChange={e => set("lowStockThreshold", e.target.value)} className={inputCls} />
                </div>
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
function EditModal({ product, onClose, onUpdated }) {
    const [saving, setSaving] = useState(false);

    const handleSave = async (form) => {
        setSaving(true);
        try {
            const body = {
                name: form.name, category: form.category,
                price: Number(form.price),
                discountPrice: form.discountPrice ? Number(form.discountPrice) : undefined,
                unit: form.unit, stock: Number(form.stock),
                lowStockThreshold: Number(form.lowStockThreshold) || 10,
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
        unit: product.unit ?? "", stock: product.stock ?? "",
        lowStockThreshold: product.lowStockThreshold ?? 10,
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

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ProductsPage() {
    const [products,    setProducts]    = useState([]);
    const [total,       setTotal]       = useState(0);
    const [page,        setPage]        = useState(1);
    const [hasMore,     setHasMore]     = useState(false);
    const [loading,     setLoading]     = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [saving,      setSaving]      = useState(false);
    const [deleting,    setDeleting]    = useState(null);
    const [editProduct, setEditProduct] = useState(null);
    const [showForm,    setShowForm]    = useState(false);

    // filters
    const [search,     setSearch]     = useState("");
    const [catFilter,  setCatFilter]  = useState("");
    const [featFilter, setFeatFilter] = useState("");
    const [actFilter,  setActFilter]  = useState("");

    const debounceRef = useRef(null);

    // ── Fetch ────────────────────────────────────────────────────────────────
    const fetchProducts = useCallback(async ({ pageNum = 1, replace = true } = {}) => {
        try {
            replace ? setLoading(true) : setLoadingMore(true);
            const params = new URLSearchParams({
                page: pageNum, limit: LIMIT,
                ...(search     && { search }),
                ...(catFilter  && { category:   catFilter }),
                ...(featFilter && { isFeatured: featFilter }),
                ...(actFilter  && { isActive:   actFilter }),
            });
            const res  = await fetch(`${API_URL}/api/admin/products?${params}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("admin-token")}` },
            });
            const data = await res.json();
            if (!data.success) { toast.error(data.message || "Failed to fetch"); return; }
            const payload = data.data ?? data;
            setProducts(prev => replace ? payload.products : [...prev, ...payload.products]);
            setTotal(payload.pagination.total);
            setHasMore(payload.pagination.hasMore);
            setPage(pageNum);
        } catch { toast.error("Network error"); }
        finally { setLoading(false); setLoadingMore(false); }
    }, [search, catFilter, featFilter, actFilter]);

    useEffect(() => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => fetchProducts({ pageNum: 1, replace: true }), search ? 400 : 0);
        return () => clearTimeout(debounceRef.current);
    }, [search, catFilter, featFilter, actFilter]);

    // ── Add ──────────────────────────────────────────────────────────────────
    const handleAdd = async (form) => {
        setSaving(true);
        try {
            const body = {
                name: form.name, category: form.category,
                price: Number(form.price),
                ...(form.discountPrice && { discountPrice: Number(form.discountPrice) }),
                unit: form.unit, stock: Number(form.stock),
                lowStockThreshold: Number(form.lowStockThreshold) || 10,
                isFeatured: form.isFeatured, isActive: form.isActive,
                images: form.images,
            };
            const res  = await fetch(`${API_URL}/api/products`, {
                method: "POST", headers: authHeaders(), body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!data.success) { toast.error(data.message || "Create failed"); return; }
            toast.success("Product added");
            setShowForm(false);
            fetchProducts({ pageNum: 1, replace: true });
        } catch { toast.error("Network error"); }
        finally { setSaving(false); }
    };

    // ── Delete ───────────────────────────────────────────────────────────────
    const handleDelete = async (product) => {
        if (!confirm(`Delete "${product.name}"? It will be hidden from the store.`)) return;
        setDeleting(product._id);
        try {
            const res  = await fetch(`${API_URL}/api/products/${product._id}`, {
                method: "DELETE", headers: { Authorization: `Bearer ${localStorage.getItem("admin-token")}` },
            });
            const data = await res.json();
            if (!data.success) { toast.error(data.message || "Delete failed"); return; }
            toast.success("Product removed");
            setProducts(prev => prev.filter(p => p._id !== product._id));
            setTotal(t => t - 1);
        } catch { toast.error("Network error"); }
        finally { setDeleting(null); }
    };

    // ── Toggle active (quick) ────────────────────────────────────────────────
    const handleToggleActive = async (product) => {
        try {
            const res  = await fetch(`${API_URL}/api/products/${product._id}`, {
                method: "PATCH", headers: authHeaders(),
                body: JSON.stringify({ isActive: !product.isActive }),
            });
            const data = await res.json();
            if (!data.success) { toast.error("Update failed"); return; }
            const updated = data.data?.product ?? data.product;
            setProducts(prev => prev.map(p => p._id === product._id ? updated : p));
            toast.success(updated.isActive ? "Product activated" : "Product deactivated");
        } catch { toast.error("Network error"); }
    };

    const clearFilters = () => { setSearch(""); setCatFilter(""); setFeatFilter(""); setActFilter(""); };
    const hasFilters   = search || catFilter || featFilter || actFilter;

    const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= (p.lowStockThreshold ?? 10)).length;
    const outOfStock    = products.filter(p => p.stock === 0).length;
    const featuredCount = products.filter(p => p.isFeatured).length;

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="flex bg-gray-100 min-h-screen">
            <Sidebar />

            <div className="flex-1 ml-0 lg:ml-56 pt-16 lg:pt-0">
                <Navbar />

                <div className="p-4 md:p-6">

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-black">Products</h1>
                            <p className="text-gray-500 mt-1 text-sm">
                                Manage inventory{total > 0 && ` · ${total} products`}
                            </p>
                        </div>
                        <button onClick={() => { setShowForm(v => !v); }}
                            className="flex items-center gap-2 bg-black hover:bg-gray-900 text-white px-5 py-3 rounded-xl font-semibold text-sm transition shrink-0">
                            {showForm ? <X size={18} /> : <Plus size={18} />}
                            {showForm ? "Cancel" : "Add Product"}
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                        {[
                            { label: "Total",      value: total,        color: "text-black"        },
                            { label: "Low Stock",  value: lowStockCount, color: "text-yellow-600"  },
                            { label: "Out of Stock", value: outOfStock,  color: "text-red-500"     },
                            { label: "Featured",   value: featuredCount, color: "text-purple-600"  },
                        ].map(s => (
                            <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
                                <p className="text-gray-500 text-xs mb-1">{s.label}</p>
                                <p className={`text-2xl md:text-3xl font-bold ${s.color}`}>{s.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Add Form */}
                    {showForm && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 md:p-6 mb-6">
                            <h2 className="text-lg font-bold text-black mb-5">New Product</h2>
                            <ProductForm
                                initial={EMPTY_FORM}
                                onSave={handleAdd}
                                onCancel={() => setShowForm(false)}
                                saving={saving}
                            />
                        </div>
                    )}

                    {/* Search + Filters */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 mb-6">
                        <div className="flex items-center bg-gray-100 rounded-xl px-4 h-12 mb-3">
                            <Search size={18} className="text-gray-400 shrink-0" />
                            <input
                                type="text" placeholder="Search products…"
                                value={search} onChange={e => setSearch(e.target.value)}
                                className="bg-transparent outline-none px-3 w-full text-black text-sm placeholder-gray-400"
                            />
                            {search && <button onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>}
                        </div>

                        <div className="flex flex-wrap gap-2 items-center">
                            {/* Category */}
                            <div className="relative">
                                <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
                                    className="appearance-none bg-gray-100 text-sm text-black rounded-xl px-4 py-2 pr-8 outline-none cursor-pointer font-medium">
                                    <option value="">All Categories</option>
                                    {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                                </select>
                                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                            </div>

                            {/* Featured */}
                            <div className="relative">
                                <select value={featFilter} onChange={e => setFeatFilter(e.target.value)}
                                    className="appearance-none bg-gray-100 text-sm text-black rounded-xl px-4 py-2 pr-8 outline-none cursor-pointer font-medium">
                                    <option value="">All</option>
                                    <option value="true">Featured</option>
                                    <option value="false">Not Featured</option>
                                </select>
                                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                            </div>

                            {/* Active */}
                            <div className="relative">
                                <select value={actFilter} onChange={e => setActFilter(e.target.value)}
                                    className="appearance-none bg-gray-100 text-sm text-black rounded-xl px-4 py-2 pr-8 outline-none cursor-pointer font-medium">
                                    <option value="">All Status</option>
                                    <option value="true">Active</option>
                                    <option value="false">Inactive</option>
                                </select>
                                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                            </div>

                            {hasFilters && (
                                <button onClick={clearFilters}
                                    className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 font-medium px-3 py-2 rounded-xl hover:bg-red-50 transition">
                                    <X size={14} /> Clear
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ── Desktop Table ── */}
                    <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-4">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr className="text-left text-sm text-black">
                                        <th className="p-4 font-semibold">Product</th>
                                        <th className="p-4 font-semibold">Category</th>
                                        <th className="p-4 font-semibold">Price</th>
                                        <th className="p-4 font-semibold">Stock</th>
                                        <th className="p-4 font-semibold">Flags</th>
                                        <th className="p-4 font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading
                                        ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                                        : products.map(product => (
                                            <tr key={product._id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${!product.isActive ? "opacity-50" : ""}`}>
                                                {/* Product */}
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        {product.images?.[0] ? (
                                                            <img src={product.images[0]} alt={product.name}
                                                                className="w-12 h-12 rounded-xl object-cover shrink-0 border border-gray-100" />
                                                        ) : (
                                                            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                                                                <PackageX size={18} className="text-gray-400" />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="font-semibold text-black text-sm">{product.name}</p>
                                                            <p className="text-gray-400 text-xs">{product.unit}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                {/* Category */}
                                                <td className="p-4 text-sm text-gray-600">{CATEGORY_LABEL[product.category] ?? product.category}</td>
                                                {/* Price */}
                                                <td className="p-4">
                                                    <p className="font-semibold text-black text-sm">₹{product.price}</p>
                                                    {product.discountPrice && <p className="text-xs text-green-600">₹{product.discountPrice} offer</p>}
                                                </td>
                                                {/* Stock */}
                                                <td className="p-4">{stockBadge(product)}</td>
                                                {/* Flags */}
                                                <td className="p-4">
                                                    <div className="flex gap-1.5 flex-wrap">
                                                        {product.isFeatured && (
                                                            <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                                                                <Star size={10} fill="currentColor" /> Featured
                                                            </span>
                                                        )}
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${product.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                                                            {product.isActive ? "Active" : "Inactive"}
                                                        </span>
                                                    </div>
                                                </td>
                                                {/* Actions */}
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => setEditProduct(product)}
                                                            className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition">
                                                            <Pencil size={14} />
                                                        </button>
                                                        <button onClick={() => handleToggleActive(product)}
                                                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${product.isActive ? "bg-gray-100 text-gray-600 hover:bg-gray-200" : "bg-green-100 text-green-600 hover:bg-green-200"}`}>
                                                            {product.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                                                        </button>
                                                        <button onClick={() => handleDelete(product)} disabled={deleting === product._id}
                                                            className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition disabled:opacity-50">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ── Mobile Cards ── */}
                    <div className="md:hidden space-y-3 mb-4">
                        {loading
                            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                            : products.map(product => (
                                <div key={product._id} className={`bg-white rounded-2xl p-4 shadow-sm border border-gray-200 ${!product.isActive ? "opacity-50" : ""}`}>
                                    <div className="flex gap-3 mb-3">
                                        {product.images?.[0] ? (
                                            <img src={product.images[0]} alt={product.name}
                                                className="w-16 h-16 rounded-xl object-cover shrink-0 border border-gray-100" />
                                        ) : (
                                            <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                                                <PackageX size={20} className="text-gray-400" />
                                            </div>
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <p className="font-semibold text-black truncate">{product.name}</p>
                                            <p className="text-gray-400 text-xs mb-1">{product.unit} · {CATEGORY_LABEL[product.category] ?? product.category}</p>
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-bold text-black text-sm">₹{product.price}</span>
                                                {product.discountPrice && <span className="text-xs text-green-600">/ ₹{product.discountPrice}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex gap-1.5 flex-wrap">
                                            {stockBadge(product)}
                                            {product.isFeatured && (
                                                <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-semibold">
                                                    <Star size={10} fill="currentColor" /> Featured
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex gap-2 shrink-0">
                                            <button onClick={() => setEditProduct(product)}
                                                className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                                                <Pencil size={14} />
                                            </button>
                                            <button onClick={() => handleToggleActive(product)}
                                                className={`w-8 h-8 rounded-lg flex items-center justify-center ${product.isActive ? "bg-gray-100 text-gray-600" : "bg-green-100 text-green-600"}`}>
                                                {product.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                                            </button>
                                            <button onClick={() => handleDelete(product)} disabled={deleting === product._id}
                                                className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center disabled:opacity-50">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        }
                    </div>

                    {/* Empty */}
                    {!loading && products.length === 0 && (
                        <div className="bg-white rounded-2xl p-10 shadow-sm border border-gray-200 text-center">
                            <p className="text-5xl mb-4">📦</p>
                            <h2 className="text-xl font-bold text-black">No products found</h2>
                            <p className="text-gray-500 mt-1 text-sm">
                                {hasFilters ? "Try adjusting your search or filters" : "Add your first product above"}
                            </p>
                            {hasFilters && (
                                <button onClick={clearFilters} className="mt-4 text-sm text-red-500 hover:text-red-600 font-semibold">
                                    Clear filters
                                </button>
                            )}
                        </div>
                    )}

                    {/* See More */}
                    {!loading && hasMore && (
                        <div className="flex justify-center mt-4">
                            <button onClick={() => fetchProducts({ pageNum: page + 1, replace: false })} disabled={loadingMore}
                                className="bg-white border border-gray-200 hover:bg-gray-50 text-black font-semibold px-8 py-3 rounded-2xl shadow-sm transition disabled:opacity-60 text-sm">
                                {loadingMore ? "Loading…" : `See More (${total - products.length} remaining)`}
                            </button>
                        </div>
                    )}

                </div>
            </div>

            {/* Edit Modal */}
            {editProduct && (
                <EditModal
                    product={editProduct}
                    onClose={() => setEditProduct(null)}
                    onUpdated={updated => setProducts(prev => prev.map(p => p._id === updated._id ? updated : p))}
                />
            )}
        </div>
    );
}