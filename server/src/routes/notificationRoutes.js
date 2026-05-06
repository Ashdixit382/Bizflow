import express from "express";
import ctrl from "../controllers/notificationController.js";
import { protect, allowRoles } from "../middleware/authMiddleware.js";

const r = express.Router();
r.use(protect);
r.get("/", ctrl.list);
r.post("/", allowRoles("admin"), ctrl.create);
r.put("/:id", allowRoles("admin"), ctrl.update);
r.delete("/:id", allowRoles("admin"), ctrl.remove);

export default r;
