import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoSanitize from "express-mongo-sanitize";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "../src/config/db.js";
import authRoutes from "../src/routes/authRoutes.js";
import productRoutes from "../src/routes/productRoutes.js";
import customerRoutes from "../src/routes/customerRoutes.js";
import orderRoutes from "../src/routes/orderRoutes.js";
import saleRoutes from "../src/routes/saleRoutes.js";
import insightRoutes from "../src/routes/insightRoutes.js";
import notificationRoutes from "../src/routes/notificationRoutes.js";
import dashboardRoutes from "../src/routes/dashboardRoutes.js";
import reportRoutes from "../src/routes/reportRoutes.js";
import { notFound, errorHandler } from "../src/middleware/errorMiddleware.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const app = express();

// Connect to MongoDB
await connectDB();

// Middleware
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
app.use(express.json());
app.use(mongoSanitize());
app.use(morgan("dev"));

// Static files for uploads (if needed)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Health check
app.get("/health", (_, res) => 
  res.json({ ok: true, app: "BizFlow Manager API" })
);

// API Routes
app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/customers", customerRoutes);
app.use("/orders", orderRoutes);
app.use("/sales", saleRoutes);
app.use("/insights", insightRoutes);
app.use("/notifications", notificationRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/reports", reportRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
