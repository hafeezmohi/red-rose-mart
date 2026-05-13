import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
});

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

// virtual — total price
cartSchema.virtual("totalPrice").get(function () {
  return this.items.reduce((total, item) => {
    const price = item.product.discountPrice || item.product.price;
    return total + price * item.quantity;
  }, 0);
});

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;