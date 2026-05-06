import express from "express";
import { getReportSummary } from "../controllers/reportController.js";
import { allowRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect);
router.get("/summary", allowRoles("admin"), getReportSummary);

export default router;
