import { OAuth2Client } from "google-auth-library";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { sendError, sendSuccess } from "../utils/response.js";
import { generateToken } from "../utils/jwt.js";
import { sendEmail } from "../utils/email.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
      if (user.isBlocked) {
        return sendError(res, 403, "Your account has been blocked by an administrator");
      }
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

// @desc    Forgot admin details (send email)
// @route   POST /api/auth/forgot-admin-details
// @access  Public
export const forgotAdminDetails = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return sendError(res, 400, "Email is required");

    const user = await User.findOne({ email, role: "admin" });
    if (!user) return sendError(res, 404, "Admin account not found");

    const resetToken = crypto.randomBytes(32).toString("hex");
    
    // Hash token before saving to database
    user.resetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetTokenExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    // The reset URL points to the frontend Next.js app
    const origin = req.headers.origin || "http://localhost:3000";
    const resetUrl = `${origin}/reset-details?token=${resetToken}`;

    const message = `You requested to change your admin details.\n\nPlease click on the link below to securely change your Email ID or Password:\n\n${resetUrl}\n\nThis link is valid for 10 minutes. If you did not request this, please ignore this email.`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Red Rose Mart - Admin Details Reset",
        message,
      });

      sendSuccess(res, 200, "Reset link sent to email");
    } catch (err) {
      user.resetToken = undefined;
      user.resetTokenExpire = undefined;
      await user.save();
      console.error("Email error:", err);
      return sendError(res, 500, "Email could not be sent");
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Reset admin details
// @route   POST /api/auth/reset-admin-details
// @access  Public
export const resetAdminDetails = async (req, res, next) => {
  try {
    const { token, newEmail, newPassword } = req.body;

    if (!token) return sendError(res, 400, "Token is required");
    if (!newEmail && !newPassword) return sendError(res, 400, "Please provide a new email or password");

    // Get hashed token to compare with database
    const resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetToken: resetPasswordToken,
      resetTokenExpire: { $gt: Date.now() },
      role: "admin",
    });

    if (!user) {
      return sendError(res, 400, "Invalid or expired reset token");
    }

    if (newEmail) {
      const emailExists = await User.findOne({ email: newEmail });
      if (emailExists && emailExists._id.toString() !== user._id.toString()) {
        return sendError(res, 400, "Email is already in use by another account");
      }
      user.email = newEmail;
    }

    if (newPassword) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    // Clear token fields
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;
    await user.save();

    sendSuccess(res, 200, "Admin details updated successfully. Please login again.");
  } catch (err) {
    next(err);
  }
};
