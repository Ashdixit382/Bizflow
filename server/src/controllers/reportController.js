import Customer from "../models/Customer.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Sale from "../models/Sale.js";

const formatDay = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const getReportSummary = async (_, res) => {
  const [sales, orders, customers, products] = await Promise.all([
    Sale.find().sort("soldAt"),
    Order.find().sort("createdAt"),
    Customer.find().sort("createdAt"),
    Product.find(),
  ]);

  const revenue = sales.reduce((sum, s) => sum + Number(s.amount || 0), 0);
  const cost = sales.reduce((sum, s) => sum + Number(s.cost || 0), 0);
  const profit = revenue - cost;
  const margin = revenue ? Number(((profit / revenue) * 100).toFixed(2)) : 0;

  const dailyMap = new Map();
  sales.forEach((s) => {
    const key = formatDay(s.soldAt || s.createdAt);
    dailyMap.set(key, (dailyMap.get(key) || 0) + Number(s.amount || 0));
  });
  const revenueTrend = [...dailyMap.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-30)
    .map(([date, amount]) => ({ date, amount }));

  const productPerformance = products.map((p) => {
    const soldQty = orders.reduce((qty, o) => {
      const line = (o.items || []).find((i) => String(i.product) === String(p._id));
      return qty + Number(line?.qty || 0);
    }, 0);
    return {
      name: p.name,
      sku: p.sku,
      soldQty,
      revenue: soldQty * Number(p.price || 0),
      marginPct: p.price ? Number((((p.price - p.costPrice) / p.price) * 100).toFixed(1)) : 0,
    };
  });

  const today = new Date();
  const customerGrowth = Array.from({ length: 6 }).map((_, idx) => {
    const monthDate = new Date(today.getFullYear(), today.getMonth() - (5 - idx), 1);
    const month = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}`;
    const count = customers.filter((c) => formatDay(c.createdAt).startsWith(month)).length;
    return { month, customers: count };
  });

  const heatmap = Array.from({ length: 7 }).map((_, day) => {
    return Array.from({ length: 4 }).map((__, slot) => {
      const base = 20 + day * 7 + slot * 9;
      return { day, slot, value: Math.min(100, Math.round(base + Math.random() * 30)) };
    });
  });

  const lastWeekRevenue = revenueTrend.slice(-7).reduce((s, p) => s + p.amount, 0);
  const forecast = Array.from({ length: 7 }).map((_, i) => ({
    day: `D+${i + 1}`,
    predictedRevenue: Math.round(lastWeekRevenue / 7 + Math.random() * 800),
    predictedDemand: Math.round(18 + Math.random() * 12),
  }));

  const activityTimeline = [
    ...orders.slice(-8).map((o) => ({
      type: "order",
      text: `Order ${o.invoiceNo || o._id.toString().slice(-6)} moved to ${o.status}`,
      at: o.updatedAt || o.createdAt,
    })),
    ...sales.slice(-8).map((s) => ({
      type: "sale",
      text: `Sale recorded: INR ${Number(s.amount || 0).toLocaleString()}`,
      at: s.soldAt || s.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, 12);

  res.json({
    summary: {
      revenue,
      cost,
      profit,
      margin,
      orderCompletionRate: orders.length
        ? Number(((orders.filter((o) => o.status === "Completed").length / orders.length) * 100).toFixed(1))
        : 0,
    },
    revenueTrend,
    productPerformance: productPerformance.sort((a, b) => b.revenue - a.revenue).slice(0, 12),
    customerGrowth,
    heatmap: heatmap.flat(),
    forecast,
    activityTimeline,
  });
};
