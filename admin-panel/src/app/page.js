"use client";

import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import { ShoppingCart, Package, AlertTriangle, Clock } from "lucide-react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const STATUS_COLORS = {
  placed:           "bg-yellow-100 text-yellow-700",
  confirmed:        "bg-yellow-100 text-yellow-700",
  preparing:        "bg-yellow-100 text-yellow-700",
  out_for_delivery: "bg-blue-100 text-blue-700",
  delivered:        "bg-green-100 text-green-700",
  cancelled:        "bg-red-100 text-red-700",
};

const STATUS_LABELS = {
  placed:           "Pending",
  confirmed:        "Confirmed",
  preparing:        "Preparing",
  out_for_delivery: "Out for Delivery",
  delivered:        "Delivered",
  cancelled:        "Cancelled",
};

export default function Home() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    lowStock: 0,
    pendingOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("admin-token");
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch all in parallel
        const [ordersRes, productsRes] = await Promise.all([
          fetch(`${API_URL}/api/orders?limit=100`, { headers }),
          fetch(`${API_URL}/api/products?limit=100`, { headers }),
        ]);

        const ordersData   = await ordersRes.json();
        const productsData = await productsRes.json();

        const orders   = ordersData.success   ? ordersData.orders   : [];
        const products = productsData.success ? productsData.products : [];

        const pendingOrders  = orders.filter(o => ["placed", "confirmed", "preparing"].includes(o.orderStatus));
        const lowStockItems  = products.filter(p => p.stock <= 5);

        setStats({
          totalProducts: products.length,
          totalOrders:   orders.length,
          lowStock:      lowStockItems.length,
          pendingOrders: pendingOrders.length,
        });

        setRecentOrders(orders.slice(0, 5));
        setLowStockProducts(lowStockItems.slice(0, 5));
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const summaryCards = [
    { label: "Total Products",  value: stats.totalProducts,  icon: Package,      bg: "bg-blue-100",   color: "text-blue-600"   },
    { label: "Total Orders",    value: stats.totalOrders,    icon: ShoppingCart, bg: "bg-green-100",  color: "text-green-600"  },
    { label: "Low Stock",       value: stats.lowStock,       icon: AlertTriangle,bg: "bg-red-100",    color: "text-red-600"    },
    { label: "Pending Orders",  value: stats.pendingOrders,  icon: Clock,        bg: "bg-yellow-100", color: "text-yellow-600" },
  ];

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />

      <div className="flex-1 ml-0 lg:ml-56">
        <Navbar />

        <div className="p-6">

          {/* Welcome */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black">Store Dashboard</h1>
            <p className="text-gray-500 mt-2">Manage products, stock and orders.</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
            {summaryCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="bg-white rounded-2xl p-5 shadow-md border border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-gray-500">{card.label}</p>
                      <h2 className="text-3xl font-bold text-black mt-2">
                        {loading ? "..." : card.value}
                      </h2>
                    </div>
                    <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center`}>
                      <Icon className={card.color} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Low Stock Alerts */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-2xl font-bold text-black">Low Stock Alerts</h2>
              <Link href="/products" className="text-red-500 font-semibold hover:underline">
                View All →
              </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
              {loading ? (
                <div className="p-8 text-center text-gray-400">Loading...</div>
              ) : lowStockProducts.length === 0 ? (
                <div className="p-8 text-center text-gray-400">✅ All products are well stocked</div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {lowStockProducts.map((product) => (
                    <div key={product._id} className="p-5 flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-black">{product.name}</h3>
                        <p className="text-gray-500 capitalize">{product.category}</p>
                      </div>
                      <span className={`px-4 py-2 rounded-xl font-semibold ${
                        product.stock === 0
                          ? "bg-red-100 text-red-600"
                          : product.stock <= 3
                          ? "bg-red-100 text-red-600"
                          : "bg-yellow-100 text-yellow-600"
                      }`}>
                        {product.stock === 0 ? "Out of Stock" : `Only ${product.stock} Left`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-2xl font-bold text-black">Recent Orders</h2>
              <Link href="/orders" className="text-red-500 font-semibold hover:underline">
                View All →
              </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
              {loading ? (
                <div className="p-8 text-center text-gray-400">Loading...</div>
              ) : recentOrders.length === 0 ? (
                <div className="p-8 text-center text-gray-400">No orders yet</div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {recentOrders.map((order) => (
                    <div key={order._id} className="p-5 flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-black">
                          #{order._id.slice(-6).toUpperCase()}
                        </h3>
                        <p className="text-gray-500 text-sm mt-1">
                          {order.items.slice(0, 2).map(i => i.name).join(", ")}
                          {order.items.length > 2 ? ` +${order.items.length - 2} more` : ""}
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric"
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`px-4 py-2 rounded-xl font-semibold text-sm ${STATUS_COLORS[order.orderStatus] || "bg-gray-100 text-gray-700"}`}>
                          {STATUS_LABELS[order.orderStatus] || order.orderStatus}
                        </span>
                        <p className="text-black font-bold mt-2">₹{order.totalPrice}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-2xl font-bold text-black mb-5">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Link href="/products" className="bg-white rounded-2xl p-5 shadow-md border border-gray-200 hover:border-red-300 transition">
                <h3 className="text-xl font-bold text-black">Add Product</h3>
                <p className="text-gray-500 mt-2">Add new items to inventory</p>
              </Link>
              <Link href="/products" className="bg-white rounded-2xl p-5 shadow-md border border-gray-200 hover:border-red-300 transition">
                <h3 className="text-xl font-bold text-black">Update Stock</h3>
                <p className="text-gray-500 mt-2">Manage inventory quantity</p>
              </Link>
              <Link href="/orders" className="bg-white rounded-2xl p-5 shadow-md border border-gray-200 hover:border-red-300 transition">
                <h3 className="text-xl font-bold text-black">View Orders</h3>
                <p className="text-gray-500 mt-2">Check recent customer orders</p>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}