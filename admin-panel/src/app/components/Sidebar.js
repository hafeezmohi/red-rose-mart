"use client";

import { useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const [openSidebar, setOpenSidebar] = useState(false);

  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: LayoutDashboard,
    },

    {
      name: "Products",
      path: "/products",
      icon: Package,
    },

    {
      name: "Orders",
      path: "/orders",
      icon: ShoppingCart,
    },

    {
      name: "Users",
      path: "/users",
      icon: Users,
    },

    {
      name: "Analytics",
      path: "/analytics",
      icon: BarChart3,
    },
  ];

  return (
    <>
      {/* Mobile Topbar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-black flex items-center justify-between px-5 z-50 border-b border-gray-800">
        <h1 className="text-base font-bold text-red-500">Red Rose Mart</h1>

        <button onClick={() => setOpenSidebar(true)} className="text-white">
          <Menu size={28} />
        </button>
      </div>

      {/* Overlay */}
      {openSidebar && (
        <div
          onClick={() => setOpenSidebar(false)}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen bg-black text-white flex flex-col justify-between shadow-2xl z-50 transition-all duration-300

        ${collapsed ? "w-20" : "w-56"}

        ${openSidebar ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Top */}
        <div>
          {/* Logo */}
          <div className="px-4 py-6 border-b border-gray-800 flex items-center justify-between">
            {!collapsed && (
              <div>
                <h1 className="text-2xl font-bold text-red-500">
                  Red Rose Mart
                </h1>

                <p className="text-gray-400 text-sm mt-1">Admin Panel</p>
              </div>
            )}

            {/* Collapse */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex items-center justify-center w-10 h-10 rounded-lg bg-gray-900 hover:bg-gray-800 transition"
            >
              {collapsed ? (
                <ChevronRight size={20} />
              ) : (
                <ChevronLeft size={20} />
              )}
            </button>

            {/* Mobile Close */}
            <button
              onClick={() => setOpenSidebar(false)}
              className="lg:hidden text-white"
            >
              <X size={24} />
            </button>
          </div>

          {/* Menu */}
          <div className="mt-5 px-3 flex flex-col gap-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.path;

              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.path}
                  onClick={() => setOpenSidebar(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 transform hover:scale-[1.02]

                  ${
                    isActive
                      ? "bg-red-500 text-white shadow-lg"
                      : "text-gray-300 hover:bg-gray-900"
                  }`}
                >
                  <Icon size={22} />

                  {!collapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Bottom */}
        <div className="p-3">
          <div className="bg-gray-900 rounded-xl p-3 flex items-center gap-3 border border-gray-800">
            <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white font-bold">
              A
            </div>

            {!collapsed && (
              <div>
                <h2 className="text-sm font-semibold text-white">Admin</h2>

                <p className="text-gray-400 text-xs">Administrator</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
