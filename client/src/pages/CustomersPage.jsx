import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import DataTable from "../components/DataTable";
import { api } from "../lib/api";

const initialForm = { name: "", email: "", phone: "", address: "" };

export default function CustomersPage() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [history, setHistory] = useState(null);

  const load = async (nextPage = page) => {
    const { data } = await api.get(`/customers?q=${encodeURIComponent(q)}&page=${nextPage}&limit=8`);
    setItems(data.items || []);
    setPage(data.page || 1);
    setPages(data.pages || 1);
  };

  useEffect(() => {
    load(1);
  }, [q]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/customers/${editingId}`, form);
        toast.success("Customer updated");
      } else {
        await api.post("/customers", form);
        toast.success("Customer added");
      }
      setForm(initialForm);
      setEditingId(null);
      load(1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    }
  };

  const edit = (item) => {
    setEditingId(item._id);
    setForm({ name: item.name || "", email: item.email || "", phone: item.phone || "", address: item.address || "" });
  };

  const showHistory = async (item) => {
    const { data } = await api.get(`/customers/${item._id}/purchases`);
    setHistory({ customer: item, ...data });
  };

  const remove = async (id) => {
    await api.delete(`/customers/${id}`);
    toast.success("Customer deleted");
    load(page);
  };

  return (
    <div className="space-y-4">
      <div className="glass rounded-xl p-4">
        <h1 className="text-xl font-semibold">Customer Management</h1>
        <p className="text-sm text-slate-500">Track profiles, purchase history and total value from each customer.</p>
      </div>

      <div className="glass flex flex-wrap items-center gap-3 rounded-xl p-4">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search customer by name/email/phone" className="min-w-64 rounded-lg border bg-transparent px-3 py-2" />
        <span className="text-sm text-slate-500">Page {page} / {pages}</span>
      </div>

      <form onSubmit={submit} className="glass grid gap-3 rounded-xl p-4 md:grid-cols-4">
        {["name", "email", "phone", "address"].map((field) => (
          <input
            key={field}
            required={["name", "email"].includes(field)}
            value={form[field]}
            onChange={(e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))}
            placeholder={field}
            className="rounded-lg border bg-transparent px-3 py-2"
          />
        ))}
        <button className="rounded-lg bg-indigo-600 px-4 py-2 text-white">{editingId ? "Update Customer" : "Add Customer"}</button>
      </form>

      <DataTable
        columns={[
          { key: "name", label: "Name" },
          { key: "email", label: "Email" },
          { key: "phone", label: "Phone" },
          { key: "totalOrders", label: "Orders" },
          { key: "totalSpent", label: "Spent" },
          { key: "actions", label: "Actions" },
        ]}
        rows={items.map((item) => ({
          ...item,
          totalSpent: `INR ${Number(item.totalSpent || 0).toLocaleString()}`,
          actions: (
            <div className="flex gap-2 text-xs">
              <button onClick={() => showHistory(item)} className="text-emerald-500">History</button>
              <button onClick={() => edit(item)} className="text-indigo-500">Edit</button>
              <button onClick={() => remove(item._id)} className="text-rose-500">Delete</button>
            </div>
          ),
        }))}
      />

      <div className="flex justify-end gap-2">
        <button disabled={page <= 1} onClick={() => load(page - 1)} className="rounded-lg border px-3 py-1.5 disabled:opacity-40">Prev</button>
        <button disabled={page >= pages} onClick={() => load(page + 1)} className="rounded-lg border px-3 py-1.5 disabled:opacity-40">Next</button>
      </div>

      {history && (
        <div className="glass rounded-xl p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Purchase History · {history.customer.name}</h2>
            <button onClick={() => setHistory(null)} className="text-xs text-slate-500">Close</button>
          </div>
          <p className="mb-2 text-sm text-slate-500">
            Total Orders: {history.summary?.totalOrders || 0} · Completed: {history.summary?.completed || 0} · Total Spent: INR{" "}
            {Number(history.summary?.totalSpent || 0).toLocaleString()}
          </p>
          <DataTable
            columns={[
              { key: "invoiceNo", label: "Invoice" },
              { key: "status", label: "Status" },
              { key: "paymentStatus", label: "Payment" },
              { key: "totalAmount", label: "Amount" },
            ]}
            rows={(history.orders || []).map((o) => ({ ...o, totalAmount: `INR ${Number(o.totalAmount || 0).toLocaleString()}` }))}
          />
        </div>
      )}
    </div>
  );
}
