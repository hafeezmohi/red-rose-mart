"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Lock, Mail, ArrowLeft, ShieldCheck, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://red-rose-backend.onrender.com";

function ResetDetailsForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [mode, setMode] = useState(null); // "email" | "password"
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error("Invalid or missing token");
    }
  }, [token]);

  const handleSubmit = async () => {
    if (mode === "email") {
      if (!newEmail.trim()) return toast.error("Please enter new email");
    }
    if (mode === "password") {
      if (!newPassword) return toast.error("Please enter new password");
      if (newPassword.length < 6) return toast.error("Password must be at least 6 characters");
      if (newPassword !== confirmPassword) return toast.error("Passwords do not match");
    }

    try {
      setLoading(true);
      const body = { token };
      if (mode === "email") body.newEmail = newEmail;
      if (mode === "password") body.newPassword = newPassword;

      const res = await fetch(`${API_URL}/api/auth/reset-admin-details`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) return toast.error(data.message || "Failed");

      setSuccess(true);
      toast.success(data.message || "Details updated!");
      setTimeout(() => router.push("/login"), 3000);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
          <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-black mb-2">Invalid Link</h1>
          <p className="text-gray-500 mb-6">This reset link is invalid or has expired. Please request a new one.</p>
          <button
            onClick={() => router.push("/login")}
            className="bg-red-500 hover:bg-red-600 text-white h-12 px-8 rounded-xl font-semibold transition"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
          <ShieldCheck size={48} className="text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-black mb-2">Details Updated!</h1>
          <p className="text-gray-500">Redirecting you to login page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mb-4">
            <ShieldCheck size={28} className="text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-black mb-1">Reset Admin Details</h1>
          <p className="text-gray-500 text-sm">Choose what you want to change. This link expires in 10 minutes.</p>
        </div>

        {/* Mode Selection */}
        {!mode && (
          <div className="space-y-3">
            <button
              onClick={() => setMode("email")}
              className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-gray-200 hover:border-red-400 hover:bg-red-50 transition group"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition">
                <Mail size={22} className="text-blue-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-black">Change Email / ID</p>
                <p className="text-sm text-gray-500">Update your admin login email</p>
              </div>
            </button>
            <button
              onClick={() => setMode("password")}
              className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-gray-200 hover:border-red-400 hover:bg-red-50 transition group"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition">
                <Lock size={22} className="text-purple-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-black">Change Password</p>
                <p className="text-sm text-gray-500">Set a new admin password</p>
              </div>
            </button>
          </div>
        )}

        {/* Change Email Form */}
        {mode === "email" && (
          <div>
            <button onClick={() => setMode(null)} className="flex items-center gap-1 text-gray-500 hover:text-black text-sm mb-5 transition">
              <ArrowLeft size={16} /> Back
            </button>
            <label className="text-sm font-semibold text-gray-700 block mb-2">New Email Address</label>
            <input
              type="email"
              placeholder="Enter new admin email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="w-full border border-gray-300 rounded-xl px-4 h-12 text-black outline-none mb-5"
            />
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white h-12 rounded-xl font-semibold transition"
            >
              {loading ? "Updating..." : "Update Email"}
            </button>
          </div>
        )}

        {/* Change Password Form */}
        {mode === "password" && (
          <div>
            <button onClick={() => setMode(null)} className="flex items-center gap-1 text-gray-500 hover:text-black text-sm mb-5 transition">
              <ArrowLeft size={16} /> Back
            </button>
            <label className="text-sm font-semibold text-gray-700 block mb-2">New Password</label>
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 h-12 text-black outline-none mb-4"
            />
            <label className="text-sm font-semibold text-gray-700 block mb-2">Confirm Password</label>
            <input
              type="password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="w-full border border-gray-300 rounded-xl px-4 h-12 text-black outline-none mb-5"
            />
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white h-12 rounded-xl font-semibold transition"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResetDetailsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    }>
      <ResetDetailsForm />
    </Suspense>
  );
}
