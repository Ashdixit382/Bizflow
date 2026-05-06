import express from "express";
import ctrl from "../controllers/saleController.js";
import { protect } from "../middleware/authMiddleware.js";

const r = express.Router();
r.use(protect);
r.get("/", ctrl.list);
r.get("/reports/daily", ctrl.dailyReport);
r.get("/reports/monthly", ctrl.monthlyReport);
r.post("/", ctrl.create);
r.get("/:id", ctrl.getById);
r.put("/:id", ctrl.update);
r.delete("/:id", ctrl.remove);

export default r;
