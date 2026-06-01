import express from "express";
import { adminLogin } from "../controllers/admin.controller.js";
import {
  getUsers,
  toggleBlockUser,
  getAdminProducts,
} from "../controllers/admin.controller.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";
import { getAnalytics } from "../controllers/analytics.controller.js";

const router = express.Router();

router.post("/login", adminLogin);

router.use(protect, restrictTo("admin"));

router.get("/users", getUsers);

router.patch("/users/:id/block", toggleBlockUser);

router.get("/analytics", getAnalytics);

router.get("/products", getAdminProducts);

export default router;
