import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

import express from "express";
import { googleAuth, getMe, updateProfile, savePushToken } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

console.log("Node Environment: " + process.env.NODE_ENV);
if (process.env.NODE_ENV === "development") {
  router.post("/dev-login", async (req, res) => {
    const user =
      (await User.findOne()) ||
      (await User.create({
        name: "Test User",
        email: "test@test.com",
        googleId: "dev123",
        authProvider: "google",
      }));
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({ success: true, token, user });
  });
}

// Temporary admin token route — remove after testing
router.get('/admin-token', async (req, res) => {
  const user = await User.findOne({ role: 'admin' });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token });
});

router.post("/google", googleAuth);
router.get("/me", protect, getMe);
router.patch("/profile", protect, updateProfile);
router.post('/push-token', protect, savePushToken);

export default router;
