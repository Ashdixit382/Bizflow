import Customer from "../models/Customer.js";
import Order from "../models/Order.js";

const list = async (req, res) => {
  const { q = "", sort = "-createdAt", page = 1, limit = 10 } = req.query;
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 10));
  const safePage = Math.max(1, Number(page) || 1);
  const query = q
    ? {
        $or: [
          { name: { $regex: q, $options: "i" } },
          { email: { $regex: q, $options: "i" } },
          { phone: { $regex: q, $options: "i" } },
        ],
      }
    : {};
  const skip = (safePage - 1) * safeLimit;
  const [items, total] = await Promise.all([
    Customer.find(query).sort(sort).skip(skip).limit(safeLimit),
    Customer.countDocuments(query),
  ]);
  res.json({ items, total, page: safePage, pages: Math.ceil(total / safeLimit) || 1 });
};

const getById = async (req, res) => {
  const item = await Customer.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Not found" });
  res.json(item);
};

const create = async (req, res) => {
  const item = await Customer.create(req.body);
  res.status(201).json(item);
};

const update = async (req, res) => {
  const item = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!item) return res.status(404).json({ message: "Not found" });
  res.json(item);
};

const remove = async (req, res) => {
  const item = await Customer.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: "Not found" });
  res.json({ message: "Deleted" });
};

const purchaseHistory = async (req, res) => {
  const orders = await Order.find({ customer: req.params.id }).sort("-createdAt").limit(30);
  const summary = orders.reduce(
    (acc, o) => {
      acc.totalOrders += 1;
      acc.totalSpent += Number(o.totalAmount || 0);
      if (o.status === "Completed") acc.completed += 1;
      return acc;
    },
    { totalOrders: 0, totalSpent: 0, completed: 0 }
  );
  res.json({ summary, orders });
};

export default { list, getById, create, update, remove, purchaseHistory };
