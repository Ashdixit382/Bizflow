import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import DataTable from "../components/DataTable";
import { api } from "../lib/api";

const initialForm = {
  name: "",
  category: "",
  sku: "",
  stock: "",
  price: "",
  costPrice: "",
  supplier: "",
  image: "",
};

const apiOrigin = (import.meta.env.VITE_API_URL || "").replace("/api", "");

export default function ProductsPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("-createdAt");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const load = async (nextPage = page) => {
    const { data } = await api.get(
      `/products?q=${encodeURIComponent(q)}&category=${encodeURIComponent(category)}&sort=${encodeURIComponent(sort)}&page=${nextPage}&limit=8`
    );
    setItems(data.items || []);
    setCategories(data.categories || []);
    setPage(data.page || 1);
    setPages(data.pages || 1);
  };

  useEffect(() => {
    load(1);
  }, [q, category, sort]);

  const uploadImage = async () => {
    if (!imageFile) return form.image;
    const payload = new FormData();
    payload.append("image", imageFile);
    const { data } = await api.post("/products/upload", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.image;
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      const image = await uploadImage();
      const payload = { ...form, image };
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
        toast.success("Product updated");
      } else {
        await api.post("/products", payload);
        toast.success("Product added");
      }
      setForm(initialForm);
      setEditingId(null);
      setImageFile(null);
      load(1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    }
  };

  const edit = (item) => {
    setEditingId(item._id);
    setForm({
      name: item.name || "",
      category: item.category || "",
      sku: item.sku || "",
      stock: String(item.stock ?? ""),
      price: String(item.price ?? ""),
      costPrice: String(item.costPrice ?? ""),
      supplier: item.supplier || "",
      image: item.image || "",
    });
  };

  const remove = async (id) => {
    await api.delete(`/products/${id}`);
    toast.success("Product deleted");
    load(page);
  };

  const rows = items.map((item) => ({
    ...item,
    imageCell: item.image ? (
      <img
        src={item.image.startsWith("http") ? item.image : `${apiOrigin}${item.image}`}
        alt={item.name}
        className="h-10 w-10 rounded-md object-cover"
      />
    ) : (
      <span className="text-xs text-slate-400">No image</span>
    ),
    stockStatus:
      Number(item.stock) <= 10 ? (
        <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-xs text-rose-500">Low ({item.stock})</span>
      ) : (
        <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-500">{item.stock}</span>
      ),
    actions: (
      <div className="flex gap-2 text-xs">
        <button onClick={() => edit(item)} className="text-indigo-500">
          Edit
        </button>
        <button onClick={() => remove(item._id)} className="text-rose-500">
          Delete
        </button>
      </div>
    ),
  }));

  return (
    <div className="space-y-4">
      <div className="glass rounded-xl p-4">
        <h1 className="text-xl font-semibold">Product Management</h1>
        <p className="text-sm text-slate-500">Image upload, stock tracking, category filtering, sorting and pagination.</p>
      </div>

      <div className="glass grid gap-3 rounded-xl p-4 md:grid-cols-4">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, SKU, supplier" className="rounded-lg border bg-transparent px-3 py-2" />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-lg border bg-transparent px-3 py-2">
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-lg border bg-transparent px-3 py-2">
          <option value="-createdAt">Newest</option>
          <option value="createdAt">Oldest</option>
          <option value="price">Price: Low to high</option>
          <option value="-price">Price: High to low</option>
          <option value="stock">Stock: Low to high</option>
          <option value="-stock">Stock: High to low</option>
        </select>
        <div className="text-sm text-slate-500">Page {page} / {pages}</div>
      </div>

      <form onSubmit={submit} className="glass grid gap-3 rounded-xl p-4 md:grid-cols-4">
        {["name", "category", "sku", "stock", "price", "costPrice", "supplier"].map((field) => (
          <input
            key={field}
            required={["name", "category", "sku", "price", "costPrice"].includes(field)}
            value={form[field]}
            onChange={(e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))}
            placeholder={field}
            className="rounded-lg border bg-transparent px-3 py-2"
          />
        ))}
        <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="rounded-lg border px-3 py-2 text-sm" />
        <button className="rounded-lg bg-indigo-600 px-4 py-2 text-white">{editingId ? "Update Product" : "Add Product"}</button>
      </form>

      <DataTable
        columns={[
          { key: "imageCell", label: "Image" },
          { key: "name", label: "Name" },
          { key: "category", label: "Category" },
          { key: "sku", label: "SKU" },
          { key: "stockStatus", label: "Stock" },
          { key: "price", label: "Price" },
          { key: "actions", label: "Actions" },
        ]}
        rows={rows}
      />

      <div className="flex justify-end gap-2">
        <button disabled={page <= 1} onClick={() => load(page - 1)} className="rounded-lg border px-3 py-1.5 disabled:opacity-40">
          Prev
        </button>
        <button disabled={page >= pages} onClick={() => load(page + 1)} className="rounded-lg border px-3 py-1.5 disabled:opacity-40">
          Next
        </button>
      </div>
    </div>
  );
}
