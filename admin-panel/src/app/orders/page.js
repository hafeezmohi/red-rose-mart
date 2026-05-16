"use client";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function OrdersPage() {

    const orders = [
        {
            id: "#1021",
            customer: "Rahul Sharma",
            phone: "9876543210",
            items: "2x Milk, 1x Bread",
            total: "₹120",
            status: "Preparing",
        },

        {
            id: "#1022",
            customer: "Priya Verma",
            phone: "9123456780",
            items: "Rice Bag 5kg",
            total: "₹500",
            status: "Out For Delivery",
        },

        {
            id: "#1023",
            customer: "Arjun Kumar",
            phone: "9988776655",
            items: "Vegetables Combo",
            total: "₹240",
            status: "Delivered",
        },
    ];

    return (
        <div className="flex bg-gray-100 min-h-screen">

            {/* Sidebar */}
            <Sidebar />

            {/* Main */}
            <div className="flex-1 ml-0 lg:ml-56">

                {/* Navbar */}
                <Navbar />

                {/* Content */}
                <div className="p-6">

                    {/* Header */}
                    <div className="mb-8">

                        <h1 className="text-3xl font-bold text-black">
                            Order Management
                        </h1>

                        <p className="text-gray-500 mt-2">
                            Manage customer orders and delivery status.
                        </p>

                    </div>

                    {/* Orders Table */}
                    <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">

                        {/* Table Header */}
                        <div className="grid grid-cols-6 gap-4 p-5 bg-gray-50 border-b border-gray-200 font-semibold text-gray-700">

                            <div>Order ID</div>

                            <div>Customer</div>

                            <div>Phone</div>

                            <div>Items</div>

                            <div>Total</div>

                            <div>Status</div>

                        </div>

                        {/* Orders */}
                        {orders.map((order) => (

                            <div
                                key={order.id}
                                className="grid grid-cols-6 gap-4 p-5 border-b border-gray-100 items-center"
                            >

                                {/* Order ID */}
                                <div className="font-semibold text-black">

                                    {order.id}

                                </div>

                                {/* Customer */}
                                <div>

                                    <h3 className="font-bold text-black">
                                        {order.customer}
                                    </h3>

                                </div>

                                {/* Phone */}
                                <div className="text-gray-600">

                                    {order.phone}

                                </div>

                                {/* Items */}
                                <div className="text-gray-600">

                                    {order.items}

                                </div>

                                {/* Total */}
                                <div className="font-semibold text-black">

                                    {order.total}

                                </div>

                                {/* Status */}
                                <div>

                                    {order.status === "Preparing" && (

                                        <span className="bg-yellow-100 text-yellow-700 px-3 py-2 rounded-xl font-semibold text-sm">

                                            Preparing

                                        </span>

                                    )}

                                    {order.status === "Out For Delivery" && (

                                        <span className="bg-blue-100 text-blue-700 px-3 py-2 rounded-xl font-semibold text-sm">

                                            Out For Delivery

                                        </span>

                                    )}

                                    {order.status === "Delivered" && (

                                        <span className="bg-green-100 text-green-700 px-3 py-2 rounded-xl font-semibold text-sm">

                                            Delivered

                                        </span>

                                    )}

                                </div>

                            </div>

                        ))}

                    </div>

                </div>

            </div>

        </div>
    );
}