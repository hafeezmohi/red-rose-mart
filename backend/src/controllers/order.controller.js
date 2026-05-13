import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { sendError, sendSuccess } from "../utils/response.js";

// @desc    Place order from cart
// @route   POST /api/orders
// @access  Private
export const placeOrder = async (req, res, next) => {
  try {
    const { deliveryAddress } = req.body;

    if (!deliveryAddress) {
      return sendError(res, 400, "Delivery address is required");
    }

    const { street, city, pincode } = deliveryAddress;
    if (!street || !city || !pincode) {
      return sendError(res, 400, "Street, city and pincode are required");
    }

    // get cart
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product"
    );

    if (!cart || cart.items.length === 0) {
      return sendError(res, 400, "Cart is empty");
    }

    // validate stock and build order items
    const orderItems = [];
    for (const item of cart.items) {
      const product = item.product;

      if (!product || !product.isActive) {
        return sendError(res, 400, `Product ${product?.name} is no longer available`);
      }

      if (product.stock < item.quantity) {
        return sendError(res, 400, `Only ${product.stock} units of ${product.name} in stock`);
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images?.[0] || "",
        price: product.discountPrice || product.price,
        quantity: item.quantity,
      });
    }

    // calculate prices
    const itemsPrice = orderItems.reduce(
      (total, item) => total + item.price * item.quantity, 0
    );
    const deliveryFee = 40;
    const totalPrice = itemsPrice + deliveryFee;

    // create order
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      deliveryAddress,
      itemsPrice,
      deliveryFee,
      totalPrice,
      paymentMethod: "COD",
    });

    // deduct stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity },
      });
    }

    // clear cart
    cart.items = [];
    await cart.save();

    sendSuccess(res, 201, "Order placed successfully", { order });
  } catch (err) {
    next(err);
  }
};

// @desc    Get my orders
// @route   GET /api/orders/my
// @access  Private
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    sendSuccess(res, 200, "Orders fetched", { orders });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
export const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) return sendError(res, 404, "Order not found");

    // user can only see their own orders
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return sendError(res, 403, "Not authorized");
    }

    sendSuccess(res, 200, "Order fetched", { order });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel order
// @route   PATCH /api/orders/:id/cancel
// @access  Private
export const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) return sendError(res, 404, "Order not found");

    if (order.user.toString() !== req.user._id.toString()) {
      return sendError(res, 403, "Not authorized");
    }

    if (!["placed", "confirmed"].includes(order.orderStatus)) {
      return sendError(res, 400, "Order cannot be cancelled at this stage");
    }

    // restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }

    order.orderStatus = "cancelled";
    order.cancelledAt = new Date();
    order.cancellationReason = req.body.reason || "Cancelled by user";
    await order.save();

    sendSuccess(res, 200, "Order cancelled", { order });
  } catch (err) {
    next(err);
  }
};

// ---- ADMIN ----

// @desc    Get all orders
// @route   GET /api/orders
// @access  Admin
export const getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { orderStatus: status } : {};

    const orders = await Order.find(query)
      .populate("user", "name email phone")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Order.countDocuments(query);

    sendSuccess(res, 200, "Orders fetched", {
      orders,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Admin
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const validStatuses = ["confirmed", "preparing", "out_for_delivery", "delivered"];
    if (!validStatuses.includes(status)) {
      return sendError(res, 400, "Invalid status");
    }

    const order = await Order.findById(req.params.id);
    if (!order) return sendError(res, 404, "Order not found");

    order.orderStatus = status;
    if (status === "delivered") {
      order.deliveredAt = new Date();
      order.paymentStatus = "paid";  // COD paid on delivery
    }
    await order.save();

    sendSuccess(res, 200, "Order status updated", { order });
  } catch (err) {
    next(err);
  }
};