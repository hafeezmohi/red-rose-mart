"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { Search, Users, UserCheck, UserX, ChevronDown, X } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://10.55.36.201:5000";
const LIMIT = 25;

function getInitials(name = "") {
    return name.trim().split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

function formatDate(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
    });
}

// ─── Skeleton row ────────────────────────────────────────────────────────────
function SkeletonRow() {
    return (
        <tr className="border-b border-gray-100 animate-pulse">
            <td className="p-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
                    <div className="space-y-2">
                        <div className="h-3 w-28 bg-gray-200 rounded" />
                        <div className="h-2.5 w-36 bg-gray-100 rounded" />
                    </div>
                </div>
            </td>
            <td className="p-4"><div className="h-3 w-16 bg-gray-200 rounded" /></td>
            <td className="p-4"><div className="h-6 w-16 bg-gray-200 rounded-full" /></td>
            <td className="p-4"><div className="h-3 w-20 bg-gray-200 rounded" /></td>
            <td className="p-4"><div className="h-8 w-20 bg-gray-200 rounded-xl" /></td>
        </tr>
    );
}

// ─── Skeleton card (mobile) ───────────────────────────────────────────────────
function SkeletonCard() {
    return (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 animate-pulse">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gray-200 shrink-0" />
                <div className="flex-1 space-y-2">
                    <div className="h-3 w-32 bg-gray-200 rounded" />
                    <div className="h-2.5 w-40 bg-gray-100 rounded" />
                </div>
            </div>
            <div className="flex justify-between items-center">
                <div className="h-5 w-14 bg-gray-200 rounded-full" />
                <div className="h-8 w-20 bg-gray-200 rounded-xl" />
            </div>
        </div>
    );
}

