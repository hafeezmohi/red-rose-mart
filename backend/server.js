import dotenv from "dotenv";
dotenv.config({ path: ".env" });

import express from "express";
import authRoutes from "./src/routes/auth.routes.js";
import connectDb from "./src/config/connectdb.js";
import productRoutes from "./src/routes/product.routes.js";
import cartRoutes from "./src/routes/cart.routes.js";
import orderRoutes from "./src/routes/order.routes.js";

const app = express();

await connectDb();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
console.log(
  "Auth routes initialized:",
  authRoutes.stack.map((r) => r.route.path),
);

app.use("/api/products", productRoutes);

app.use("/api/cart", cartRoutes);

app.use("/api/orders", orderRoutes);

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
