import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoSanitize from "express-mongo-sanitize";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import saleRoutes from "./routes/saleRoutes.js";
import insightRoutes from "./routes/insightRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });
await connectDB();
const app=express();
const corsOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
app.use(
  helmet(),
  cors({
    origin: corsOrigins.length ? corsOrigins : true,
    credentials: true,
  })
);
app.use(express.json()); app.use(mongoSanitize()); app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.get("/api/health",(_,res)=>res.json({ok:true,app:"BizFlow Manager API"}));
app.use("/api/auth",authRoutes); app.use("/api/products",productRoutes); app.use("/api/customers",customerRoutes); app.use("/api/orders",orderRoutes); app.use("/api/sales",saleRoutes); app.use("/api/insights",insightRoutes); app.use("/api/notifications",notificationRoutes); app.use("/api/dashboard",dashboardRoutes); app.use("/api/reports",reportRoutes);
app.use(notFound); app.use(errorHandler);
const port=process.env.PORT||5000; app.listen(port,()=>console.log(`Server running on ${port}`));
