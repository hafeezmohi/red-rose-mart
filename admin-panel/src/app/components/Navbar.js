"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect } from "react";
import { User, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const [adminName, setAdminName] = useState("Admin");

  useEffect(() => {
    try {
      const admin = localStorage.getItem("admin");
      if (admin) {
        const parsed = JSON.parse(admin);
        setAdminName(parsed.name || "Admin");
      }
    } catch (e) {}
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("admin-token");
    localStorage.removeItem("admin");
    document.cookie = "admin-token=; path=/; max-age=0";
    router.push("/login");
  };

  return (
    <div className="h-20 bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-40">
      <h1 className="text-3xl font-bold text-black">Admin Dashboard</h1>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 bg-gray-100 px-4 h-12 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white">
            <User size={18} />
          </div>
          <div className="hidden md:block">
            <h3 className="font-semibold text-black" suppressHydrationWarning>
              {adminName}
            </h3>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-12 h-12 rounded-xl bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </div>
  );
}
