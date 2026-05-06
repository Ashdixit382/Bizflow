import { login, register, me } from "../src/controllers/authController.js";
import { protect } from "../src/middleware/authMiddleware.js";
import { requireFields } from "../src/middleware/validate.js";

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
    const { url, method } = req;
    const path = new URL(url, `http://${req.headers.host}`).pathname;
    
    if (path === "/api/auth/register" && method === "POST") {
      await requireFields(["name", "email", "password"])(req, res, () => {
        return register(req, res);
      });
    } else if (path === "/api/auth/login" && method === "POST") {
      await requireFields(["email", "password"])(req, res, () => {
        return login(req, res);
      });
    } else if (path === "/api/auth/me" && method === "GET") {
      await protect(req, res, () => {
        return me(req, res);
      });
    } else {
      res.status(404).json({ message: "Auth endpoint not found" });
    }
  } catch (error) {
    console.error("Auth route error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
