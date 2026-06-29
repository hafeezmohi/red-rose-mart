export function SkeletonRow() {
    return (
        <tr className="border-b border-gray-100 animate-pulse">
            <td className="p-4"><div className="flex items-center gap-3"><div className="w-12 h-12 rounded-xl bg-gray-200 shrink-0" /><div className="h-3 w-24 bg-gray-200 rounded" /></div></td>
            <td className="p-4"><div className="h-3 w-20 bg-gray-200 rounded" /></td>
            <td className="p-4"><div className="h-3 w-14 bg-gray-200 rounded" /></td>
            <td className="p-4"><div className="h-3 w-14 bg-gray-200 rounded" /></td>
            <td className="p-4"><div className="flex gap-2"><div className="w-8 h-8 rounded-lg bg-gray-200" /><div className="w-8 h-8 rounded-lg bg-gray-200" /><div className="w-8 h-8 rounded-lg bg-gray-200" /></div></td>
        </tr>
    );
}

export function SkeletonCard() {
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

// ─── User Skeletons ────────────────────────────────────────────────────────────

export function UserSkeletonRow() {
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

export function UserSkeletonCard() {
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
