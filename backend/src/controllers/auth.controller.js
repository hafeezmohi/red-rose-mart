import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import { sendError, sendSuccess } from "../utils/response.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// helper — keeps token generation in one place
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

// @desc    Google OAuth login
// @route   POST /api/auth/google
// @access  Public
export const googleAuth = async (req, res, next) => {
  try {
    // Guard against missing/malformed body
    if (!req.body || Object.keys(req.body).length === 0) {
      return sendError(res, 400, "Request body is missing or not JSON");
    }
    const { idToken } = req.body;

    // Guard against missing idToken
    if (!idToken) {
      return sendError(res, 400, "idToken is required");
    }

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return sendError(res, 400, "Could not retrieve email from Google");
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        googleId,
        avatar: picture,
        authProvider: "google",
      });
    } else {
      if (!user.googleId) user.googleId = googleId;
      if (picture && user.avatar !== picture) user.avatar = picture;
      await user.save();
    }

    const token = generateToken(user._id);

    sendSuccess(res, 200, "Login successful", {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
      isProfileComplete: !!user.phone,
    });
  } catch (err) {
    if (
      err.message?.includes("Token used too late") ||
      err.message?.includes("Invalid token")
    ) {
      return sendError(res, 401, "Invalid or expired Google token");
    }
    next(err);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  sendSuccess(res, 200, "User fetched", {
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar,
      phone: req.user.phone,
      role: req.user.role,
      isProfileComplete: !!req.user.phone,
      address: req.user.address,
    },
  });
};

// @desc    Update user profile (phone number for now)
// @route   PUT /api/auth/me
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { phone, address } = req.body;

    if (!phone) return sendError(res, 400, 'Phone number is required');

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return sendError(res, 400, 'Please enter a valid 10-digit Indian mobile number');
    }

    const updateData = { phone };
    if (address) updateData.address = address;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    );

    sendSuccess(res, 200, 'Profile updated', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        phone: user.phone,
        address: user.address,
        role: user.role,
        isProfileComplete: !!user.phone,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Save push notification token
// @route   POST /api/auth/push-token
// @access  Private
export const savePushToken = async (req, res, next) => {
  try {
    const { pushToken } = req.body;
    await User.findByIdAndUpdate(req.user._id, { pushToken });
    sendSuccess(res, 200, 'Push token saved');
  } catch (err) {
    next(err);
  }
};
