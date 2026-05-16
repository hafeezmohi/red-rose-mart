"use client";

import { useState } from "react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import {
    Pencil,
    Trash2,
} from "lucide-react";

export default function ProductsPage() {

    const [products, setProducts] =
        useState([
            {
                id: 1,
                name: "Sugar",
                category: "Grocery",
                variant: "1kg",
                description: "Premium white sugar",
                price: "₹45",
                stock: 25,
                image:
                    "https://images.unsplash.com/photo-1586201375761-83865001e31c",
            },

            {
                id: 2,
                name: "Soap",
                category: "Personal Care",
                variant: "Pack of 4",
                description: "Herbal bathing soap",
                price: "₹120",
                stock: 10,
                image:
                    "https://images.unsplash.com/photo-1607006483225-1f1d6c4d6cdd",
            },
        ]);

    const [name, setName] =
        useState("");

    const [category, setCategory] =
        useState("");

    const [variant, setVariant] =
        useState("");

    const [description, setDescription] =
        useState("");

    const [price, setPrice] =
        useState("");

    const [stock, setStock] =
        useState("");

    const [image, setImage] =
        useState("");

    /* Upload Image */
    const handleImageUpload = (
        event
    ) => {

        const file =
            event.target.files[0];

        if (!file) return;

        const imageUrl =
            URL.createObjectURL(file);

        setImage(imageUrl);
    };

    /* Add Product */
    const addProduct = () => {

        if (
            !name ||
            !category ||
            !variant ||
            !price
        ) {
            alert(
                "Please fill required fields"
            );
            return;
        }

        const newProduct = {
            id: Date.now(),
            name,
            category,
            variant,
            description,
            price,
            stock:
                stock === ""
                    ? null
                    : Number(stock),
            image,
        };

        setProducts([
            ...products,
            newProduct,
        ]);

        setName("");
        setCategory("");
        setVariant("");
        setDescription("");
        setPrice("");
        setStock("");
        setImage("");
    };

    /* Delete Product */
    const deleteProduct = (id) => {

        const updatedProducts =
            products.filter(
                (product) =>
                    product.id !== id
            );

        setProducts(updatedProducts);
    };

    /* Edit Stock */
    const editStock = (id) => {

        const newStock = prompt(
            "Enter new stock quantity"
        );

        if (
            newStock === null ||
            newStock === ""
        ) {
            return;
        }

        const updatedProducts =
            products.map((product) => {

                if (
                    product.id === id
                ) {
                    return {
                        ...product,
                        stock: Number(newStock),
                    };
                }

                return product;
            });

        setProducts(updatedProducts);
    };

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

                    {/* Header */}
                    <div className="mb-8">

                        <h1 className="text-3xl font-bold text-black">
                            Inventory Management
                        </h1>

                        <p className="text-gray-500 mt-2">
                            Add and manage store products.
                        </p>

                    </div>

                    {/* Add Product Form */}
                    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 mb-8">

                        <h2 className="text-2xl font-bold text-black mb-5">
                            Add Product
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">

                            {/* Product Name */}
                            <input
                                type="text"
                                placeholder="Product Name"
                                value={name}
                                onChange={(e) =>
                                    setName(e.target.value)
                                }
                                className="border border-gray-300 rounded-xl px-4 py-3 outline-none"
                            />

                            {/* Category */}
                            <input
                                type="text"
                                placeholder="Category"
                                value={category}
                                onChange={(e) =>
                                    setCategory(
                                        e.target.value
                                    )
                                }
                                className="border border-gray-300 rounded-xl px-4 py-3 outline-none"
                            />

                            {/* Variant */}
                            <input
                                type="text"
                                placeholder="Variant (1kg, Pack of 4)"
                                value={variant}
                                onChange={(e) =>
                                    setVariant(
                                        e.target.value
                                    )
                                }
                                className="border border-gray-300 rounded-xl px-4 py-3 outline-none"
                            />

                            {/* Description */}
                            <input
                                type="text"
                                placeholder="Description"
                                value={description}
                                onChange={(e) =>
                                    setDescription(
                                        e.target.value
                                    )
                                }
                                className="border border-gray-300 rounded-xl px-4 py-3 outline-none"
                            />

                            {/* Price */}
                            <input
                                type="text"
                                placeholder="Price"
                                value={price}
                                onChange={(e) =>
                                    setPrice(
                                        e.target.value
                                    )
                                }
                                className="border border-gray-300 rounded-xl px-4 py-3 outline-none"
                            />

                            {/* Stock */}
                            <input
                                type="number"
                                placeholder="Stock (Optional)"
                                value={stock}
                                onChange={(e) =>
                                    setStock(
                                        e.target.value
                                    )
                                }
                                className="border border-gray-300 rounded-xl px-4 py-3 outline-none"
                            />

                            {/* Image Options */}
                            <div className="flex flex-col gap-2">

                                {/* Gallery Upload */}
                                <label className="border border-gray-300 rounded-xl px-4 py-3 cursor-pointer bg-white text-gray-600 text-sm text-center">

                                    Choose From Gallery

                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={
                                            handleImageUpload
                                        }
                                        className="hidden"
                                    />

                                </label>

                                {/* Image URL */}
                                <input
                                    type="text"
                                    placeholder="Or Paste Image URL"
                                    value={image}
                                    onChange={(e) =>
                                        setImage(
                                            e.target.value
                                        )
                                    }
                                    className="border border-gray-300 rounded-xl px-4 py-3 outline-none"
                                />

                            </div>

                        </div>

                        {/* Image Preview */}
                        {image && (

                            <div className="mt-5">

                                <img
                                    src={image}
                                    alt="Preview"
                                    className="w-28 h-28 rounded-2xl object-cover border border-gray-200"
                                />

                            </div>

                        )}

                        {/* Add Button */}
                        <button
                            onClick={addProduct}
                            className="bg-black text-white px-5 py-3 rounded-xl font-semibold mt-5"
                        >

                            Add Product

                        </button>

                    </div>

                    {/* Products Table */}
                    <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-x-auto">

                        {/* Table Header */}
                        <div className="grid grid-cols-7 gap-4 p-5 bg-gray-50 border-b border-gray-200 font-semibold text-gray-700 min-w-[1100px]">

                            <div>Product</div>

                            <div>Category</div>

                            <div>Variant</div>

                            <div>Description</div>

                            <div>Price</div>

                            <div>Stock</div>

                            <div>Actions</div>

                        </div>

                        {/* Products */}
                        {products.map((product) => (

                            <div
                                key={product.id}
                                className="grid grid-cols-7 gap-4 p-5 border-b border-gray-100 items-center min-w-[1100px]"
                            >

                                {/* Product */}
                                <div className="flex items-center gap-3">

                                    {product.image ? (

                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-16 h-16 rounded-xl object-cover"
                                        />

                                    ) : (

                                        <div className="w-16 h-16 rounded-xl bg-gray-200 flex items-center justify-center text-xs text-gray-500">

                                            No Image

                                        </div>

                                    )}

                                    <div>

                                        <h3 className="font-bold text-black">
                                            {product.name}
                                        </h3>

                                    </div>

                                </div>

                                {/* Category */}
                                <div className="text-gray-600">

                                    {product.category}

                                </div>

                                {/* Variant */}
                                <div className="text-gray-600">

                                    {product.variant}

                                </div>

                                {/* Description */}
                                <div className="text-gray-500 text-sm">

                                    {product.description ||
                                        "No Description"}

                                </div>

                                {/* Price */}
                                <div className="font-semibold text-black">

                                    {product.price}

                                </div>

                                {/* Stock */}
                                <div>

                                    {product.stock === null ? (

                                        <span className="text-gray-400">
                                            Not Added
                                        </span>

                                    ) : product.stock <= 5 ? (

                                        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg font-semibold text-sm">

                                            {product.stock} Left

                                        </span>

                                    ) : (

                                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg font-semibold text-sm">

                                            {product.stock} Available

                                        </span>

                                    )}

                                </div>

                                {/* Actions */}
                                <div className="flex gap-3">

                                    {/* Edit */}
                                    <button
                                        onClick={() =>
                                            editStock(
                                                product.id
                                            )
                                        }
                                        className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center"
                                    >

                                        <Pencil size={18} />

                                    </button>

                                    {/* Delete */}
                                    <button
                                        onClick={() =>
                                            deleteProduct(
                                                product.id
                                            )
                                        }
                                        className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center"
                                    >

                                        <Trash2 size={18} />

                                    </button>

                                </div>

                            </div>

                        ))}

                    </div>

                </div>

            </div>

        </div>
    );
}