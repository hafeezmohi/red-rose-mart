import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { sendError, sendSuccess } from "../utils/response.js";
import { sendPushNotification } from "../utils/sendPushNotification.js";

// Generate a random 4-digit OTP as a string
const generateOtp = () => Math.floor(1000 + Math.random() * 9000).toString();

// ─────────────────────────────────────────────
// @desc    Place a new order from the user's cart
// @route   POST /api/orders
// @access  Private (logged-in user)
// ─────────────────────────────────────────────
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

    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
    );

    if (!cart || cart.items.length === 0) {
      return sendError(res, 400, "Cart is empty");
    }

    const orderItems = [];
    for (const item of cart.items) {
      const product = item.product;

      if (!product || !product.isActive) {
        return sendError(
          res,
          400,
          `Product ${product?.name} is no longer available`,
        );
      }

      if (product.stock < item.quantity) {
        return sendError(
          res,
          400,
          `Only ${product.stock} units of ${product.name} in stock`,
        );
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images?.[0] || "",
        price: product.discountPrice || product.price,
        quantity: item.quantity,
      });
    }

    const itemsPrice = orderItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
    const deliveryFee = 0;
    const totalPrice = itemsPrice + deliveryFee;

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      deliveryAddress,
      itemsPrice,
      deliveryFee,
      totalPrice,
      paymentMethod: "COD",
    });

    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity },
      });
    }

    cart.items = [];
    await cart.save();

    sendSuccess(res, 201, "Order placed successfully", { order });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// @desc    Get all orders placed by the logged-in user
// @route   GET /api/orders/my
// @access  Private (logged-in user)
// ─────────────────────────────────────────────
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    sendSuccess(res, 200, "Orders fetched", { orders });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// @desc    Get a single order by ID
// @route   GET /api/orders/:id
// @access  Private (owner or admin)
// ─────────────────────────────────────────────
export const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email phone");

    if (!order) return sendError(res, 404, "Order not found");

    if (
      order.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return sendError(res, 403, "Not authorized");
    }

    sendSuccess(res, 200, "Order fetched", { order });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// @desc    Cancel an order (only if placed or confirmed)
// @route   PATCH /api/orders/:id/cancel
// @access  Private (order owner only)
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────
// DELIVERY PARTNER CONTROLLERS
// ─────────────────────────────────────────────────────

// @desc    Get all orders that are currently out for delivery
// @route   GET /api/orders/delivery
// @access  Public (no login required)
// ─────────────────────────────────────────────────────
export const getDeliveryOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ orderStatus: "out_for_delivery" })
      .select("-deliveryOtp") // OTP is never sent to frontend
      .sort({ createdAt: -1 });

    sendSuccess(res, 200, "Delivery orders fetched", { orders });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify OTP entered by delivery partner and mark order as delivered
//          OTP comparison happens server-side only — never exposed to client
// @route   PATCH /api/orders/:id/deliver
// @access  Public (no login required)
// ─────────────────────────────────────────────────────
export const deliverOrder = async (req, res, next) => {
  try {
    const { otp } = req.body;

    if (!otp) return sendError(res, 400, "OTP is required");

    const order = await Order.findById(req.params.id).populate(
      "user",
      "pushToken",
    );

    if (!order) return sendError(res, 404, "Order not found");

    if (order.orderStatus !== "out_for_delivery") {
      return sendError(res, 400, "Order is not out for delivery");
    }

    // Server-side comparison — OTP never leaves the DB
    if (order.deliveryOtp !== otp) {
      return sendError(res, 400, "Incorrect OTP. Please try again.");
    }

    order.orderStatus = "delivered";
    order.deliveredAt = new Date();
    order.paymentStatus = "paid";
    order.deliveryOtp = null; // clear after use
    await order.save();

    // Notify the customer
    if (order.user?.pushToken) {
      await sendPushNotification(
        order.user.pushToken,
        "Order Delivered! 🎉",
        "Your order has been delivered. Enjoy!",
      );
    }

    sendSuccess(res, 200, "Order marked as delivered", { order });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────
// ADMIN CONTROLLERS
// ─────────────────────────────────────────────────────

// @desc    Get all orders with optional status filter and pagination
// @route   GET /api/orders
// @access  Admin
// ─────────────────────────────────────────────────────
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

// @desc    Update order status (admin only)
//          Generates OTP when → out_for_delivery
//          Clears OTP and marks paid when → delivered
// @route   PATCH /api/orders/:id/status
// @access  Admin
// ─────────────────────────────────────────────────────
const NOTIFICATION_CONFIG = {
  confirmed: {
    title: "Order Confirmed!",
    body: "Your order has been confirmed and is being prepared.",
  },
  out_for_delivery: {
    title: "Out for Delivery!",
    body: "Your order is on its way. Share the OTP with the delivery person.",
  },
  delivered: {
    title: "Order Delivered!",
    body: "Your order has been delivered. Enjoy!",
  },
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const validStatuses = [
      "confirmed",
      "preparing",
      "out_for_delivery",
      "delivered",
    ];
    if (!validStatuses.includes(status))
      return sendError(res, 400, "Invalid status");

    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email phone pushToken",
    );
    if (!order) return sendError(res, 404, "Order not found");

    order.orderStatus = status;

    if (status === "out_for_delivery") {
      order.deliveryOtp = generateOtp();
    }

    if (status === "delivered") {
      order.deliveredAt = new Date();
      order.paymentStatus = "paid";
      order.deliveryOtp = null;
    }

    await order.save();

    const notif = NOTIFICATION_CONFIG[status];
    if (notif && order.user?.pushToken) {
      await sendPushNotification(order.user.pushToken, notif.title, notif.body);
    }

    sendSuccess(res, 200, "Order status updated", { order });
  } catch (err) {
    next(err);
  }
};
