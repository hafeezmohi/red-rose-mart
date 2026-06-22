"use client";

import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";

import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  PackageCheck,
  PackageX,
  Clock,
  Truck,
} from "lucide-react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://10.55.36.201:5000";

function fmt(n) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
}

// ── Skeleton blocks ──────────────────────────────────────────────────────────
function StatSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 animate-pulse">
      <div className="flex justify-between items-start">
        <div className="space-y-3">
          <div className="h-3 w-24 bg-gray-200 rounded" />
          <div className="h-8 w-20 bg-gray-200 rounded" />
        </div>
        <div className="w-14 h-14 rounded-2xl bg-gray-200" />
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 animate-pulse">
      <div className="h-5 w-40 bg-gray-200 rounded mb-6" />
      <div className="h-56 bg-gray-100 rounded-xl" />
    </div>
  );
}

// ── Stat card ────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  sub,
  subColor,
}) {
  return (
    <div className="bg-white rounded-2xl p-5 md:p-6 shadow-md border border-gray-200">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm">{label}</p>
          <h2 className="text-2xl md:text-3xl font-bold text-black mt-2">
            {value}
          </h2>
        </div>
        <div
          className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl ${iconBg} flex items-center justify-center shrink-0`}
        >
          <Icon size={22} className={iconColor} />
        </div>
      </div>
      {sub && <p className={`mt-3 text-sm font-semibold ${subColor}`}>{sub}</p>}
    </div>
  );
}

// ── Custom tooltip ────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label, prefix = "" }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-lg text-sm">
      <p className="font-semibold text-black mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {prefix === "₹" ? fmt(p.value) : p.value}
        </p>
      ))}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("today"); // today, week, month

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem("admin-token");
        const res = await fetch(`${API_URL}/api/admin/analytics`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (!json.success) {
          toast.error(json.message || "Failed to load analytics");
          return;
        }
        setData(json.data ?? json);
      } catch {
        toast.error("Network error — could not load analytics");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const s = data?.summary;

  const getPeriodicData = () => {
    if (!s) return { revenue: 0, orders: 0, label: "" };
    if (period === "today") return { revenue: s.revenueToday, orders: s.ordersToday, label: "Today's" };
    if (period === "week") return { revenue: s.revenueWeek, orders: s.ordersWeek, label: "This Week's" };
    if (period === "month") return { revenue: s.revenueMonth, orders: s.ordersMonth, label: "This Month's" };
  };

  const periodicData = getPeriodicData();

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />

      <div className="flex-1 ml-0 lg:ml-56 pt-16 lg:pt-0">
        <Navbar />

        <div className="p-4 md:p-6">
          {/* Header */}
          <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-black">
                Analytics
              </h1>
              <p className="text-gray-500 mt-1 text-sm md:text-base">
                Monitor store performance and growth
              </p>
            </div>
            
            {/* Period Toggle */}
            <div className="flex bg-gray-200/60 p-1 rounded-xl w-fit">
              {["today", "week", "month"].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 capitalize ${
                    period === p
                      ? "bg-white text-black shadow-sm"
                      : "text-gray-500 hover:text-black"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* ── Periodic Stats ── */}
          <div className="grid grid-cols-2 gap-3 md:gap-5 mb-6 md:mb-8">
            {loading ? (
              Array.from({ length: 2 }).map((_, i) => <StatSkeleton key={i} />)
            ) : (
              <>
                <StatCard
                  label={`${periodicData.label} Revenue`}
                  value={fmt(periodicData.revenue)}
                  icon={DollarSign}
                  iconBg="bg-green-100"
                  iconColor="text-green-600"
                  sub="Delivered orders only"
                  subColor="text-green-600/70"
                />
                <StatCard
                  label={`${periodicData.label} Orders`}
                  value={periodicData.orders.toLocaleString("en-IN")}
                  icon={ShoppingBag}
                  iconBg="bg-blue-100"
                  iconColor="text-blue-600"
                  sub="All placed orders"
                  subColor="text-blue-600/70"
                />
              </>
            )}
          </div>

          {/* ── Summary Stats ── */}
          <h2 className="text-xl font-bold text-black mb-4">Overall Lifetime Stats</h2>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-5 mb-6 md:mb-8">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
            ) : (
              <>
                <StatCard
                  label="Total Revenue"
                  value={fmt(s.totalRevenue)}
                  icon={DollarSign}
                  iconBg="bg-gray-200"
                  iconColor="text-gray-700"
                />
                <StatCard
                  label="Total Orders"
                  value={s.totalOrders.toLocaleString("en-IN")}
                  icon={ShoppingBag}
                  iconBg="bg-gray-200"
                  iconColor="text-gray-700"
                />
                <StatCard
                  label="Total Users"
                  value={s.totalUsers.toLocaleString("en-IN")}
                  icon={Users}
                  iconBg="bg-purple-100"
                  iconColor="text-purple-600"
                />
                <StatCard
                  label="Delivered"
                  value={s.deliveredOrders.toLocaleString("en-IN")}
                  icon={PackageCheck}
                  iconBg="bg-red-100"
                  iconColor="text-red-600"
                />
              </>
            )}
          </div>

          {/* ── Order Status Row ── */}
          <h2 className="text-xl font-bold text-black mb-4">Current Order Pipeline</h2>
          <div className="grid grid-cols-3 gap-3 md:gap-5 mb-6 md:mb-8">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <StatSkeleton key={i} />)
            ) : (
              <>
                <StatCard
                  label="Pending"
                  value={s.pendingOrders}
                  icon={Clock}
                  iconBg="bg-yellow-100"
                  iconColor="text-yellow-600"
                />
                <StatCard
                  label="Out for Delivery"
                  value={s.outForDelivery}
                  icon={Truck}
                  iconBg="bg-blue-100"
                  iconColor="text-blue-600"
                />
                <StatCard
                  label="Cancelled"
                  value={s.cancelledOrders}
                  icon={PackageX}
                  iconBg="bg-red-100"
                  iconColor="text-red-600"
                />
              </>
            )}
          </div>

          {/* ── Charts ── */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-6 md:mb-8">
            {/* Revenue chart */}
            {loading ? (
              <ChartSkeleton />
            ) : (
              <div className="bg-white rounded-2xl p-5 md:p-6 shadow-md border border-gray-200">
                <h2 className="text-xl md:text-2xl font-bold text-black mb-5">
                  Revenue — Last 6 Months
                </h2>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={data.chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis
                      tickFormatter={(v) => fmt(v)}
                      tick={{ fontSize: 11 }}
                      width={55}
                    />
                    <Tooltip content={<CustomTooltip prefix="₹" />} />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      name="Revenue"
                      stroke="#ef4444"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#ef4444" }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Orders chart */}
            {loading ? (
              <ChartSkeleton />
            ) : (
              <div className="bg-white rounded-2xl p-5 md:p-6 shadow-md border border-gray-200">
                <h2 className="text-xl md:text-2xl font-bold text-black mb-5">
                  Orders — Last 6 Months
                </h2>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={data.chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="orders"
                      name="Orders"
                      fill="#ef4444"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* New users chart */}
            {loading ? (
              <ChartSkeleton />
            ) : (
              <div className="bg-white rounded-2xl p-5 md:p-6 shadow-md border border-gray-200">
                <h2 className="text-xl md:text-2xl font-bold text-black mb-5">
                  New Users — Last 6 Months
                </h2>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={data.chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="newUsers"
                      name="New Users"
                      fill="#8b5cf6"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Top Products */}
            {loading ? (
              <ChartSkeleton />
            ) : (
              <div className="bg-white rounded-2xl p-5 md:p-6 shadow-md border border-gray-200">
                <h2 className="text-xl md:text-2xl font-bold text-black mb-5">
                  Top Products by Revenue
                </h2>

                {data.topProducts.length === 0 ? (
                  <p className="text-gray-400 text-sm">
                    No delivered orders yet
                  </p>
                ) : (
                  <div className="space-y-4">
                    {data.topProducts.map((p, i) => {
                      const max = data.topProducts[0].revenue;
                      const pct = Math.round((p.revenue / max) * 100);
                      return (
                        <div key={p.name}>
                          <div className="flex justify-between items-center mb-1.5">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-xs font-bold text-gray-400 w-4 shrink-0">
                                #{i + 1}
                              </span>
                              <span className="font-semibold text-black text-sm truncate">
                                {p.name}
                              </span>
                            </div>
                            <div className="text-right shrink-0 ml-3">
                              <span className="font-bold text-red-500 text-sm">
                                {fmt(p.revenue)}
                              </span>
                              <span className="text-gray-400 text-xs ml-1">
                                ({p.quantity} sold)
                              </span>
                            </div>
                          </div>
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-red-500 rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
