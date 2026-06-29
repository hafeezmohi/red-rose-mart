import express from "express";
import {
  placeOrder,
  getMyOrders,
  getOrder,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  getDeliveryOrders,
  deliverOrder,
} from "../controllers/order.controller.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";

const router = express.Router();

// ─────────────────────────────────────────────
// USER ROUTES
// ─────────────────────────────────────────────
router.post("/", protect, placeOrder);
router.get("/my", protect, getMyOrders);
router.patch("/:id/cancel", protect, cancelOrder);

// ─────────────────────────────────────────────
// DELIVERY PARTNER ROUTES
// ─────────────────────────────────────────────
// ⚠️  These two MUST be declared before  GET /:id
//     Otherwise Express reads "delivery" as the :id param
// ─────────────────────────────────────────────
router.get("/delivery", protect, restrictTo("delivery", "admin"), getDeliveryOrders);
router.patch("/:id/deliver", protect, restrictTo("delivery", "admin"), deliverOrder);

// ─────────────────────────────────────────────
// SHARED (owner or admin)
// ─────────────────────────────────────────────
router.get("/:id", protect, getOrder);

// ─────────────────────────────────────────────
// ADMIN ROUTES
// ─────────────────────────────────────────────
router.get("/", protect, restrictTo("admin"), getAllOrders);
router.patch("/:id/status", protect, restrictTo("admin"), updateOrderStatus);

export default router;
