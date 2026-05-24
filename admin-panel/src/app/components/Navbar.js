"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect } from "react";
import { Bell, Search, User, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const [openNotifications, setOpenNotifications] = useState(false);
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

  const notifications = [
    { title: "New Order Received", time: "2 min ago" },
    { title: "Product Stock Low", time: "10 min ago" },
    { title: "New User Joined", time: "30 min ago" },
  ];

  return (
    <div className="h-20 bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-40">

      <h1 className="text-3xl font-bold text-black">Admin Dashboard</h1>

      <div className="flex items-center gap-4">

        <div className="hidden md:flex items-center bg-gray-100 rounded-xl px-4 h-12 w-72">
          <Search size={18} className="text-gray-500" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent outline-none px-3 w-full text-black"
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setOpenNotifications(!openNotifications)}
            className="relative w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 transition flex items-center justify-center"
          >
            <Bell size={20} />
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              3
            </div>
          </button>

          {openNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-bold text-lg text-black">Notifications</h2>
              </div>
              {notifications.map((n, i) => (
                <div key={i} className="p-4 hover:bg-gray-50 border-b border-gray-100 transition">
                  <h3 className="font-semibold text-black">{n.title}</h3>
                  <p className="text-gray-500 text-sm mt-1">{n.time}</p>
                </div>
              ))}
            </div>
          )}
        </div>

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