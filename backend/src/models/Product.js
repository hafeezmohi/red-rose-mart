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
        "rice-grains",
        "instant-foods",
        "snacks",
        "oil-masala",
        "beverages",
        "other",
        "offers",
        "beauty-and-personal-care",
        "dryfruits",
      ],
    },

    price: { type: Number, required: true },
    discountPrice: { type: Number }, // sale price if any

    unit: { type: String, required: true }, // "kg", "500g", "1L", "piece" etc
    isFeatured: { type: Boolean, default: false }, // for homepage banners
    isActive: { type: Boolean, default: true }, // soft delete

    ratings: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
);


// virtual — final price (discount or regular)
productSchema.virtual("finalPrice").get(function () {
  return this.discountPrice || this.price;
});

const Product = mongoose.model("Product", productSchema);
export default Product;
