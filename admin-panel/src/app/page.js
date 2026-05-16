"use client";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

import {
  ShoppingCart,
  Package,
  AlertTriangle,
  Clock,
} from "lucide-react";

export default function Home() {

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

          {/* Welcome */}
          <div className="mb-8">

            <h1 className="text-3xl font-bold text-black">
              Store Dashboard
            </h1>

            <p className="text-gray-500 mt-2">
              Manage products, stock and orders.
            </p>

          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">

            {/* Products */}
            <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-200">

              <div className="flex justify-between items-center">

                <div>

                  <p className="text-gray-500">
                    Total Products
                  </p>

                  <h2 className="text-3xl font-bold text-black mt-2">
                    85
                  </h2>

                </div>

                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">

                  <Package className="text-blue-600" />

                </div>

              </div>

            </div>

            {/* Orders */}
            <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-200">

              <div className="flex justify-between items-center">

                <div>

                  <p className="text-gray-500">
                    Total Orders
                  </p>

                  <h2 className="text-3xl font-bold text-black mt-2">
                    42
                  </h2>

                </div>

                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">

                  <ShoppingCart className="text-green-600" />

                </div>

              </div>

            </div>

            {/* Low Stock */}
            <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-200">

              <div className="flex justify-between items-center">

                <div>

                  <p className="text-gray-500">
                    Low Stock
                  </p>

                  <h2 className="text-3xl font-bold text-black mt-2">
                    7
                  </h2>

                </div>

                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">

                  <AlertTriangle className="text-red-600" />

                </div>

              </div>

            </div>

            {/* Pending Orders */}
            <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-200">

              <div className="flex justify-between items-center">

                <div>

                  <p className="text-gray-500">
                    Pending Orders
                  </p>

                  <h2 className="text-3xl font-bold text-black mt-2">
                    13
                  </h2>

                </div>

                <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">

                  <Clock className="text-yellow-600" />

                </div>

              </div>

            </div>

          </div>

          {/* Low Stock Alerts */}
          <div className="mb-8">

            <h2 className="text-2xl font-bold text-black mb-5">
              Low Stock Alerts
            </h2>

            <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">

              <div className="divide-y divide-gray-200">

                <div className="p-5 flex justify-between items-center">

                  <div>

                    <h3 className="font-bold text-black">
                      Fresh Milk
                    </h3>

                    <p className="text-gray-500">
                      Dairy Product
                    </p>

                  </div>

                  <span className="bg-red-100 text-red-600 px-4 py-2 rounded-xl font-semibold">
                    Only 2 Left
                  </span>

                </div>

                <div className="p-5 flex justify-between items-center">

                  <div>

                    <h3 className="font-bold text-black">
                      Rice Bag
                    </h3>

                    <p className="text-gray-500">
                      Grocery
                    </p>

                  </div>

                  <span className="bg-yellow-100 text-yellow-600 px-4 py-2 rounded-xl font-semibold">
                    Only 5 Left
                  </span>

                </div>

                <div className="p-5 flex justify-between items-center">

                  <div>

                    <h3 className="font-bold text-black">
                      Bread
                    </h3>

                    <p className="text-gray-500">
                      Bakery
                    </p>

                  </div>

                  <span className="bg-red-100 text-red-600 px-4 py-2 rounded-xl font-semibold">
                    Out Of Stock
                  </span>

                </div>

              </div>

            </div>

          </div>

          {/* Recent Orders */}
          <div className="mb-8">

            <h2 className="text-2xl font-bold text-black mb-5">
              Recent Orders
            </h2>

            <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">

              <div className="divide-y divide-gray-200">

                <div className="p-5 flex justify-between items-center">

                  <div>

                    <h3 className="font-bold text-black">
                      Rahul Sharma
                    </h3>

                    <p className="text-gray-500">
                      2x Milk, 1x Bread
                    </p>

                  </div>

                  <span className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-xl font-semibold">
                    Preparing
                  </span>

                </div>

                <div className="p-5 flex justify-between items-center">

                  <div>

                    <h3 className="font-bold text-black">
                      Priya Verma
                    </h3>

                    <p className="text-gray-500">
                      5kg Rice Bag
                    </p>

                  </div>

                  <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-xl font-semibold">
                    Out For Delivery
                  </span>

                </div>

                <div className="p-5 flex justify-between items-center">

                  <div>

                    <h3 className="font-bold text-black">
                      Arjun Kumar
                    </h3>

                    <p className="text-gray-500">
                      Vegetables Combo
                    </p>

                  </div>

                  <span className="bg-green-100 text-green-700 px-4 py-2 rounded-xl font-semibold">
                    Delivered
                  </span>

                </div>

              </div>

            </div>

          </div>

          {/* Quick Actions */}
          <div>

            <h2 className="text-2xl font-bold text-black mb-5">
              Quick Actions
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              <button className="bg-white rounded-2xl p-5 shadow-md border border-gray-200 text-left">

                <h3 className="text-xl font-bold text-black">
                  Add Product
                </h3>

                <p className="text-gray-500 mt-2">
                  Add new items to inventory
                </p>

              </button>

              <button className="bg-white rounded-2xl p-5 shadow-md border border-gray-200 text-left">

                <h3 className="text-xl font-bold text-black">
                  Update Stock
                </h3>

                <p className="text-gray-500 mt-2">
                  Manage inventory quantity
                </p>

              </button>

              <button className="bg-white rounded-2xl p-5 shadow-md border border-gray-200 text-left">

                <h3 className="text-xl font-bold text-black">
                  View Orders
                </h3>

                <p className="text-gray-500 mt-2">
                  Check recent customer orders
                </p>

              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}