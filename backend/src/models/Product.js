import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    images: [{ type: String }],

    category: {
      type: String,
      required: true,
      enum: [
        "fruits-vegetables",
        "dairy-eggs",
        "rice-grains",
        "snacks",
        "beverages",
        "personal-care",
        "haircare",
        "household",
        "frozen",
        "other",
        "instant-foods",
        "oil-masala",
        "beauty-hygiene",
        "offers",
      ],
    },

    price: { type: Number, required: true },
    discountPrice: { type: Number }, // sale price if any

    unit: { type: String, required: true }, // "kg", "500g", "1L", "piece" etc
    stock: { type: Number, required: true, default: 0 },
    lowStockThreshold: { type: Number, default: 10 }, // warn when stock < this

    isFeatured: { type: Boolean, default: false }, // for homepage banners
    isActive: { type: Boolean, default: true }, // soft delete

    ratings: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
);

// virtual — is stock low?
productSchema.virtual("isLowStock").get(function () {
  return this.stock <= this.lowStockThreshold;
});

// virtual — final price (discount or regular)
productSchema.virtual("finalPrice").get(function () {
  return this.discountPrice || this.price;
});

const Product = mongoose.model("Product", productSchema);
export default Product;
