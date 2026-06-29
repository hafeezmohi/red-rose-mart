import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { sendError, sendSuccess } from "../utils/response.js";

const populateCart = (query) =>
  query.populate("items.product", "name images price discountPrice unit isActive");

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res, next) => {
  try {
    let cart = await populateCart(Cart.findOne({ user: req.user._id }));

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    sendSuccess(res, 200, "Cart fetched", { cart });
  } catch (err) {
    next(err);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) return sendError(res, 400, "productId is required");

    // check product exists and is active
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return sendError(res, 404, "Product not found");
    }


    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [{ product: productId, quantity }],
      });
    } else {
      const existingItem = cart.items.find(
        (item) => item.product.toString() === productId
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ product: productId, quantity });
      }

      await cart.save();
    }

    await cart.populate("items.product", "name images price discountPrice unit isActive");
    sendSuccess(res, 200, "Item added to cart", { cart });
  } catch (err) {
    next(err);
  }
};

// @desc    Update item quantity
// @route   PATCH /api/cart/:productId
// @access  Private
export const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const { productId } = req.params;

    if (!quantity || quantity < 1) {
      return sendError(res, 400, "Quantity must be at least 1");
    }

    const product = await Product.findById(productId);
    if (!product) return sendError(res, 404, "Product not found");
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return sendError(res, 404, "Cart not found");

    const item = cart.items.find(
      (item) => item.product.toString() === productId
    );
    if (!item) return sendError(res, 404, "Item not in cart");

    item.quantity = quantity;
    await cart.save();

    await cart.populate("items.product", "name images price discountPrice unit isActive");
    sendSuccess(res, 200, "Cart updated", { cart });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
export const removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return sendError(res, 404, "Cart not found");

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== req.params.productId
    );
    await cart.save();

    await cart.populate("items.product", "name images price discountPrice unit isActive");
    sendSuccess(res, 200, "Item removed", { cart });
  } catch (err) {
    next(err);
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return sendError(res, 404, "Cart not found");

    cart.items = [];
    await cart.save();

    sendSuccess(res, 200, "Cart cleared", { cart });
  } catch (err) {
    next(err);
  }
};