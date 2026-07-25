"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

import { API_URL } from "../../config";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleForgot = async () => {
    if (!forgotEmail.trim()) return toast.error("Please enter admin email");
    try {
      setForgotLoading(true);
      const res = await fetch(`${API_URL}/api/auth/forgot-admin-details`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (!data.success) return toast.error(data.message || "Failed");
      toast.success("Reset link sent to your email!");
      setShowForgot(false);
      setForgotEmail("");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!data.success) {
        toast.error(data.message || "Invalid credentials");
        return;
      }

      // Store token and admin info
      localStorage.setItem("admin-token", data.token);
      localStorage.setItem("admin", JSON.stringify(data.admin));

      // Set cookie for middleware route protection
      document.cookie = `admin-token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}`;

      toast.success("Login successful!");
      setTimeout(() => router.push("/"), 1000);

    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl bg-white rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-2">

        {/* Left — Branding */}
        <div className="bg-red-500 p-10 lg:p-16 flex flex-col justify-center text-white relative overflow-hidden">
          <div className="absolute w-72 h-72 rounded-full bg-white/10 -top-20 -left-20" />
          <div className="absolute w-96 h-96 rounded-full bg-white/10 -bottom-40 -right-40" />
          <div className="relative z-10">
            <h1 className="text-3xl lg:text-6xl font-bold leading-tight">
              Red Rose<br />Mart
            </h1>
            <p className="mt-6 text-base text-white/90 leading-relaxed">
              Manage products, orders, customers, analytics and settings in one powerful admin dashboard.
            </p>
            <div className="mt-10 space-y-4">
              {["Inventory Management", "Real Time Analytics", "Order Tracking System"].map((f) => (
                <div key={f} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-white" />
                  <span className="text-lg">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Login Form */}
        <div className="p-10 lg:p-16 flex flex-col justify-center">
          <div className="mb-10">
            <h2 className="text-4xl font-bold text-black">Welcome Back 👋</h2>
            <p className="text-gray-500 mt-3 text-lg">Login to continue to dashboard</p>
          </div>

          {/* Email */}
          <div className="mb-5">
            <label className="text-black font-medium block mb-2">Email Address</label>
            <div className="flex items-center border border-gray-300 rounded-2xl px-4 h-14">
              <Mail size={20} className="text-gray-500" />
              <input
                type="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                onKeyDown={handleKeyDown}
                className="w-full outline-none px-3 text-black"
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-5">
            <label className="text-black font-medium block mb-2">Password</label>
            <div className="flex items-center border border-gray-300 rounded-2xl px-4 h-14">
              <Lock size={20} className="text-gray-500" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                onKeyDown={handleKeyDown}
                className="w-full outline-none px-3 text-black"
              />
              <button onClick={() => setShowPassword(!showPassword)}>
                {showPassword
                  ? <EyeOff size={20} className="text-gray-500" />
                  : <Eye size={20} className="text-gray-500" />
                }
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white h-14 rounded-2xl font-semibold text-lg transition mt-4"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* Forgot details link */}
          <button
            type="button"
            onClick={() => setShowForgot(true)}
            className="text-red-500 hover:text-red-700 text-sm font-medium mt-3 self-end transition"
          >
            Forgot details?
          </button>
        </div>

      </div>

      {/* Forgot Details Modal */}
      {showForgot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
            <h2 className="text-xl font-bold text-black mb-2">Forgot Details</h2>
            <p className="text-gray-500 text-sm mb-6">
              Enter your admin email. We&apos;ll send a secure link to change your ID or password. The link expires in 10 minutes.
            </p>
            <input
              type="email"
              placeholder="Admin email address"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleForgot()}
              className="w-full border border-gray-300 rounded-xl px-4 h-12 text-black outline-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={handleForgot}
                disabled={forgotLoading}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white h-12 rounded-xl font-semibold transition"
              >
                {forgotLoading ? "Sending..." : "Send Reset Link"}
              </button>
              <button
                onClick={() => { setShowForgot(false); setForgotEmail(""); }}
                className="px-6 border border-gray-300 hover:bg-gray-50 text-black h-12 rounded-xl font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}