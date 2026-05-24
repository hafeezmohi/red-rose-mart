"use client";

import { useEffect, useState, useRef } from "react";
import {
  MapPin,
  Package,
  IndianRupee,
  Clock,
  CheckCircle2,
  X,
  Loader2,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function DeliveryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [successId, setSuccessId] = useState(null);
  const inputRefs = useRef([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      // No token needed — public route
      const res = await fetch(`${API_URL}/api/orders/delivery`);
      const data = await res.json();
      setOrders(data.success ? data.orders : []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const openOrder = (order) => {
    setSelectedOrder(order);
    setOtp(["", "", "", ""]);
    setOtpError("");
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setOtp(["", "", "", ""]);
    setOtpError("");
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    setOtpError("");
    if (value && index < 3) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length < 4) {
      setOtpError("Please enter the 4-digit OTP.");
      return;
    }

    setVerifying(true);
    setOtpError("");

    try {
      // No token needed — public route
      const res = await fetch(
        `${API_URL}/api/orders/${selectedOrder._id}/deliver`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ otp: enteredOtp }),
        },
      );

      const data = await res.json();

      if (data.success) {
        setSuccessId(selectedOrder._id);
        setTimeout(() => {
          setOrders((prev) => prev.filter((o) => o._id !== selectedOrder._id));
          setSuccessId(null);
          closeModal();
        }, 1800);
      } else {
        setOtpError(data.message || "Incorrect OTP. Try again.");
      }
    } catch (err) {
      setOtpError("Something went wrong. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-5 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-black">My Deliveries</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {loading
                ? "Loading..."
                : `${orders.length} order${orders.length !== 1 ? "s" : ""} to deliver`}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-xl text-sm font-semibold">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            Out for Delivery
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="max-w-2xl mx-auto p-5 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <Loader2 className="animate-spin mb-3" size={32} />
            <p className="font-medium">Fetching orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <CheckCircle2 size={48} className="mb-3 text-green-400" />
            <p className="text-lg font-semibold text-gray-600">
              All caught up!
            </p>
            <p className="text-sm mt-1">
              No orders out for delivery right now.
            </p>
          </div>
        ) : (
          orders.map((order) => (
            <button
              key={order._id}
              onClick={() => openOrder(order)}
              className="w-full text-left bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:border-blue-300 hover:shadow-md transition-all active:scale-[0.99]"
            >
              {/* Order header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Order ID
                  </span>
                  <h2 className="text-base font-bold text-black mt-0.5">
                    #{order._id.slice(-6).toUpperCase()}
                  </h2>
                </div>
                <div className="text-right">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                      order.paymentMethod === "COD"
                        ? "bg-orange-100 text-orange-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {order.paymentMethod === "COD"
                      ? "💵 Collect Cash"
                      : "✅ Paid Online"}
                  </span>
                  <p className="text-xl font-bold text-black mt-1.5 flex items-center justify-end gap-0.5">
                    <IndianRupee size={16} />
                    {order.totalPrice}
                  </p>
                </div>
              </div>

              {/* Items */}
              <div className="flex items-center gap-2 mb-4">
                <Package size={15} className="text-gray-400 shrink-0" />
                <p className="text-gray-600 text-sm">
                  {order.items
                    .slice(0, 2)
                    .map((i) => i.name)
                    .join(", ")}
                  {order.items.length > 2 && (
                    <span className="text-gray-400">
                      {" "}
                      +{order.items.length - 2} more
                    </span>
                  )}
                </p>
              </div>

              {/* Address */}
              <div className="flex items-start gap-2 bg-gray-50 rounded-xl px-3 py-2.5">
                <MapPin size={15} className="text-red-400 mt-0.5 shrink-0" />
                <p className="text-gray-600 text-sm leading-snug">
                  {order.deliveryAddress?.street}, {order.deliveryAddress?.city}{" "}
                  —{" "}
                  <span className="font-semibold">
                    {order.deliveryAddress?.pincode}
                  </span>
                </p>
              </div>

              {/* Time */}
              <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-400">
                <Clock size={12} />
                {new Date(order.createdAt).toLocaleString("en-IN", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </button>
          ))
        )}
      </div>

      {/* OTP Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl">
            {successId === selectedOrder._id ? (
              /* Success State */
              <div className="flex flex-col items-center py-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <CheckCircle2 size={36} className="text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-black">Delivered!</h3>
                <p className="text-gray-500 text-sm mt-1">
                  Order marked as delivered.
                </p>
              </div>
            ) : (
              <>
                {/* Modal Header */}
                <div className="flex justify-between items-start mb-5">
                  <div>
                    <h3 className="text-lg font-bold text-black">
                      Confirm Delivery
                    </h3>
                    <p className="text-gray-400 text-sm mt-0.5">
                      #{selectedOrder._id.slice(-6).toUpperCase()}
                    </p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 rounded-2xl p-4 mb-5 space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item._id}
                      className="flex justify-between items-center"
                    >
                      <span className="text-sm text-gray-700">
                        {item.name} × {item.quantity}
                      </span>
                      <span className="text-sm font-semibold text-black">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between">
                    <span className="font-bold text-black text-sm">Total</span>
                    <span className="font-bold text-black text-sm">
                      ₹{selectedOrder.totalPrice}
                    </span>
                  </div>
                  {selectedOrder.paymentMethod === "COD" && (
                    <div className="bg-orange-50 border border-orange-200 rounded-xl px-3 py-2 text-center text-sm font-semibold text-orange-600 mt-2">
                      💵 Collect ₹{selectedOrder.totalPrice} from customer
                    </div>
                  )}
                </div>

                {/* OTP Input */}
                <p className="text-sm text-gray-500 text-center mb-3">
                  Ask the customer for their delivery OTP
                </p>

                <div className="flex gap-3 justify-center mb-2">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => (inputRefs.current[i] = el)}
                      type="tel"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className={`w-14 h-14 text-center text-2xl font-bold rounded-2xl border-2 outline-none transition-all
                        ${
                          otpError
                            ? "border-red-400 bg-red-50 text-red-600"
                            : digit
                              ? "border-blue-400 bg-blue-50 text-blue-700"
                              : "border-gray-200 bg-gray-50 text-black focus:border-blue-400 focus:bg-blue-50"
                        }`}
                    />
                  ))}
                </div>

                {otpError && (
                  <p className="text-center text-red-500 text-sm font-medium mb-3">
                    {otpError}
                  </p>
                )}

                <button
                  onClick={handleVerify}
                  disabled={verifying || otp.some((d) => !d)}
                  className="w-full mt-3 bg-black text-white font-bold py-4 rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  {verifying ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Confirm Delivery"
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
