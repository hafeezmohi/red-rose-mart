import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendError, sendSuccess } from "../utils/response.js";
import Product from "../models/Product.js";

export const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return sendError(res, 400, "Email and password are required");

    const user = await User.findOne({ email, role: "admin" }).select(
      "+password",
    );
    if (!user) return sendError(res, 401, "Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return sendError(res, 401, "Invalid credentials");

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    sendSuccess(res, 200, "Login successful", {
      token,
      admin: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    next(err);
  }
};

// @desc  Get all users — paginated, searchable
// @route GET /api/admin/users?page=1&limit=25&search=&role=&isBlocked=
// @access Admin
export const getUsers = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 25);
    const skip = (page - 1) * limit;
    const search = req.query.search?.trim() || "";
    const role = req.query.role || "";
    const isBlocked = req.query.isBlocked;

    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    if (role) filter.role = role;
    if (isBlocked !== undefined) filter.isBlocked = isBlocked === "true";

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-__v -password -pushToken")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    sendSuccess(res, 200, "Users fetched", {
      users,
      pagination: {
        total,
        page,
        limit,
        hasMore: skip + users.length < total,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc  Block / unblock a user
// @route PATCH /api/admin/users/:id/block
// @access Admin
export const toggleBlockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, 404, "User not found");
    if (user.role === "admin")
      return sendError(res, 403, "Cannot block an admin");

    user.isBlocked = !user.isBlocked;
    await user.save();

    sendSuccess(res, 200, `User ${user.isBlocked ? "blocked" : "unblocked"}`, {
      user: { id: user._id, isBlocked: user.isBlocked },
    });
  } catch (err) {
    next(err);
  }
};

// @desc  Get ALL products for admin (including inactive)
// @route GET /api/admin/products?page=&search=&category=&isFeatured=&isActive=
// @access Admin
export const getAdminProducts = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = 25;
    const skip = (page - 1) * limit;
    const search = req.query.search?.trim() || "";
    const category = req.query.category || "";
    const { isFeatured, isActive } = req.query;

    const filter = {};
    if (search) filter.name = { $regex: search, $options: "i" };
    if (category) filter.category = category;
    if (isFeatured !== undefined) filter.isFeatured = isFeatured === "true";
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const [products, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Product.countDocuments(filter),
    ]);

    sendSuccess(res, 200, "Products fetched", {
      products,
      pagination: {
        total,
        page,
        limit,
        hasMore: skip + products.length < total,
      },
    });
  } catch (err) {
    next(err);
  }
};
