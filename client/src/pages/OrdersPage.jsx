import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Download, Plus, Trash2 } from "lucide-react";
import { api } from "../lib/api";
import DataTable from "../components/DataTable";

const emptyLine = () => ({ product: "", qty: "1" });

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customerId, setCustomerId] = useState("");
  const [lines, setLines] = useState([emptyLine()]);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [oRes, cRes, pRes] = await Promise.all([
        api.get("/orders"),
        api.get("/customers?limit=200"),
        api.get("/products?limit=200"),
      ]);
      setOrders(oRes.data.items || oRes.data);
      setCustomers(cRes.data.items || []);
      setProducts(pRes.data.items || []);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const productOptions = useMemo(() => products, [products]);

  const addLine = () => setLines((prev) => [...prev, emptyLine()]);
  const removeLine = (idx) => setLines((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx)));
  const setLine = (idx, patch) =>
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)));

  const submit = async (e) => {
    e.preventDefault();
    if (!customerId) return toast.error("Choose a customer");
    const payloadItems = lines
      .filter((l) => l.product)
      .map((l) => ({ product: l.product, qty: Number(l.qty) || 1 }));
    if (!payloadItems.length) return toast.error("Add at least one line item");
    setCreating(true);
    try {
      await api.post("/orders", { customer: customerId, items: payloadItems });
      toast.success("Order created");
      setLines([emptyLine()]);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Create failed");
    } finally {
      setCreating(false);
    }
  };

  const patchOrder = async (id, body) => {
    try {
      await api.put(`/orders/${id}`, body);
      toast.success("Order updated");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  const deleteOrder = async (id) => {
    if (!confirm("Delete this order? Stock will be restored if not already cancelled.")) return;
    try {
      await api.delete(`/orders/${id}`);
      toast.success("Order removed");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const downloadInvoice = async (id, invoiceNo) => {
    try {
      const { data } = await api.get(`/orders/${id}/invoice/pdf`, { responseType: "blob" });
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${invoiceNo || "invoice"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Could not download invoice");
    }
  };

  const rows = orders.map((o) => ({
    ...o,
    customerName: o.customer?.name || "—",
    amount: o.totalAmount != null ? `INR ${Number(o.totalAmount).toLocaleString()}` : "—",
    actions: (
      <div className="flex flex-wrap items-center gap-2">
        <select
          className="rounded-md border border-slate-300/50 bg-transparent px-2 py-1 text-xs dark:border-slate-600"
          value={o.status}
          onChange={(e) => patchOrder(o._id, { status: e.target.value })}
        >
          {["Pending", "Processing", "Completed", "Cancelled"].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          className="rounded-md border border-slate-300/50 bg-transparent px-2 py-1 text-xs dark:border-slate-600"
          value={o.paymentStatus}
          onChange={(e) => patchOrder(o._id, { paymentStatus: e.target.value })}
        >
          {["Unpaid", "Paid", "Refunded"].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-md bg-indigo-600/90 px-2 py-1 text-xs text-white"
          onClick={() => downloadInvoice(o._id, o.invoiceNo)}
        >
          <Download size={14} /> PDF
        </button>
        <button type="button" className="text-xs text-rose-500" onClick={() => deleteOrder(o._id)}>
          Delete
        </button>
      </div>
    ),
  }));

  return (
    <div className="space-y-5">
      <div className="glass rounded-xl p-5">
        <h1 className="text-xl font-semibold">Orders</h1>
        <p className="text-sm text-slate-500">
          Pick a customer, add products and quantities — totals and invoicing sync automatically with inventory.
        </p>
      </div>

      <form onSubmit={submit} className="glass space-y-4 rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-medium">Create order</h2>
          <button type="button" onClick={addLine} className="inline-flex items-center gap-1 rounded-lg bg-indigo-500/15 px-3 py-1.5 text-sm text-indigo-600 dark:text-indigo-400">
            <Plus size={16} /> Add line
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block text-slate-500">Customer</span>
            <select
              className="w-full rounded-lg border border-slate-300/60 bg-transparent px-3 py-2 dark:border-slate-600"
              value={customerId}
              required
              onChange={(e) => setCustomerId(e.target.value)}
            >
              <option value="">Select customer…</option>
              {customers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} · {c.email}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="space-y-3">
          {lines.map((line, idx) => (
            <div key={idx} className="grid gap-3 md:grid-cols-[1fr_120px_auto] md:items-end">
              <label className="text-sm">
                <span className="mb-1 block text-slate-500">Product</span>
                <select
                  className="w-full rounded-lg border border-slate-300/60 bg-transparent px-3 py-2 dark:border-slate-600"
                  value={line.product}
                  onChange={(e) => setLine(idx, { product: e.target.value })}
                >
                  <option value="">Choose product…</option>
                  {productOptions.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.sku}) · stock {p.stock} · INR {p.price}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                <span className="mb-1 block text-slate-500">Qty</span>
                <input
                  type="number"
                  min={1}
                  className="w-full rounded-lg border border-slate-300/60 bg-transparent px-3 py-2 dark:border-slate-600"
                  value={line.qty}
                  onChange={(e) => setLine(idx, { qty: e.target.value })}
                />
              </label>
              <div className="flex justify-end pb-1">
                <button
                  type="button"
                  onClick={() => removeLine(idx)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-rose-500/10 hover:text-rose-500"
                  aria-label="Remove line"
                  disabled={lines.length <= 1}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            disabled={creating}
            type="submit"
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 disabled:opacity-50"
          >
            {creating ? "Saving…" : "Create order"}
          </button>
        </div>
      </form>

      {loading ? (
        <div className="h-32 animate-pulse rounded-xl glass" />
      ) : (
        <DataTable
          columns={[
            { key: "invoiceNo", label: "Invoice" },
            { key: "customerName", label: "Customer" },
            { key: "status", label: "Status" },
            { key: "paymentStatus", label: "Payment" },
            { key: "amount", label: "Total" },
            { key: "actions", label: "Actions" },
          ]}
          rows={rows}
        />
      )}
    </div>
  );
}
