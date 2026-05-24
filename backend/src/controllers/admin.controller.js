import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendError, sendSuccess } from '../utils/response.js';

export const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return sendError(res, 400, 'Email and password are required');

    const user = await User.findOne({ email, role: 'admin' }).select('+password');
    if (!user)
      return sendError(res, 401, 'Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return sendError(res, 401, 'Invalid credentials');

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    sendSuccess(res, 200, 'Login successful', {
      token,
      admin: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    next(err);
  }
};