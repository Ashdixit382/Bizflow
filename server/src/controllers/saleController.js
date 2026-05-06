import Sale from "../models/Sale.js";
import { createCRUD } from "./crudFactory.js";

const crud = createCRUD(Sale);

const dailyReport = async (_, res) => {
  const rows = await Sale.aggregate([
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$soldAt" } }, revenue: { $sum: "$amount" }, profit: { $sum: "$profit" }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  res.json(rows.map((r) => ({ date: r._id, revenue: r.revenue, profit: r.profit, count: r.count })));
};

const monthlyReport = async (_, res) => {
  const rows = await Sale.aggregate([
    { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$soldAt" } }, revenue: { $sum: "$amount" }, profit: { $sum: "$profit" }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  res.json(rows.map((r) => ({ month: r._id, revenue: r.revenue, profit: r.profit, count: r.count })));
};

export default { ...crud, dailyReport, monthlyReport };
