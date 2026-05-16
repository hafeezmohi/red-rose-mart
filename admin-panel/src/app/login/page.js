"use client";

import { useState } from "react";

import {
    Eye,
    EyeOff,
    Lock,
    Mail,
} from "lucide-react";

import toast from "react-hot-toast";

import { useRouter } from "next/navigation";

export default function LoginPage() {

    const router = useRouter();

    const [showPassword, setShowPassword] =
        useState(false);

    const [formData, setFormData] =
        useState({
            email: "",
            password: "",
        });

    /* Login */
    const handleLogin = () => {

        if (
            !formData.email ||
            !formData.password
        ) {

            toast.error(
                "Please fill all fields"
            );

            return;
        }

        /* Fake Login */
        if (
            formData.email ===
            "admin@gmail.com"

            &&

            formData.password ===
            "admin123"
        ) {

            /* Save Cookie */
            document.cookie =
                "admin-auth=true; path=/";

            toast.success(
                "Login successful!"
            );

            setTimeout(() => {

                router.push("/");

            }, 1000);

        }

        else {

            toast.error(
                "Invalid credentials"
            );
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">

            <div className="w-full max-w-6xl bg-white rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-2">

                {/* Left */}
                <div className="bg-red-500 p-10 lg:p-16 flex flex-col justify-center text-white relative overflow-hidden">

                    {/* Background */}
                    <div className="absolute w-72 h-72 rounded-full bg-white/10 -top-20 -left-20"></div>

                    <div className="absolute w-96 h-96 rounded-full bg-white/10 -bottom-40 -right-40"></div>

                    <div className="relative z-10">

                        <h1 className="text-3xl lg:text-6xl font-bold leading-tight">

                            Red Rose
                            <br />
                            Mart

                        </h1>

                        <p className="mt-6 text-base text-white/90 leading-relaxed">

                            Manage products, orders,
                            customers, analytics and
                            settings in one powerful
                            admin dashboard.

                        </p>

                        {/* Features */}
                        <div className="mt-10 space-y-4">

                            <div className="flex items-center gap-3">

                                <div className="w-3 h-3 rounded-full bg-white"></div>

                                <span className="text-lg">
                                    Inventory Management
                                </span>

                            </div>

                            <div className="flex items-center gap-3">

                                <div className="w-3 h-3 rounded-full bg-white"></div>

                                <span className="text-lg">
                                    Real Time Analytics
                                </span>

                            </div>

                            <div className="flex items-center gap-3">

                                <div className="w-3 h-3 rounded-full bg-white"></div>

                                <span className="text-lg">
                                    Order Tracking System
                                </span>

                            </div>

                        </div>

                    </div>

                </div>

                {/* Right */}
                <div className="p-10 lg:p-16 flex flex-col justify-center">

                    {/* Heading */}
                    <div className="mb-10">

                        <h2 className="text-4xl font-bold text-black">
                            Welcome Back 👋
                        </h2>

                        <p className="text-gray-500 mt-3 text-lg">
                            Login to continue to dashboard
                        </p>

                    </div>

                    {/* Email */}
                    <div className="mb-5">

                        <label className="text-black font-medium block mb-2">
                            Email Address
                        </label>

                        <div className="flex items-center border border-gray-300 rounded-2xl px-4 h-14">

                            <Mail
                                size={20}
                                className="text-gray-500"
                            />

                            <input
                                type="email"
                                placeholder="Enter email"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        email:
                                            e.target.value,
                                    })
                                }
                                className="w-full outline-none px-3 text-black"
                            />

                        </div>

                    </div>

                    {/* Password */}
                    <div className="mb-5">

                        <label className="text-black font-medium block mb-2">
                            Password
                        </label>

                        <div className="flex items-center border border-gray-300 rounded-2xl px-4 h-14">

                            <Lock
                                size={20}
                                className="text-gray-500"
                            />

                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                placeholder="Enter password"
                                value={formData.password}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        password:
                                            e.target.value,
                                    })
                                }
                                className="w-full outline-none px-3 text-black"
                            />

                            <button
                                onClick={() =>
                                    setShowPassword(
                                        !showPassword
                                    )
                                }
                            >

                                {showPassword

                                    ? (
                                        <EyeOff
                                            size={20}
                                            className="text-gray-500"
                                        />
                                    )

                                    : (
                                        <Eye
                                            size={20}
                                            className="text-gray-500"
                                        />
                                    )
                                }

                            </button>

                        </div>

                    </div>

                    {/* Remember */}
                    <div className="flex justify-between items-center mb-8">

                        <div className="flex items-center gap-2">

                            <input type="checkbox" />

                            <span className="text-gray-600">
                                Remember me
                            </span>

                        </div>

                        <button className="text-red-500 font-semibold">

                            Forgot Password?

                        </button>

                    </div>

                    {/* Login Button */}
                    <button
                        onClick={handleLogin}
                        className="bg-red-500 hover:bg-red-600 text-white h-14 rounded-2xl font-semibold text-lg transition"
                    >

                        Login

                    </button>

                    {/* Demo */}
                    <div className="mt-8 bg-gray-100 rounded-2xl p-5">

                        <h3 className="font-bold text-black mb-3">
                            Demo Credentials
                        </h3>

                        <p className="text-gray-600">
                            Email:
                            <span className="font-semibold text-black">
                                {" "}
                                admin@gmail.com
                            </span>
                        </p>

                        <p className="text-gray-600 mt-1">
                            Password:
                            <span className="font-semibold text-black">
                                {" "}
                                admin123
                            </span>
                        </p>

                    </div>

                </div>

            </div>

        </div>
    );
}