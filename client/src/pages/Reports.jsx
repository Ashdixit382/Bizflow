import { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import { api } from "../lib/api";

export default function Reports() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/reports/summary").then((res) => setData(res.data));
  }, []);

  const exportCSV = async () => {
    if (!data) return;
    const summaryRows = Object.entries(data.summary).map(([k, v]) => `${k},${v}`);
    const trendRows = (data.revenueTrend || []).map((r) => `${r.date},${r.amount}`);
    const csv = ["metric,value", ...summaryRows, "", "date,revenue", ...trendRows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "bizflow-report.csv";
    a.click();
  };

  const exportPDF = () => {
    if (!data) return;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("BizFlow Manager Report", 14, 18);
    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 26);
    let y = 38;
    Object.entries(data.summary || {}).forEach(([k, v]) => {
      doc.text(`${k}: ${v}`, 14, y);
      y += 8;
    });
    y += 5;
    doc.text("Top Product Performance:", 14, y);
    y += 8;
    (data.productPerformance || []).slice(0, 8).forEach((p) => {
      doc.text(`${p.name} (${p.sku}) - Revenue: ${Math.round(p.revenue)} - Qty: ${p.soldQty}`, 14, y);
      y += 7;
    });
    doc.save("bizflow-report.pdf");
  };

  if (!data) return <div className="h-40 animate-pulse rounded-xl glass" />;

  return (
    <div className="space-y-4">
      <div className="glass rounded-xl p-5">
        <h1 className="text-xl font-semibold">Reports</h1>
        <p className="mt-1 text-sm text-slate-500">Revenue trends, product performance, customer growth and export options.</p>
        <div className="mt-4 flex gap-2">
          <button onClick={exportCSV} className="rounded-lg bg-emerald-600 px-4 py-2 text-white">Export CSV</button>
          <button onClick={exportPDF} className="rounded-lg bg-indigo-600 px-4 py-2 text-white">Export PDF</button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Card title="Revenue" value={`INR ${Number(data.summary.revenue || 0).toLocaleString()}`} />
        <Card title="Profit" value={`INR ${Number(data.summary.profit || 0).toLocaleString()}`} />
        <Card title="Margin" value={`${data.summary.margin || 0}%`} />
        <Card title="Completion Rate" value={`${data.summary.orderCompletionRate || 0}%`} />
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="glass rounded-xl p-4">
      <p className="text-sm text-slate-500">{title}</p>
      <h3 className="text-xl font-semibold">{value}</h3>
    </div>
  );
}
