import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import CrudPage from "./CrudPage";
import DataTable from "../components/DataTable";
import { api } from "../lib/api";
import toast from "react-hot-toast";

export default function NotificationsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) return;
    (async () => {
      try {
        const { data } = await api.get("/notifications?limit=100");
        setItems(data.items || data);
      } catch {
        toast.error("Could not load notifications");
      } finally {
        setLoading(false);
      }
    })();
  }, [isAdmin]);

  if (isAdmin) {
    return <CrudPage title="Smart Notifications" endpoint="notifications" fields={["title", "message", "type", "priority"]} />;
  }

  if (loading) return <div className="h-32 animate-pulse rounded-xl glass" />;

  return (
    <div className="space-y-4">
      <div className="rounded-xl glass p-5">
        <h1 className="text-xl font-semibold">Notifications</h1>
        <p className="text-sm text-slate-500">Read-only feed. Admins can create and manage alerts.</p>
      </div>
      <DataTable
        columns={[
          { key: "title", label: "Title" },
          { key: "message", label: "Message" },
          { key: "type", label: "Type" },
          { key: "priority", label: "Priority" },
        ]}
        rows={items}
      />
    </div>
  );
}
