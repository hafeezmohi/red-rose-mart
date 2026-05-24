"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

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

          {/* Credentials hint */}
          <div className="mt-8 bg-gray-100 rounded-2xl p-5">
            <h3 className="font-bold text-black mb-3">Admin Credentials</h3>
            <p className="text-gray-600">
              Email: <span className="font-semibold text-black">admin@redrose</span>
            </p>
            <p className="text-gray-600 mt-1">
              Password: <span className="font-semibold text-black">redrosemart</span>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}