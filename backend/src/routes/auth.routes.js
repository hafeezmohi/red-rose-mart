import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

import express from "express";
import { googleAuth, getMe, updateProfile, savePushToken, forgotAdminDetails, resetAdminDetails } from '../controllers/auth.controller.js';
import { protect } from "../middleware/auth.middleware.js";

import User from '../models/User.js';

const router = express.Router();





router.post("/google", googleAuth);
router.get("/me", protect, getMe);
router.patch("/profile", protect, updateProfile);
router.post('/push-token', protect, savePushToken);
router.post('/forgot-admin-details', forgotAdminDetails);
router.post('/reset-admin-details', resetAdminDetails);

export default router;
