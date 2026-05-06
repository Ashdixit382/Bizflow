import PDFDocument from "pdfkit";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Customer from "../models/Customer.js";
export const listOrders = async (req, res) => {
  const items = await Order.find().populate("customer", "name email phone").populate("items.product").sort("-createdAt");
  res.json({ items, total: items.length, page: 1, pages: 1 });
};

const restoreStockForLines = async (lines) => {
  for (const line of lines) {
    const pid = line.product?._id || line.product;
    const qty = line.qty || 0;
    if (pid && qty > 0) await Product.findByIdAndUpdate(pid, { $inc: { stock: qty } });
  }
};

const syncCustomerStats = async (customerId) => {
  const orders = await Order.find({ customer: customerId, status: { $ne: "Cancelled" } });
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
  await Customer.findByIdAndUpdate(customerId, { totalOrders, totalSpent });
};

const consumeStockForLines = async (lines) => {
  for (const line of lines) {
    const pid = line.product?._id || line.product;
    const qty = line.qty || 0;
    if (pid && qty > 0) await Product.findByIdAndUpdate(pid, { $inc: { stock: -qty }, lastSoldAt: new Date() });
  }
};

export const createOrder = async (req, res) => {
  const { customer: customerId, items: incoming, status = "Pending", paymentStatus = "Unpaid", invoiceNo: requestedInvoice } = req.body || {};
  if (!customerId) return res.status(400).json({ message: "customer is required" });
  if (!Array.isArray(incoming) || incoming.length === 0) return res.status(400).json({ message: "items must be a non-empty array" });

  const cust = await Customer.findById(customerId);
  if (!cust) return res.status(400).json({ message: "Customer not found" });

  const resolvedLines = [];
  let totalAmount = 0;

  for (const line of incoming) {
    const product = await Product.findById(line.product);
    if (!product) return res.status(400).json({ message: `Product not found: ${line.product}` });
    const qty = Math.max(1, Number(line.qty) || 1);
    if (product.stock < qty) return res.status(400).json({ message: `Insufficient stock for "${product.name}"` });
    const price = Number(product.price);
    totalAmount += price * qty;
    resolvedLines.push({ product: product._id, name: product.name, qty, price });
  }

  const count = await Order.countDocuments();
  const invoiceNo = requestedInvoice && String(requestedInvoice).trim() ? String(requestedInvoice).trim() : `INV-${1000 + count}`;

  const order = await Order.create({
    customer: customerId,
    items: resolvedLines,
    totalAmount,
    status,
    paymentStatus,
    invoiceNo,
  });

  await consumeStockForLines(resolvedLines.map((l) => ({ product: l.product, qty: l.qty })));

  const populated = await Order.findById(order._id).populate("customer", "name email phone").populate("items.product");
  await syncCustomerStats(customerId);
  res.status(201).json(populated);
};

export const getOrder = async (req, res) => {
  const item = await Order.findById(req.params.id).populate("customer", "name email phone address").populate("items.product");
  if (!item) return res.status(404).json({ message: "Not found" });
  res.json(item);
};

export const updateOrder = async (req, res) => {
  const prev = await Order.findById(req.params.id);
  if (!prev) return res.status(404).json({ message: "Not found" });

  const nextStatus = req.body.status !== undefined ? req.body.status : prev.status;
  const wasCancelled = prev.status === "Cancelled";
  const becomesCancelled = nextStatus === "Cancelled" && !wasCancelled;

  if (becomesCancelled) await restoreStockForLines(prev.items);

  const item = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    .populate("customer", "name email phone")
    .populate("items.product");
  await syncCustomerStats(item.customer?._id || prev.customer);
  res.json(item);
};

export const deleteOrder = async (req, res) => {
  const prev = await Order.findById(req.params.id);
  if (!prev) return res.status(404).json({ message: "Not found" });
  if (prev.status !== "Cancelled") await restoreStockForLines(prev.items);
  await Order.findByIdAndDelete(req.params.id);
  await syncCustomerStats(prev.customer);
  res.json({ message: "Deleted" });
};

export const downloadInvoicePdf = async (req, res) => {
  const order = await Order.findById(req.params.id).populate("customer").populate("items.product");
  if (!order) return res.status(404).json({ message: "Not found" });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${order.invoiceNo || "invoice"}.pdf"`);

  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(res);

  doc.fontSize(22).fillColor("#4338CA").text("BizFlow Manager", { align: "center" });
  doc.moveDown(0.3).fontSize(14).fillColor("#0f172a").text("Invoice", { align: "center" });
  doc.moveDown(1);

  doc.fontSize(11).fillColor("#334155");
  doc.text(`Invoice #: ${order.invoiceNo || "—"}`);
  doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`);
  doc.text(`Status: ${order.status} · Payment: ${order.paymentStatus}`);
  doc.moveDown();

  const c = order.customer;
  if (c) {
    doc.fillColor("#0f172a").fontSize(12).text("Bill to");
    doc.fontSize(10).fillColor("#475569").text(c.name || "");
    if (c.email) doc.text(c.email);
    if (c.phone) doc.text(c.phone);
    if (c.address) doc.text(c.address);
    doc.moveDown();
  }

  doc.fillColor("#0f172a").fontSize(12).text("Line items");
  doc.moveDown(0.3);

  order.items.forEach((line, i) => {
    const pname = line.name || line.product?.name || "Product";
    const sub = (line.price || 0) * (line.qty || 0);
    doc.fontSize(10).fillColor("#334155").text(`${i + 1}. ${pname}  ×${line.qty}  @ INR ${line.price}  =  INR ${sub}`);
  });

  doc.moveDown();
  doc.fontSize(12).fillColor("#0f172a").text(`Total: INR ${(order.totalAmount || 0).toLocaleString()}`, { align: "right" });
  doc.moveDown(2);
  doc.fontSize(9).fillColor("#94a3b8").text("Generated by BizFlow Manager — smart ERP for growing businesses.", { align: "center" });

  doc.end();
};
