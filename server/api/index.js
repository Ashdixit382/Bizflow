export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const { url, method } = req;
    const path = new URL(url, `http://${req.headers.host}`).pathname;
    
    // Health check
    if (path === "/api/health") {
      return res.json({ ok: true, app: "BizFlow Manager API" });
    }

    // Auth endpoints
    if (path === "/api/auth/register" && method === "POST") {
      // Mock registration for now
      return res.json({ 
        success: true, 
        message: "User registered successfully",
        user: { name: req.body.name, email: req.body.email }
      });
    }

    if (path === "/api/auth/login" && method === "POST") {
      // Mock login for now
      return res.json({ 
        success: true, 
        message: "Login successful",
        token: "mock_jwt_token_12345",
        user: { name: "Test User", email: req.body.email }
      });
    }

    if (path === "/api/auth/me" && method === "GET") {
      // Mock user data for now
      return res.json({ 
        success: true, 
        user: { name: "Test User", email: "test@example.com" }
      });
    }

    // Default response
    res.status(404).json({ message: "Endpoint not found" });
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
