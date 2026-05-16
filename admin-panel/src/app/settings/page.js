"use client";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function SettingsPage() {

    return (
        <div className="flex bg-gray-100 min-h-screen">

            {/* Sidebar */}
            <Sidebar />

            {/* Main */}
            <div className="flex-1 ml-56">

                {/* Navbar */}
                <Navbar />

                {/* Content */}
                <div className="p-6">

                    <div className="bg-white rounded-2xl shadow-md p-6">

                        <h1 className="text-3xl font-bold text-black mb-6">
                            Settings
                        </h1>

                        <div className="flex flex-col gap-4">

                            <button className="bg-black text-white px-5 py-3 rounded-xl text-left">

                                Change Store Name

                            </button>

                            <button className="bg-black text-white px-5 py-3 rounded-xl text-left">

                                Update Phone Number

                            </button>

                            <button className="bg-black text-white px-5 py-3 rounded-xl text-left">

                                Delivery Settings

                            </button>

                            <button className="bg-red-500 text-white px-5 py-3 rounded-xl text-left">

                                Logout

                            </button>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}