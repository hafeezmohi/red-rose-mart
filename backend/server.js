import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import express from "express";
import authRoutes from "./src/routes/auth.routes.js";
import connectDb from "./src/config/connectdb.js";

const app = express();

await connectDb();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
console.log(
  "Auth routes initialized:",
  authRoutes.stack.map((r) => r.route.path),
);

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
