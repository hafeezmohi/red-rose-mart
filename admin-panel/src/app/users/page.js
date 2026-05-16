"use client";

import { useState } from "react";

import toast from "react-hot-toast";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import {
    Search,
    UserPlus,
    ShieldCheck,
    Ban,
} from "lucide-react";

export default function UsersPage() {

    const [search, setSearch] =
        useState("");

    const [users, setUsers] =
        useState([
            {
                id: 1,
                name: "Rahul Sharma",
                email: "rahul@gmail.com",
                role: "Customer",
                status: "Active",
                joined: "12 May 2026",
            },

            {
                id: 2,
                name: "Neha Verma",
                email: "neha@gmail.com",
                role: "Customer",
                status: "Blocked",
                joined: "10 May 2026",
            },

            {
                id: 3,
                name: "Aman Patel",
                email: "aman@gmail.com",
                role: "Manager",
                status: "Active",
                joined: "8 May 2026",
            },

            {
                id: 4,
                name: "Vikram Mehta",
                email: "vikram@gmail.com",
                role: "Customer",
                status: "Active",
                joined: "7 May 2026",
            },
        ]);

    /* Search */
    const filteredUsers =
        users.filter((user) =>
            user.name
                .toLowerCase()
                .includes(
                    search.toLowerCase()
                )
        );

    /* Toggle Status */
    const toggleStatus = (id) => {

        const updatedUsers =
            users.map((user) =>

                user.id === id

                    ? {
                        ...user,
                        status:
                            user.status === "Active"
                                ? "Blocked"
                                : "Active",
                    }

                    : user
            );

        setUsers(updatedUsers);

        toast.success(
            "User status updated"
        );
    };

    return (
        <div className="flex bg-gray-100 min-h-screen">

            {/* Sidebar */}
            <Sidebar />

            {/* Main */}
            <div className="flex-1 ml-0 lg:ml-56 pt-16 lg:pt-0">

                {/* Navbar */}
                <Navbar />

                {/* Content */}
                <div className="p-6">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">

                        <div>

                            <h1 className="text-4xl font-bold text-black">
                                Users
                            </h1>

                            <p className="text-gray-500 mt-1">
                                Manage customers and staff
                            </p>

                        </div>

                        <button className="bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-xl font-semibold transition flex items-center gap-2">

                            <UserPlus size={20} />

                            Add User

                        </button>

                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">

                        <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-200">

                            <p className="text-gray-500">
                                Total Users
                            </p>

                            <h2 className="text-4xl font-bold text-black mt-2">
                                {users.length}
                            </h2>

                        </div>

                        <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-200">

                            <p className="text-gray-500">
                                Active Users
                            </p>

                            <h2 className="text-4xl font-bold text-green-600 mt-2">

                                {
                                    users.filter(
                                        (user) =>
                                            user.status === "Active"
                                    ).length
                                }

                            </h2>

                        </div>

                        <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-200">

                            <p className="text-gray-500">
                                Blocked Users
                            </p>

                            <h2 className="text-4xl font-bold text-red-500 mt-2">

                                {
                                    users.filter(
                                        (user) =>
                                            user.status === "Blocked"
                                    ).length
                                }

                            </h2>

                        </div>

                    </div>

                    {/* Search */}
                    <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-200 mb-6">

                        <div className="flex items-center bg-gray-100 rounded-xl px-4 h-14">

                            <Search
                                size={20}
                                className="text-gray-500"
                            />

                            <input
                                type="text"
                                placeholder="Search users..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                                className="bg-transparent outline-none px-3 w-full text-black"
                            />

                        </div>

                    </div>

                    {/* Users Table */}
                    <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">

                        <div className="overflow-x-auto">

                            <table className="w-full">

                                <thead className="bg-gray-50 border-b border-gray-200">

                                    <tr className="text-left text-black">

                                        <th className="p-5 font-bold">
                                            User
                                        </th>

                                        <th className="p-5 font-bold">
                                            Role
                                        </th>

                                        <th className="p-5 font-bold">
                                            Status
                                        </th>

                                        <th className="p-5 font-bold">
                                            Joined
                                        </th>

                                        <th className="p-5 font-bold">
                                            Actions
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {filteredUsers.map((user) => (

                                        <tr
                                            key={user.id}
                                            className="border-b border-gray-200 hover:bg-gray-50 transition"
                                        >

                                            {/* User */}
                                            <td className="p-5">

                                                <div className="flex items-center gap-4">

                                                    <div className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center text-white text-base font-bold">

                                                        {user.name.charAt(0)}

                                                    </div>

                                                    <div>

                                                        <h3 className="font-semibold text-black">
                                                            {user.name}
                                                        </h3>

                                                        <p className="text-gray-500 text-sm">
                                                            {user.email}
                                                        </p>

                                                    </div>

                                                </div>

                                            </td>

                                            {/* Role */}
                                            <td className="p-5">

                                                <span className="bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-sm font-semibold">

                                                    {user.role}

                                                </span>

                                            </td>

                                            {/* Status */}
                                            <td className="p-5">

                                                <span
                                                    className={`px-4 py-1 rounded-full text-sm font-semibold

                          ${user.status === "Active"
                                                            ? "bg-green-100 text-green-700"

                                                            : "bg-red-100 text-red-700"
                                                        }
                          `}
                                                >

                                                    {user.status}

                                                </span>

                                            </td>

                                            {/* Joined */}
                                            <td className="p-5 text-black">
                                                {user.joined}
                                            </td>

                                            {/* Actions */}
                                            <td className="p-5">

                                                <div className="flex gap-3">

                                                    <button className="bg-black hover:bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2">

                                                        <ShieldCheck size={16} />

                                                        Role

                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            toggleStatus(
                                                                user.id
                                                            )
                                                        }
                                                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2

                            ${user.status === "Active"

                                                                ? "bg-red-500 hover:bg-red-600 text-white"

                                                                : "bg-green-500 hover:bg-green-600 text-white"
                                                            }
                            `}
                                                    >

                                                        <Ban size={16} />

                                                        {
                                                            user.status === "Active"

                                                                ? "Block"

                                                                : "Unblock"
                                                        }

                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    </div>

                    {/* Empty */}
                    {filteredUsers.length === 0 && (

                        <div className="bg-white rounded-2xl p-10 shadow-md border border-gray-200 text-center mt-6">

                            <h2 className="text-3xl font-bold text-black">
                                No Users Found
                            </h2>

                            <p className="text-gray-500 mt-2">
                                Try another search
                            </p>

                        </div>

                    )}

                </div>

            </div>

        </div>
    );
}