// ─── User row (desktop) ───────────────────────────────────────────────────────
function UserRow({ user, onToggleBlock, blocking }) {
    const isBlocked = user.isBlocked;

    return (
        <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
            {/* User */}
            <td className="p-4">
                <div className="flex items-center gap-3">
                    {user.avatar ? (
                        <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover shrink-0"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                            {getInitials(user.name)}
                        </div>
                    )}
                    <div className="min-w-0">
                        <p className="font-semibold text-black text-sm truncate">{user.name}</p>
                        <p className="text-gray-500 text-xs truncate">{user.email}</p>
                        {user.phone && (
                            <p className="text-gray-400 text-xs">{user.phone}</p>
                        )}
                    </div>
                </div>
            </td>

            {/* Role */}
            <td className="p-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    user.role === "admin"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-blue-100 text-blue-700"
                }`}>
                    {user.role === "admin" ? "Admin" : "Customer"}
                </span>
            </td>

            {/* Status */}
            <td className="p-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    isBlocked
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-700"
                }`}>
                    {isBlocked ? "Blocked" : "Active"}
                </span>
            </td>

            {/* Joined */}
            <td className="p-4 text-gray-500 text-sm whitespace-nowrap">
                {formatDate(user.createdAt)}
            </td>

            {/* Action */}
            <td className="p-4">
                {user.role === "admin" ? (
                    <span className="text-xs text-gray-400 italic">—</span>
                ) : (
                    <button
                        onClick={() => onToggleBlock(user)}
                        disabled={blocking === user._id}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                            isBlocked
                                ? "bg-green-500 hover:bg-green-600 text-white"
                                : "bg-red-500 hover:bg-red-600 text-white"
                        }`}
                    >
                        {blocking === user._id
                            ? "..."
                            : isBlocked ? "Unblock" : "Block"}
                    </button>
                )}
            </td>
        </tr>
    );
}

// ─── User card (mobile) ───────────────────────────────────────────────────────
function UserCard({ user, onToggleBlock, blocking }) {
    const isBlocked = user.isBlocked;

    return (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
                {user.avatar ? (
                    <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover shrink-0"
                    />
                ) : (
                    <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white font-bold shrink-0">
                        {getInitials(user.name)}
                    </div>
                )}
                <div className="min-w-0 flex-1">
                    <p className="font-semibold text-black truncate">{user.name}</p>
                    <p className="text-gray-500 text-sm truncate">{user.email}</p>
                    {user.phone && <p className="text-gray-400 text-xs">{user.phone}</p>}
                </div>
            </div>

            <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.role === "admin"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                    }`}>
                        {user.role === "admin" ? "Admin" : "Customer"}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        isBlocked
                            ? "bg-red-100 text-red-600"
                            : "bg-green-100 text-green-700"
                    }`}>
                        {isBlocked ? "Blocked" : "Active"}
                    </span>
                </div>

                {user.role !== "admin" && (
                    <button
                        onClick={() => onToggleBlock(user)}
                        disabled={blocking === user._id}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 ${
                            isBlocked
                                ? "bg-green-500 hover:bg-green-600 text-white"
                                : "bg-red-500 hover:bg-red-600 text-white"
                        }`}
                    >
                        {blocking === user._id
                            ? "..."
                            : isBlocked ? "Unblock" : "Block"}
                    </button>
                )}
            </div>

            <p className="text-gray-400 text-xs mt-3">Joined {formatDate(user.createdAt)}</p>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function UsersPage() {
    const [users,    setUsers]    = useState([]);
    const [total,    setTotal]    = useState(0);
    const [page,     setPage]     = useState(1);
    const [hasMore,  setHasMore]  = useState(false);
    const [loading,  setLoading]  = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [blocking, setBlocking] = useState(null);   // id currently being toggled

    // filters
    const [search,    setSearch]    = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    // debounce ref
    const debounceRef = useRef(null);

    // ── Fetch ────────────────────────────────────────────────────────────────
    const fetchUsers = useCallback(async ({ pageNum = 1, replace = true } = {}) => {
        try {
            replace ? setLoading(true) : setLoadingMore(true);

            const token = localStorage.getItem("admin-token");
            const params = new URLSearchParams({
                page:  pageNum,
                limit: LIMIT,
                ...(search       && { search }),
                ...(roleFilter   && { role: roleFilter }),
                ...(statusFilter && { isBlocked: statusFilter }),
            });

            const res  = await fetch(`${API_URL}/api/admin/users?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();

            if (!data.success) {
                toast.error(data.message || "Failed to fetch users");
                return;
            }

            setUsers(prev => replace ? data.users : [...prev, ...data.users]);
            setTotal(data.pagination.total);
            setHasMore(data.pagination.hasMore);
            setPage(pageNum);
        } catch (err) {
            toast.error("Network error — could not load users");
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [search, roleFilter, statusFilter]);

    // Initial + filter change
    useEffect(() => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            fetchUsers({ pageNum: 1, replace: true });
        }, search ? 400 : 0);
        return () => clearTimeout(debounceRef.current);
    }, [search, roleFilter, statusFilter]);

    // ── Block / Unblock ──────────────────────────────────────────────────────
    const handleToggleBlock = async (user) => {
        setBlocking(user._id);
        try {
            const token = localStorage.getItem("admin-token");
            const res   = await fetch(`${API_URL}/api/admin/users/${user._id}/block`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();

            if (!data.success) {
                toast.error(data.message || "Action failed");
                return;
            }

            // optimistic update
            setUsers(prev =>
                prev.map(u =>
                    u._id === user._id
                        ? { ...u, isBlocked: data.user.isBlocked }
                        : u
                )
            );
            toast.success(data.message);
        } catch {
            toast.error("Network error");
        } finally {
            setBlocking(null);
        }
    };

    // ── Derived stats ────────────────────────────────────────────────────────
    const activeCount  = users.filter(u => !u.isBlocked).length;
    const blockedCount = users.filter(u =>  u.isBlocked).length;

    const clearFilters = () => {
        setSearch("");
        setRoleFilter("");
        setStatusFilter("");
    };

    const hasFilters = search || roleFilter || statusFilter;

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="flex bg-gray-100 min-h-screen">
            <Sidebar />

            <div className="flex-1 ml-0 lg:ml-56 pt-16 lg:pt-0">
                <Navbar />

                <div className="p-4 md:p-6">

                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-3xl md:text-4xl font-bold text-black">Users</h1>
                        <p className="text-gray-500 mt-1 text-sm">
                            Manage customers and staff
                            {total > 0 && ` · ${total} total`}
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 md:gap-5 mb-6">
                        <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-200">
                            <div className="flex items-center gap-2 mb-1">
                                <Users size={16} className="text-gray-400" />
                                <p className="text-gray-500 text-xs md:text-sm">Total</p>
                            </div>
                            <h2 className="text-2xl md:text-4xl font-bold text-black">{total}</h2>
                        </div>

                        <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-200">
                            <div className="flex items-center gap-2 mb-1">
                                <UserCheck size={16} className="text-green-500" />
                                <p className="text-gray-500 text-xs md:text-sm">Active</p>
                            </div>
                            <h2 className="text-2xl md:text-4xl font-bold text-green-600">{activeCount}</h2>
                        </div>

                        <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-200">
                            <div className="flex items-center gap-2 mb-1">
                                <UserX size={16} className="text-red-500" />
                                <p className="text-gray-500 text-xs md:text-sm">Blocked</p>
                            </div>
                            <h2 className="text-2xl md:text-4xl font-bold text-red-500">{blockedCount}</h2>
                        </div>
                    </div>

                    {/* Search + Filters */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 mb-6">
                        {/* Search */}
                        <div className="flex items-center bg-gray-100 rounded-xl px-4 h-12 mb-3">
                            <Search size={18} className="text-gray-400 shrink-0" />
                            <input
                                type="text"
                                placeholder="Search by name, email or phone…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="bg-transparent outline-none px-3 w-full text-black text-sm placeholder-gray-400"
                            />
                            {search && (
                                <button onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600">
                                    <X size={16} />
                                </button>
                            )}
                        </div>

                        {/* Filter row */}
                        <div className="flex flex-wrap gap-2 items-center">
                            {/* Role filter */}
                            <div className="relative">
                                <select
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                    className="appearance-none bg-gray-100 text-sm text-black rounded-xl px-4 py-2 pr-8 outline-none cursor-pointer font-medium"
                                >
                                    <option value="">All Roles</option>
                                    <option value="user">Customer</option>
                                    <option value="admin">Admin</option>
                                </select>
                                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                            </div>

                            {/* Status filter */}
                            <div className="relative">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="appearance-none bg-gray-100 text-sm text-black rounded-xl px-4 py-2 pr-8 outline-none cursor-pointer font-medium"
                                >
                                    <option value="">All Status</option>
                                    <option value="false">Active</option>
                                    <option value="true">Blocked</option>
                                </select>
                                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                            </div>

                            {/* Clear filters */}
                            {hasFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 font-medium px-3 py-2 rounded-xl hover:bg-red-50 transition"
                                >
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
                                    <tr className="text-left text-black text-sm">
                                        <th className="p-4 font-semibold">User</th>
                                        <th className="p-4 font-semibold">Role</th>
                                        <th className="p-4 font-semibold">Status</th>
                                        <th className="p-4 font-semibold">Joined</th>
                                        <th className="p-4 font-semibold">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading
                                        ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                                        : users.map((user) => (
                                            <UserRow
                                                key={user._id}
                                                user={user}
                                                onToggleBlock={handleToggleBlock}
                                                blocking={blocking}
                                            />
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
                            : users.map((user) => (
                                <UserCard
                                    key={user._id}
                                    user={user}
                                    onToggleBlock={handleToggleBlock}
                                    blocking={blocking}
                                />
                            ))
                        }
                    </div>

                    {/* Empty state */}
                    {!loading && users.length === 0 && (
                        <div className="bg-white rounded-2xl p-10 shadow-sm border border-gray-200 text-center">
                            <p className="text-5xl mb-4">👤</p>
                            <h2 className="text-xl font-bold text-black">No users found</h2>
                            <p className="text-gray-500 mt-1 text-sm">
                                {hasFilters ? "Try adjusting your search or filters" : "No users in the database yet"}
                            </p>
                            {hasFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="mt-4 text-sm text-red-500 hover:text-red-600 font-semibold"
                                >
                                    Clear filters
                                </button>
                            )}
                        </div>
                    )}

                    {/* See More */}
                    {!loading && hasMore && (
                        <div className="flex justify-center mt-4">
                            <button
                                onClick={() => fetchUsers({ pageNum: page + 1, replace: false })}
                                disabled={loadingMore}
                                className="bg-white border border-gray-200 hover:bg-gray-50 text-black font-semibold px-8 py-3 rounded-2xl shadow-sm transition disabled:opacity-60 text-sm"
                            >
                                {loadingMore ? "Loading…" : `See More (${total - users.length} remaining)`}
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}