export default function Loading() {

    return (
        <div className="min-h-screen bg-black flex items-center justify-center">

            <div className="text-center">

                {/* Logo */}
                <div className="w-28 h-28 rounded-3xl bg-red-500 flex items-center justify-center text-white text-3xl font-bold mx-auto animate-pulse shadow-2xl">

                    R

                </div>

                {/* Brand */}
                <h1 className="text-3xl font-bold text-white mt-8">

                    Red Rose Mart

                </h1>

                <p className="text-gray-400 mt-3 text-lg">

                    Loading Dashboard...

                </p>

                {/* Loader */}
                <div className="flex justify-center gap-3 mt-8">

                    <div className="w-4 h-4 rounded-full bg-red-500 animate-bounce"></div>

                    <div className="w-4 h-4 rounded-full bg-red-500 animate-bounce delay-100"></div>

                    <div className="w-4 h-4 rounded-full bg-red-500 animate-bounce delay-200"></div>

                </div>

            </div>

        </div>
    );
}