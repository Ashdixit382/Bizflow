import Product from "../models/Product.js";

const buildQuery = ({ q = "", category = "" }) => {
  const query = {};
  if (q) {
    query.$or = [
      { name: { $regex: q, $options: "i" } },
      { sku: { $regex: q, $options: "i" } },
      { supplier: { $regex: q, $options: "i" } },
    ];
  }
  if (category) query.category = category;
  return query;
};

const list = async (req, res) => {
  const { q = "", category = "", sort = "-createdAt", page = 1, limit = 10 } = req.query;
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 10));
  const safePage = Math.max(1, Number(page) || 1);
  const query = buildQuery({ q, category });
  const skip = (safePage - 1) * safeLimit;

  const [items, total, categories] = await Promise.all([
    Product.find(query).sort(sort).skip(skip).limit(safeLimit),
    Product.countDocuments(query),
    Product.distinct("category"),
  ]);
  res.json({
    items,
    total,
    page: safePage,
    pages: Math.ceil(total / safeLimit) || 1,
    categories,
  });
};

const getById = async (req, res) => {
  const item = await Product.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Not found" });
  res.json(item);
};

const create = async (req, res) => {
  const payload = {
    ...req.body,
    stock: Number(req.body.stock || 0),
    price: Number(req.body.price || 0),
    costPrice: Number(req.body.costPrice || 0),
    image: req.body.image || "",
  };
  const item = await Product.create(payload);
  res.status(201).json(item);
};

const update = async (req, res) => {
  const payload = { ...req.body };
  if (payload.stock !== undefined) payload.stock = Number(payload.stock || 0);
  if (payload.price !== undefined) payload.price = Number(payload.price || 0);
  if (payload.costPrice !== undefined) payload.costPrice = Number(payload.costPrice || 0);
  const item = await Product.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
  if (!item) return res.status(404).json({ message: "Not found" });
  res.json(item);
};

const remove = async (req, res) => {
  const item = await Product.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: "Not found" });
  res.json({ message: "Deleted" });
};

const uploadImage = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  res.status(201).json({ image: `/uploads/${req.file.filename}` });
};

export default { list, getById, create, update, remove, uploadImage };
