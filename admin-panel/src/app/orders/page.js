"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const STATUS_TABS = [
  { key: "placed",           label: "Pending",          color: "text-yellow-600", bg: "bg-yellow-100" },
  { key: "out_for_delivery", label: "Out for Delivery",  color: "text-blue-600",   bg: "bg-blue-100"   },
  { key: "delivered",        label: "Delivered",         color: "text-green-600",  bg: "bg-green-100"  },
];

const STATUS_COLORS = {
  placed:           "bg-yellow-100 text-yellow-700",
  out_for_delivery: "bg-blue-100 text-blue-700",
  delivered:        "bg-green-100 text-green-700",
  cancelled:        "bg-red-100 text-red-700",
};

const STATUS_LABELS = {
  placed:           "Pending",
  out_for_delivery: "Out for Delivery",
  delivered:        "Delivered",
  cancelled:        "Cancelled",
};

export default function OrdersPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("placed");
  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin-token");
      const res   = await fetch(`${API_URL}/api/orders?limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setOrders(data.orders);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  // Filter by tab first, then by search query
  const tabFiltered = orders.filter(o => o.orderStatus === activeTab);

  const filteredOrders = search.trim() === "" ? tabFiltered : tabFiltered.filter(order => {
    const q = search.toLowerCase();
    const matchesId       = order._id.slice(-6).toLowerCase().includes(q);
    const matchesName     = order.user?.name?.toLowerCase().includes(q);
    const matchesPhone    = order.user?.phone?.includes(q);
    const matchesCity     = order.deliveryAddress?.city?.toLowerCase().includes(q);
    const matchesPincode  = order.deliveryAddress?.pincode?.includes(q);
    const matchesItem     = order.items.some(i => i.name.toLowerCase().includes(q));
    return matchesId || matchesName || matchesPhone || matchesCity || matchesPincode || matchesItem;
  });

  const counts = {
    placed:           orders.filter(o => o.orderStatus === "placed").length,
    out_for_delivery: orders.filter(o => o.orderStatus === "out_for_delivery").length,
    delivered:        orders.filter(o => o.orderStatus === "delivered").length,
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-0 lg:ml-56">
        <Navbar />
        <div className="p-6">

          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-black">Order Management</h1>
              <p className="text-gray-500 mt-1">Manage customer orders and delivery status.</p>
            </div>

            {/* Search */}
            <div className="flex items-center bg-white border border-gray-200 rounded-2xl px-4 h-12 w-full md:w-80 gap-2 shadow-sm">
              <Search size={18} className="text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Search by ID, name, phone, item..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 outline-none text-black text-sm bg-transparent"
              />
              {search && (
                <button onClick={() => setSearch("")}>
                  <X size={16} className="text-gray-400 hover:text-black" />
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-3 mb-6 flex-wrap">
            {STATUS_TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setSearch(""); }}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-sm transition ${
                  activeTab === tab.key
                    ? `${tab.bg} ${tab.color} shadow-md`
                    : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                {tab.label}
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  activeTab === tab.key ? "bg-white/60" : "bg-gray-100"
                }`}>
                  {counts[tab.key]}
                </span>
              </button>
            ))}
          </div>

          {/* Search result info */}
          {search && (
            <p className="text-sm text-gray-500 mb-4">
              {filteredOrders.length} result{filteredOrders.length !== 1 ? "s" : ""} for
              <span className="font-semibold text-black"> &quot;{search}&quot;</span>
            </p>
          )}

          {/* Orders List */}
          <div className="space-y-4">
            {loading ? (
              <div className="bg-white rounded-2xl p-12 text-center text-gray-400">Loading orders...</div>
            ) : filteredOrders.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center">
                <p className="text-5xl mb-4">{search ? "🔍" : "📦"}</p>
                <p className="text-gray-500 font-semibold">
                  {search ? `No orders matching "${search}"` : `No ${STATUS_TABS.find(t => t.key === activeTab)?.label} orders`}
                </p>
                {search && (
                  <button onClick={() => setSearch("")} className="mt-3 text-red-500 font-semibold text-sm hover:underline">
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              filteredOrders.map(order => (
                <div
                  key={order._id}
                  onClick={() => router.push(`/orders/${order._id}`)}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 flex flex-wrap gap-4 items-center justify-between cursor-pointer hover:border-red-300 hover:shadow-md transition"
                >
                  {/* Left */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-bold text-black text-lg">
                        #{order._id.slice(-6).toUpperCase()}
                      </h3>
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold ${STATUS_COLORS[order.orderStatus]}`}>
                        {STATUS_LABELS[order.orderStatus]}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm mt-1">
                      {order.user?.name || "Customer"}
                      {order.user?.phone ? ` • ${order.user.phone}` : ""}
                      {" • "}
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                    <p className="text-gray-600 text-sm mt-1">
                      {order.items.slice(0, 2).map(i => `${i.name} x${i.quantity}`).join(", ")}
                      {order.items.length > 2 ? ` +${order.items.length - 2} more` : ""}
                    </p>
                  </div>

                  {/* Right */}
                  <div className="text-right">
                    <p className="font-bold text-black text-lg">₹{order.totalPrice}</p>
                    <p className="text-gray-400 text-xs mt-1">{order.paymentMethod} • {order.paymentStatus}</p>
                    <p className="text-red-500 text-sm font-semibold mt-2">View Details →</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}