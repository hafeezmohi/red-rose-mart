import express from "express";
import {
  placeOrder,
  getMyOrders,
  getOrder,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/order.controller.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";

const router = express.Router();

// User routes
router.post("/", protect, placeOrder);
router.get("/my", protect, getMyOrders);
router.get("/:id", protect, getOrder);
router.patch("/:id/cancel", protect, cancelOrder);

// Admin routes
router.get("/", protect, restrictTo("admin"), getAllOrders);
router.patch("/:id/status", protect, restrictTo("admin"), updateOrderStatus);

export default router;