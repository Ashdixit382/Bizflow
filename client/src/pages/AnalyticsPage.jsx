import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api } from "../lib/api";

const heatColors = ["#1e293b", "#0f766e", "#0369a1", "#4338ca", "#7c3aed", "#be123c"];

export default function AnalyticsPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/reports/summary").then((res) => setData(res.data));
  }, []);

  const heatmapData = useMemo(() => {
    if (!data?.heatmap) return [];
    return data.heatmap.map((h) => ({
      ...h,
      label: `Day ${h.day + 1} · Slot ${h.slot + 1}`,
      color: heatColors[Math.min(heatColors.length - 1, Math.floor((h.value || 0) / 18))],
    }));
  }, [data]);

  if (!data) return <div className="h-40 animate-pulse rounded-xl glass" />;

  return (
    <div className="space-y-4">
      <div className="glass rounded-xl p-4">
        <h1 className="text-xl font-semibold">Advanced Analytics</h1>
        <p className="text-sm text-slate-500">Revenue trends, product performance, customer growth, heatmap and forecasting.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric title="Revenue" value={`INR ${Number(data.summary.revenue || 0).toLocaleString()}`} />
        <Metric title="Profit" value={`INR ${Number(data.summary.profit || 0).toLocaleString()}`} />
        <Metric title="Profit Margin" value={`${data.summary.margin || 0}%`} />
        <Metric title="Order Completion" value={`${data.summary.orderCompletionRate || 0}%`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Revenue Trend (30 days)">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.revenueTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" hide />
              <YAxis />
              <Tooltip />
              <Line dataKey="amount" stroke="#6366f1" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Customer Growth">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.customerGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="customers" fill="#14b8a6" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Forecast: Next Week Revenue vs Demand">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.forecast}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" dataKey="predictedRevenue" stroke="#6366f1" />
              <Line yAxisId="right" dataKey="predictedDemand" stroke="#f97316" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Sales Heatmap (demo)">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={heatmapData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" hide />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value">
                {heatmapData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="glass rounded-xl p-4">
        <h2 className="mb-2 font-semibold">Activity Timeline</h2>
        <div className="space-y-2">
          {data.activityTimeline.map((event, idx) => (
            <div key={idx} className="flex items-start justify-between rounded-lg border border-slate-700/30 p-2">
              <p className="text-sm">{event.text}</p>
              <span className="text-xs text-slate-500">{new Date(event.at).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Metric({ title, value }) {
  return (
    <div className="glass rounded-xl p-4">
      <p className="text-sm text-slate-500">{title}</p>
      <h3 className="text-xl font-semibold">{value}</h3>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="glass rounded-xl p-4">
      <h2 className="mb-2 font-semibold">{title}</h2>
      <div className="h-72">{children}</div>
    </div>
  );
}
