import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
import { api } from "../lib/api";
import DataTable from "../components/DataTable";
import DraggableKpiGrid from "../components/DraggableKpiGrid";

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/dashboard").then((r) => setData(r.data)).catch(() => setData(null));
  }, []);

  const kpis = useMemo(() => {
    if (!data?.kpis) return null;
    return {
      revenue: {
        title: "Total Revenue",
        value: `INR ${data.kpis.totalRevenue.toLocaleString()}`,
      },
      orders: { title: "Total Orders", value: data.kpis.totalOrders },
      customers: { title: "Total Customers", value: data.kpis.totalCustomers },
      inventory: { title: "Inventory Count", value: data.kpis.inventoryCount },
    };
  }, [data]);

  if (!data || !kpis) return <div className="h-40 animate-pulse rounded-xl glass" />;

  return (
    <div className="space-y-5">
      <DraggableKpiGrid kpis={kpis} />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass h-72 rounded-xl p-4">
          <h3 className="mb-3 font-semibold">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height="90%">
            <LineChart data={data.monthlyRevenue}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="glass h-72 rounded-xl p-4">
          <h3 className="mb-3 font-semibold">Sales Trend</h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={data.monthlyRevenue}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="orders" fill="#14b8a6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <DataTable
        columns={[
          { key: "invoiceNo", label: "Invoice" },
          { key: "status", label: "Status" },
          { key: "paymentStatus", label: "Payment" },
          { key: "totalAmount", label: "Amount" },
        ]}
        rows={data.recentOrders}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glass rounded-xl p-4 lg:col-span-1">
          <h3 className="mb-2 font-semibold">Low stock</h3>
          <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
            {data.lowStockAlerts?.map((p) => (
              <li key={p._id}>
                {p.name} — <span className="text-rose-500">{p.stock}</span> left
              </li>
            ))}
            {!data.lowStockAlerts?.length && <li className="text-slate-500">No alerts</li>}
          </ul>
        </div>
        <div className="glass rounded-xl p-4 lg:col-span-1">
          <h3 className="mb-2 font-semibold">Top selling (recent activity)</h3>
          <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
            {(data.topSellingProducts || []).map((p) => (
              <li key={p._id}>
                {p.name} · {p.sku}
              </li>
            ))}
            {!data.topSellingProducts?.length && <li className="text-slate-500">No data yet</li>}
          </ul>
        </div>
        <div className="glass rounded-xl p-4 lg:col-span-1">
          <h3 className="mb-2 font-semibold">Smart insights</h3>
          <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
            {data.insights?.map((i) => (
              <li key={i._id}>{i.title}</li>
            ))}
            {!data.insights?.length && <li className="text-slate-500">Run insight refresh from Smart Insights.</li>}
          </ul>
        </div>
      </div>
      <div className="glass rounded-xl p-4">
        <h3 className="mb-2 font-semibold">Activity Timeline</h3>
        <div className="space-y-2">
          {(data.activityTimeline || []).map((a, idx) => (
            <div key={idx} className="flex items-center justify-between rounded-lg border border-slate-700/20 p-2">
              <p className="text-sm">{a.text}</p>
              <span className="text-xs text-slate-500">{new Date(a.at).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
