import React from 'react';

export function getInitials(name = "") {
    return name.trim().split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

export function formatDate(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
    });
}

// ─── User row (desktop) ───────────────────────────────────────────────────────
export function UserRow({ user, onToggleBlock, blocking }) {
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
export function UserCard({ user, onToggleBlock, blocking }) {
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
