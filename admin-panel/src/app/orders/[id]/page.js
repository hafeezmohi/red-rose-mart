"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { ArrowLeft, MapPin, MessageCircle, Truck, XCircle } from "lucide-react";

import { API_URL } from "../../../config";
import PrintableReceipt from "../../../components/PrintableReceipt";

export default function OrderDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const token = localStorage.getItem("admin-token");
                const res = await fetch(`${API_URL}/api/orders/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (data.success) setOrder(data.order);
            } catch (err) {
                console.error("Failed to fetch order:", err);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchOrder();
    }, [id]);

    const handleUpdateStatus = async () => {
        // 1. Trigger the print dialog
        window.print();

        // 2. Ask for confirmation before updating
        // Since window.print() doesn't tell us if the user clicked Print or Cancel, 
        // we manually ask them to confirm if they want to proceed.
        const proceed = window.confirm("Did the receipt print successfully? Click OK to mark as 'Out for Delivery'.");
        
        if (!proceed) {
            return; // Exit if the user clicked cancel or the print failed
        }

        // 3. Proceed with updating the status in the app
        try {
            setUpdating(true);
            const token = localStorage.getItem("admin-token");
            const res = await fetch(`${API_URL}/api/orders/${id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ status: "out_for_delivery" }),
            });
            const data = await res.json();
            if (data.success) {
                setOrder(data.order);
            }
        } catch (err) {
            console.error("Failed to update status:", err);
        } finally {
            setUpdating(false);
        }
    };

    const handleWhatsApp = () => {
        if (!order) return;

        const customerName = order.user?.name || "Customer";
        const phone = order.user?.phone || "";

        const itemsList = order.items
            .map(i => `  • ${i.name} x${i.quantity} = ₹${i.price * i.quantity}`)
            .join("\n");

        const { coordinates, street, city, pincode } = order.deliveryAddress || {};
        const mapsLink = coordinates?.lat && coordinates?.lng
            ? `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`
            : `https://www.google.com/maps/search/${encodeURIComponent(`${street}, ${city}, ${pincode}`)}`;

        const message =
            `🛒 *Red Rose Mart - Order Summary*

📦 Order ID: #${order._id.slice(-6).toUpperCase()}

👤 *Customer Details:*
Name: ${customerName}
Phone: ${phone}

*Items:*
${itemsList}

💰 Items Total: ₹${order.itemsPrice}
🚚 Delivery Fee: ${order.deliveryFee === 0 ? "FREE" : `₹${order.deliveryFee}`}
💵 *Total to Pay: ₹${order.totalPrice}*

📍 *Delivery Address:*
${order.deliveryAddress?.street}, ${order.deliveryAddress?.city} - ${order.deliveryAddress?.pincode}

🗺️ *Location Link:*
${mapsLink}

Payment: ${order.paymentMethod} (${order.paymentStatus === "paid" ? "Paid" : "Pending"})

Thank you for shopping with Red Rose Mart! 🌹`;

        const encoded = encodeURIComponent(message);
        const url = phone
            ? `https://wa.me/91${phone}?text=${encoded}`
            : `https://wa.me/?text=${encoded}`;

        window.open(url, "_blank");
    };

    const handleGoogleMaps = () => {
        if (!order) return;
        const { coordinates, street, city, pincode } = order.deliveryAddress || {};

        const url = coordinates?.lat && coordinates?.lng
            ? `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`
            : `https://www.google.com/maps/search/${encodeURIComponent(`${street}, ${city}, ${pincode}`)}`;

        window.open(url, "_blank");
    };

    if (loading) {
        return (
            <div className="flex bg-gray-100 min-h-screen">
                <Sidebar />
                <div className="flex-1 ml-0 lg:ml-56">
                    <Navbar />
                    <div className="p-6 flex items-center justify-center h-96">
                        <p className="text-gray-400 text-lg">Loading order...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex bg-gray-100 min-h-screen">
                <Sidebar />
                <div className="flex-1 ml-0 lg:ml-56">
                    <Navbar />
                    <div className="p-6 flex items-center justify-center h-96">
                        <p className="text-gray-400 text-lg">Order not found.</p>
                    </div>
                </div>
            </div>
        );
    }

    const isPending = order.orderStatus === "placed";
    const isDelivery = order.orderStatus === "out_for_delivery";

    return (
        <>
            <PrintableReceipt order={order} />

            {/* --- Main Screen Layout (Visible on Screen, Hidden on Print) --- */}
            <div className="flex bg-gray-100 min-h-screen print:hidden">
                <Sidebar />
                <div className="flex-1 ml-0 lg:ml-56">
                    <Navbar />
                    <div className="p-6">

                        {/* Back */}
                        <button
                            onClick={() => router.push("/orders")}
                            className="flex items-center gap-2 text-gray-500 hover:text-black mb-6 transition"
                        >
                            <ArrowLeft size={18} />
                            <span className="font-semibold">Back to Orders</span>
                        </button>

                        {/* Header */}
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-black">
                                    Order #{order._id.slice(-6).toUpperCase()}
                                </h1>
                                <p className="text-gray-500 mt-1">
                                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                        day: "numeric", month: "long", year: "numeric",
                                        hour: "2-digit", minute: "2-digit",
                                    })}
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-3">

                                {/* WhatsApp */}
                                <button
                                    onClick={handleWhatsApp}
                                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-3 rounded-2xl font-semibold transition"
                                >
                                    <MessageCircle size={18} />
                                    Send on WhatsApp
                                </button>

                                {/* Google Maps */}
                                <button
                                    onClick={handleGoogleMaps}
                                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-3 rounded-2xl font-semibold transition"
                                >
                                    <MapPin size={18} />
                                    Open in Maps
                                </button>

                                {/* Update to Out for Delivery — only for pending orders */}
                                {isPending && (
                                    <button
                                        onClick={handleUpdateStatus}
                                        disabled={updating}
                                        className="flex items-center gap-2 bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white px-5 py-3 rounded-2xl font-semibold transition"
                                    >
                                        <Truck size={18} />
                                        {updating ? "Updating..." : "Print & Out for Delivery"}
                                    </button>
                                )}

                                {/* Mark Delivered — only for out_for_delivery */}
                                {isDelivery && (
                                    <button
                                        onClick={() => {
                                            if (!window.confirm("Are you sure you want to mark this order as delivered? This cannot be undone.")) return;
                                            setUpdating(true);
                                            const token = localStorage.getItem("admin-token");
                                            fetch(`${API_URL}/api/orders/${id}/status`, {
                                                method: "PATCH",
                                                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                                                body: JSON.stringify({ status: "delivered" }),
                                            })
                                                .then(res => res.json())
                                                .then(data => { if (data.success) setOrder(data.order); })
                                                .finally(() => setUpdating(false));
                                        }}
                                        disabled={updating}
                                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-5 py-3 rounded-2xl font-semibold transition"
                                    >
                                        {updating ? "Updating..." : "Mark Delivered"}
                                    </button>
                                )}

                                {/* Cancel Order — for pending or out_for_delivery */}
                                {(isPending || isDelivery) && (
                                    <button
                                        onClick={() => {
                                            if (!window.confirm("Are you sure you want to cancel this order? This cannot be undone.")) return;
                                            setUpdating(true);
                                            const token = localStorage.getItem("admin-token");
                                            fetch(`${API_URL}/api/orders/${id}/status`, {
                                                method: "PATCH",
                                                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                                                body: JSON.stringify({ status: "cancelled", reason: "Cancelled by admin due to emergency" }),
                                            })
                                                .then(res => res.json())
                                                .then(data => { if (data.success) setOrder(data.order); })
                                                .finally(() => setUpdating(false));
                                        }}
                                        disabled={updating}
                                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-5 py-3 rounded-2xl font-semibold transition"
                                    >
                                        <XCircle size={18} />
                                        {updating ? "Updating..." : "Cancel Order"}
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                            {/* Items */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-xl font-bold text-black mb-4">
                                    Items ({order.items.length})
                                </h2>
                                <div className="space-y-3">
                                    {order.items.map((item, i) => (
                                        <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                            <div>
                                                <p className="font-semibold text-black">{item.name}</p>
                                                <p className="text-gray-400 text-sm">Qty: {item.quantity} × ₹{item.price}</p>
                                            </div>
                                            <p className="font-bold text-black">₹{item.price * item.quantity}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Bill */}
                                <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                                    <div className="flex justify-between text-gray-500">
                                        <span>Items Total</span><span>₹{order.itemsPrice}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-500">
                                        <span>Delivery Fee</span>
                                        <span className="text-green-600 font-semibold">
                                            {order.deliveryFee === 0 ? "FREE" : `₹${order.deliveryFee}`}
                                        </span>
                                    </div>
                                    <div className="flex justify-between font-bold text-black text-lg pt-2 border-t">
                                        <span>Total</span><span>₹{order.totalPrice}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Delivery & Customer Info */}
                            <div className="space-y-6">

                                {/* Customer */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                    <h2 className="text-xl font-bold text-black mb-4">Customer Info</h2>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-gray-400 text-xs">Name</p>
                                            <p className="text-black font-semibold mt-1">{order.user?.name || "—"}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-xs">Phone</p>
                                            <p className="text-black font-semibold mt-1">{order.user?.phone || "—"}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-xs">Email</p>
                                            <p className="text-black font-semibold mt-1">{order.user?.email || "—"}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Delivery Address */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                    <h2 className="text-xl font-bold text-black mb-4">Delivery Address</h2>
                                    <p className="text-black font-semibold">
                                        {order.deliveryAddress?.street}
                                    </p>
                                    <p className="text-gray-600 mt-1">
                                        {order.deliveryAddress?.city} - {order.deliveryAddress?.pincode}
                                    </p>
                                    {order.deliveryAddress?.coordinates?.lat && (
                                        <p className="text-gray-400 text-xs mt-2">
                                            📌 {order.deliveryAddress.coordinates.lat.toFixed(5)}, {order.deliveryAddress.coordinates.lng.toFixed(5)}
                                        </p>
                                    )}
                                    <button
                                        onClick={handleGoogleMaps}
                                        className="mt-3 flex items-center gap-2 text-blue-500 hover:text-blue-600 font-semibold text-sm"
                                    >
                                        <MapPin size={14} />
                                        Open in Google Maps
                                    </button>
                                </div>

                                {/* Payment */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                    <h2 className="text-xl font-bold text-black mb-4">Payment</h2>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">Method</span>
                                        <span className="font-semibold text-black">{order.paymentMethod}</span>
                                    </div>
                                    <div className="flex justify-between items-center mt-3">
                                        <span className="text-gray-500">Status</span>
                                        <span className={`font-bold ${order.paymentStatus === "paid" ? "text-green-600" : "text-yellow-600"}`}>
                                            {order.paymentStatus === "paid" ? "✅ Paid" : "⏳ Pending"}
                                        </span>
                                    </div>
                                    {order.deliveryOtp && (
                                        <div className="mt-4 pt-4 border-t">
                                            <p className="text-gray-400 text-xs">Delivery OTP</p>
                                            <p className="font-bold text-3xl text-blue-600 tracking-widest mt-1">
                                                {order.deliveryOtp}
                                            </p>
                                        </div>
                                    )}
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}