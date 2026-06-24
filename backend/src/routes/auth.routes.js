import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

import express from "express";
import { googleAuth, getMe, updateProfile, savePushToken } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();





router.post("/google", googleAuth);
router.get("/me", protect, getMe);
router.patch("/profile", protect, updateProfile);
router.post('/push-token', protect, savePushToken);

export default router;
