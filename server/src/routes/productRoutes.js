import express from "express";
import ctrl from "../controllers/productController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.js";

const r = express.Router();
r.use(protect);
r.get("/", ctrl.list);
r.post("/", ctrl.create);
r.post("/upload", upload.single("image"), ctrl.uploadImage);
r.get("/:id", ctrl.getById);
r.put("/:id", ctrl.update);
r.delete("/:id", ctrl.remove);

export default r;
