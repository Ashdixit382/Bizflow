import express from "express";
import {
  createOrder,
  listOrders,
  getOrder,
  updateOrder,
  deleteOrder,
  downloadInvoicePdf,
} from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";

const r = express.Router();
r.use(protect);
r.get("/", listOrders);
r.post("/", createOrder);
r.get("/:id/invoice/pdf", downloadInvoicePdf);
r.get("/:id", getOrder);
r.put("/:id", updateOrder);
r.delete("/:id", deleteOrder);

export default r;
