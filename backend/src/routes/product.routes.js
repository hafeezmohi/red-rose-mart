import express from "express";
import {
  getProducts,
  getProduct,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { restrictTo } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public
router.get("/", getProducts);
router.get("/categories", getCategories);
router.get("/:id", getProduct);

// Admin only
router.post("/", protect, createProduct);
router.patch("/:id", protect, updateProduct);
router.delete("/:id", protect, deleteProduct);

export default router;
