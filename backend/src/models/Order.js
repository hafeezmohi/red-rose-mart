import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: { type: String, required: true }, // snapshot at time of order
  image: { type: String }, // snapshot
  price: { type: Number, required: true }, // snapshot
  quantity: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    items: [orderItemSchema],

    deliveryAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      pincode: { type: String, required: true },
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },

    itemsPrice: { type: Number, required: true }, // subtotal
    deliveryFee: { type: Number },
    totalPrice: { type: Number, required: true },

    paymentMethod: { type: String, default: "COD" },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },

    orderStatus: {
      type: String,
      enum: ["placed", "out_for_delivery", "delivered", "cancelled"],
      default: "placed",
    },

    deliveredAt: { type: Date },
    cancelledAt: { type: Date },
    cancellationReason: { type: String },
    deliveryOtp: { type: String, default: null },
  },
  { timestamps: true },
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
