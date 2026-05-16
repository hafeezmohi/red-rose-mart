"use client";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import {
    TrendingUp,
    DollarSign,
    ShoppingBag,
    Users,
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

export default function AnalyticsPage() {

    const revenueData = [
        { month: "Jan", revenue: 4000, orders: 240 },
        { month: "Feb", revenue: 3000, orders: 180 },
        { month: "Mar", revenue: 5000, orders: 300 },
        { month: "Apr", revenue: 4500, orders: 260 },
        { month: "May", revenue: 7000, orders: 400 },
        { month: "Jun", revenue: 6500, orders: 350 },
    ];

    return (
        <div className="flex bg-gray-100 min-h-screen">

            {/* Sidebar */}
            <Sidebar />

            {/* Main */}
            <div className="flex-1 ml-0 lg:ml-56 pt-16 lg:pt-0">

                {/* Navbar */}
                <Navbar />

                {/* Content */}
                <div className="p-6">

                    {/* Header */}
                    <div className="mb-8">

                        <h1 className="text-4xl font-bold text-black">
                            Analytics
                        </h1>

                        <p className="text-gray-500 mt-2 text-lg">
                            Monitor store performance and growth
                        </p>

                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">

                        {/* Revenue */}
                        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">

                            <div className="flex justify-between items-start">

                                <div>

                                    <p className="text-gray-500">
                                        Total Revenue
                                    </p>

                                    <h2 className="text-4xl font-bold text-black mt-2">
                                        ₹2.5L
                                    </h2>

                                </div>

                                <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center">

                                    <DollarSign className="text-green-600" />

                                </div>

                            </div>

                            <p className="text-green-500 mt-4 font-semibold">
                                +12.5% growth
                            </p>

                        </div>

                        {/* Orders */}
                        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">

                            <div className="flex justify-between items-start">

                                <div>

                                    <p className="text-gray-500">
                                        Total Orders
                                    </p>

                                    <h2 className="text-4xl font-bold text-black mt-2">
                                        1,250
                                    </h2>

                                </div>

                                <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">

                                    <ShoppingBag className="text-blue-600" />

                                </div>

                            </div>

                            <p className="text-blue-500 mt-4 font-semibold">
                                +8.2% growth
                            </p>

                        </div>

                        {/* Customers */}
                        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">

                            <div className="flex justify-between items-start">

                                <div>

                                    <p className="text-gray-500">
                                        Customers
                                    </p>

                                    <h2 className="text-4xl font-bold text-black mt-2">
                                        850
                                    </h2>

                                </div>

                                <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center">

                                    <Users className="text-purple-600" />

                                </div>

                            </div>

                            <p className="text-purple-500 mt-4 font-semibold">
                                +5.4% growth
                            </p>

                        </div>

                        {/* Conversion */}
                        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">

                            <div className="flex justify-between items-start">

                                <div>

                                    <p className="text-gray-500">
                                        Conversion Rate
                                    </p>

                                    <h2 className="text-4xl font-bold text-black mt-2">
                                        68%
                                    </h2>

                                </div>

                                <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center">

                                    <TrendingUp className="text-red-600" />

                                </div>

                            </div>

                            <p className="text-red-500 mt-4 font-semibold">
                                +3.1% growth
                            </p>

                        </div>

                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                        {/* Revenue Chart */}
                        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">

                            <div className="flex justify-between items-center mb-6">

                                <h2 className="text-2xl font-bold text-black">
                                    Revenue Overview
                                </h2>

                                <button className="bg-black text-white px-4 py-2 rounded-xl font-semibold">
                                    Export
                                </button>

                            </div>

                            <ResponsiveContainer width="100%" height={250}>

                                <LineChart data={revenueData}>

                                    <CartesianGrid strokeDasharray="3 3" />

                                    <XAxis dataKey="month" />

                                    <YAxis />

                                    <Tooltip />

                                    <Line
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#ef4444"
                                        strokeWidth={4}
                                    />

                                </LineChart>

                            </ResponsiveContainer>

                        </div>

                        {/* Orders Chart */}
                        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">

                            <div className="flex justify-between items-center mb-6">

                                <h2 className="text-2xl font-bold text-black">
                                    Orders Analytics
                                </h2>

                                <button className="bg-black text-white px-4 py-2 rounded-xl font-semibold">
                                    Download
                                </button>

                            </div>

                            <ResponsiveContainer width="100%" height={250}>

                                <BarChart data={revenueData}>

                                    <CartesianGrid strokeDasharray="3 3" />

                                    <XAxis dataKey="month" />

                                    <YAxis />

                                    <Tooltip />

                                    <Bar
                                        dataKey="orders"
                                        fill="#ef4444"
                                        radius={[10, 10, 0, 0]}
                                    />

                                </BarChart>

                            </ResponsiveContainer>

                        </div>

                    </div>

                    {/* Bottom Cards */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-8">

                        {/* Top Product */}
                        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">

                            <h2 className="text-2xl font-bold text-black mb-5">
                                Top Products
                            </h2>

                            <div className="space-y-5">

                                <div className="flex justify-between items-center">

                                    <div>

                                        <h3 className="font-semibold text-black">
                                            Fresh Apples
                                        </h3>

                                        <p className="text-gray-500 text-sm">
                                            Fruits
                                        </p>

                                    </div>

                                    <span className="text-red-500 font-bold">
                                        ₹12K
                                    </span>

                                </div>

                                <div className="flex justify-between items-center">

                                    <div>

                                        <h3 className="font-semibold text-black">
                                            Milk Pack
                                        </h3>

                                        <p className="text-gray-500 text-sm">
                                            Dairy
                                        </p>

                                    </div>

                                    <span className="text-red-500 font-bold">
                                        ₹8K
                                    </span>

                                </div>

                                <div className="flex justify-between items-center">

                                    <div>

                                        <h3 className="font-semibold text-black">
                                            Potato Chips
                                        </h3>

                                        <p className="text-gray-500 text-sm">
                                            Snacks
                                        </p>

                                    </div>

                                    <span className="text-red-500 font-bold">
                                        ₹6K
                                    </span>

                                </div>

                            </div>

                        </div>

                        {/* Traffic */}
                        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">

                            <h2 className="text-2xl font-bold text-black mb-5">
                                Traffic Sources
                            </h2>

                            <div className="space-y-5">

                                <div>

                                    <div className="flex justify-between mb-2">

                                        <span className="text-black font-medium">
                                            Direct
                                        </span>

                                        <span className="text-gray-500">
                                            45%
                                        </span>

                                    </div>

                                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">

                                        <div className="w-[45%] h-full bg-red-500 rounded-full"></div>

                                    </div>

                                </div>

                                <div>

                                    <div className="flex justify-between mb-2">

                                        <span className="text-black font-medium">
                                            Social Media
                                        </span>

                                        <span className="text-gray-500">
                                            30%
                                        </span>

                                    </div>

                                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">

                                        <div className="w-[30%] h-full bg-blue-500 rounded-full"></div>

                                    </div>

                                </div>

                                <div>

                                    <div className="flex justify-between mb-2">

                                        <span className="text-black font-medium">
                                            Search Engine
                                        </span>

                                        <span className="text-gray-500">
                                            25%
                                        </span>

                                    </div>

                                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">

                                        <div className="w-[25%] h-full bg-green-500 rounded-full"></div>

                                    </div>

                                </div>

                            </div>

                        </div>

                        {/* Performance */}
                        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">

                            <h2 className="text-2xl font-bold text-black mb-5">
                                Performance
                            </h2>

                            <div className="space-y-5">

                                <div className="flex justify-between items-center">

                                    <span className="text-gray-600">
                                        Server Uptime
                                    </span>

                                    <span className="font-bold text-green-500">
                                        99.9%
                                    </span>

                                </div>

                                <div className="flex justify-between items-center">

                                    <span className="text-gray-600">
                                        Avg Response
                                    </span>

                                    <span className="font-bold text-blue-500">
                                        220ms
                                    </span>

                                </div>

                                <div className="flex justify-between items-center">

                                    <span className="text-gray-600">
                                        Active Users
                                    </span>

                                    <span className="font-bold text-red-500">
                                        1,240
                                    </span>

                                </div>

                                <div className="flex justify-between items-center">

                                    <span className="text-gray-600">
                                        Bounce Rate
                                    </span>

                                    <span className="font-bold text-yellow-500">
                                        18%
                                    </span>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}