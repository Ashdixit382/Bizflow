import Product from "../models/Product.js";
import Customer from "../models/Customer.js";
import Order from "../models/Order.js";
import Sale from "../models/Sale.js";
import Insight from "../models/Insight.js";

export const getDashboard = async (_, res) => {
  const [products, customers, recentOrders, sales, insights, totalOrderCount] = await Promise.all([
    Product.find(),
    Customer.find(),
    Order.find().sort("-createdAt").limit(8),
    Sale.find().sort("soldAt"),
    Insight.find().sort("-createdAt").limit(5),
    Order.countDocuments(),
  ]);
  const totalRevenue = sales.reduce((a, b) => a + (b.amount || 0), 0);
  const inventoryCount = products.reduce((a, b) => a + b.stock, 0);
  const lowStockAlerts = products.filter((p) => p.stock <= 10);
  const topSellingProducts = products
    .filter((p) => p.lastSoldAt)
    .sort((a, b) => new Date(b.lastSoldAt) - new Date(a.lastSoldAt))
    .slice(0, 5);
  const activityTimeline = [
    ...recentOrders.map((o) => ({
      type: "order",
      text: `${o.invoiceNo || "Order"} is ${o.status}`,
      at: o.updatedAt || o.createdAt,
    })),
    ...sales.slice(-6).map((s) => ({
      type: "sale",
      text: `Sale posted: INR ${Number(s.amount || 0).toLocaleString()}`,
      at: s.soldAt || s.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, 10);
  const monthlyRevenue = Array.from({ length: 6 }).map((_, i) => ({
    month: `M${i + 1}`,
    revenue: Math.round(totalRevenue / 6 + Math.random() * 3000),
    orders: Math.round(30 + Math.random() * 20),
  }));

  res.json({
    kpis: {
      totalRevenue,
      totalOrders: totalOrderCount,
      totalCustomers: customers.length,
      inventoryCount,
    },
    monthlyRevenue,
    recentOrders,
    lowStockAlerts,
    topSellingProducts,
    insights,
    activityTimeline,
  });
};

