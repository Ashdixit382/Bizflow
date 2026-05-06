import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function Insights() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [insights, setInsights] = useState([]);
  const [healthScore, setHealthScore] = useState(82);

  const refresh = async () => {
    try {
      const { data } = await api.post("/insights/refresh");
      setInsights(data.insights || []);
      if (typeof data.healthScore === "number") setHealthScore(data.healthScore);
      toast.success("Insights regenerated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Only admins can refresh insights");
    }
  };

  useEffect(() => {
    api.get("/insights").then((r) => setInsights(r.data));
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl glass p-4">
        <div>
          <h1 className="text-xl font-semibold">Business Insights Engine</h1>
          <p className="mt-1 text-sm text-slate-500">
            Business Health Score: <span className="font-bold text-emerald-500">{healthScore}/100</span>
          </p>
          {!isAdmin && <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">Regenerate is restricted to admins.</p>}
        </div>
        {isAdmin ? (
          <button onClick={refresh} type="button" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white">
            Regenerate insights
          </button>
        ) : null}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {insights.map((i) => (
          <article key={i._id} className="rounded-xl glass p-4">
            <p className="text-xs uppercase text-indigo-500">{i.category}</p>
            <h3 className="font-semibold">{i.title}</h3>
            <p className="text-sm text-slate-500">{i.description}</p>
            <p className="mt-2 text-sm">Recommendation: {i.recommendation}</p>
            <p className="mt-2 text-xs text-slate-500">
              Confidence: {i.confidence}% · Priority: {i.priority}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
