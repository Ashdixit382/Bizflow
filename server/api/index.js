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

// Connect to MongoDB
await connectDB();

// Main handler for Vercel serverless functions
export default async function handler(req, res) {
  // Set CORS headers
  const corsOrigins = (process.env.CLIENT_URL || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  
  const origin = req.headers.origin;
  if (corsOrigins.includes(origin) || corsOrigins.length === 0) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    // Parse URL
    const url = new URL(req.url, `http://${req.headers.host}`);
    const path = url.pathname.replace("/api", "");
    
    // Health check
    if (path === "/health") {
      return res.json({ ok: true, app: "BizFlow Manager API" });
    }

    // Route handling
    if (path.startsWith("/auth")) {
      return await authRoutes(req, res);
    } else if (path.startsWith("/products")) {
      return await productRoutes(req, res);
    } else if (path.startsWith("/customers")) {
      return await customerRoutes(req, res);
    } else if (path.startsWith("/orders")) {
      return await orderRoutes(req, res);
    } else if (path.startsWith("/sales")) {
      return await saleRoutes(req, res);
    } else if (path.startsWith("/insights")) {
      return await insightRoutes(req, res);
    } else if (path.startsWith("/notifications")) {
      return await notificationRoutes(req, res);
    } else if (path.startsWith("/dashboard")) {
      return await dashboardRoutes(req, res);
    } else if (path.startsWith("/reports")) {
      return await reportRoutes(req, res);
    } else {
      return notFound(req, res);
    }
  } catch (error) {
    return errorHandler(error, req, res);
  }
}
