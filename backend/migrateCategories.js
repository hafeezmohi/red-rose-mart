import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Construct path to .env file manually
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

import Product from "./src/models/Product.js";

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB.");

    // 1. Merge Beauty and Personal Care
    const beautyRes = await Product.updateMany(
      { category: { $in: ["personal-care", "beauty-hygiene"] } },
      { $set: { category: "beauty-and-personal-care" } }
    );
    console.log(`Merged ${beautyRes.modifiedCount} products into beauty-and-personal-care`);

    // 2. Map dead categories to 'other'
    const deadCategories = ["fruits-vegetables", "dairy-eggs", "haircare", "household", "frozen"];
    const deadRes = await Product.updateMany(
      { category: { $in: deadCategories } },
      { $set: { category: "other" } }
    );
    console.log(`Mapped ${deadRes.modifiedCount} products from dead categories to 'other'`);

    console.log("Migration complete.");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
};

migrate();
