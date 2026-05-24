import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  googleId: { type: String },
  avatar: { type: String },
  authProvider: { type: String, enum: ['google'], default: 'google' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  phone: { type: String },
  password: { type: String, select: false },
  pushToken: { type: String, default: null },
  isBlocked: { type: Boolean, default: false },
  address: {
    street: { type: String },
    city: { type: String },
    pincode: { type: String },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;