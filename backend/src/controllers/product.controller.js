import Product from "../models/Product.js";
import { sendError, sendSuccess } from "../utils/response.js";

// @desc    Get all products (with filters, search, pagination)
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res, next) => {
  try {
    const {
      category,
      search,
      featured,
      sort = "createdAt",
      page = 1,
      limit = 20,
    } = req.query;

    const query = { isActive: true };

    if (category) query.category = category;
    if (featured) query.isFeatured = true;
    if (search) query.name = { $regex: search, $options: "i" };

    const sortOptions = {
      price: { price: 1 },
      "-price": { price: -1 },
      newest: { createdAt: -1 },
      rating: { "ratings.average": -1 },
    };

    const products = await Product.find(query)
      .sort(sortOptions[sort] || { createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Product.countDocuments(query);

    sendSuccess(res, 200, "Products fetched", {
      products,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || !product.isActive) {
      return sendError(res, 404, "Product not found");
    }
    sendSuccess(res, 200, "Product fetched", { product });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all categories
// @route   GET /api/products/categories
// @access  Public
export const getCategories = async (req, res) => {
  const categories = [
    { id: "fruits-vegetables", label: "Fruits & Vegetables" },
    { id: "dairy-eggs", label: "Dairy & Eggs" },
    { id: "rice-grains", label: "Rice & Grains" },
    { id: "snacks", label: "Snacks" },
    { id: "beverages", label: "Beverages" },
    { id: "personal-care", label: "Personal Care" },
    { id: "haircare", label: "Haircare" },
    { id: "household", label: "Household" },
    { id: "frozen", label: "Frozen" },
    { id: "other", label: "Other" },
    { id: "instant-foods", label: "Instant Foods" },
    { id: "oil-masala", label: "Oil & Masala" },
    { id: "beauty-hygiene", label: "Beauty & Hygiene" },
    { id: "offers", label: "Special Offers" },
  ];
  sendSuccess(res, 200, "Categories fetched", { categories });
};

// @desc    Create product (admin only)
// @route   POST /api/products
// @access  Admin
export const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    sendSuccess(res, 201, "Product created", { product });
  } catch (err) {
    next(err);
  }
};

// @desc    Update product (admin only)
// @route   PATCH /api/products/:id
// @access  Admin
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return sendError(res, 404, "Product not found");
    sendSuccess(res, 200, "Product updated", { product });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete product (admin only — hard delete)
// @route   DELETE /api/products/:id
// @access  Admin
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return sendError(res, 404, "Product not found");
    
    product.isActive = false;
    await product.save();
    
    sendSuccess(res, 200, "Product soft-deleted (set to inactive)");
  } catch (err) {
    next(err);
  }
};
