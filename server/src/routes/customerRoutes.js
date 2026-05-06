import express from "express";
import ctrl from "../controllers/customerController.js";
import { protect } from "../middleware/authMiddleware.js";

const r = express.Router();
r.use(protect);
r.get("/", ctrl.list);
r.post("/", ctrl.create);
r.get("/:id/purchases", ctrl.purchaseHistory);
r.get("/:id", ctrl.getById);
r.put("/:id", ctrl.update);
r.delete("/:id", ctrl.remove);

export default r;