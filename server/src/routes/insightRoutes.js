import express from "express";
import { listInsights, refreshInsights } from "../controllers/insightController.js";
import { protect, allowRoles } from "../middleware/authMiddleware.js";

const r = express.Router();
r.use(protect);
r.get("/", listInsights);
r.post("/refresh", allowRoles("admin"), refreshInsights);

export default r;
