import { NavLink, Outlet } from "react-router-dom";
import {
  Bell,
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  TrendingUp,
  FileBarChart2,
  BrainCircuit,
  Settings,
  UserCircle2,
  MoonStar,
  Sun,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

const allLinks = [
  ["/dashboard", "Dashboard", LayoutDashboard],
  ["/products", "Products", Package],
  ["/customers", "Customers", Users],
  ["/orders", "Orders", ShoppingCart],
  ["/sales", "Sales", TrendingUp],
  ["/reports", "Reports", FileBarChart2],
  ["/analytics", "Analytics", FileBarChart2],
  ["/insights", "Smart Insights", BrainCircuit],
  ["/notifications", "Notifications", Bell],
  ["/settings", "Settings", Settings],
  ["/profile", "Profile", UserCircle2],
];

const adminOnlyPaths = new Set(["/reports", "/analytics", "/settings"]);

export default function Layout() {
  const { theme, toggle } = useTheme();
  const { user, logout } = useAuth();
  const links = allLinks.filter(([path]) => user?.role === "admin" || !adminOnlyPaths.has(path));

  return (
    <div className="min-h-screen md:grid md:grid-cols-[250px_1fr]">
      <aside className="glass space-y-3 p-4 md:min-h-screen">
        <h1 className="text-xl font-bold">BizFlow Manager</h1>
        {links.map(([to, label, Icon]) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-lg p-2 hover:bg-indigo-500/10 ${isActive ? "bg-indigo-500/20 text-indigo-500" : ""}`
            }
          >
            <Icon size={17} /> {label}
          </NavLink>
        ))}
      </aside>

      <main className="p-4 md:p-6">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">
              Welcome, {user?.name}
              {user?.role && (
                <span className="ml-2 rounded-full bg-indigo-500/15 px-2 py-0.5 text-xs capitalize text-indigo-600 dark:text-indigo-300">
                  {user.role}
                </span>
              )}
            </p>
            <h2 className="text-2xl font-semibold">Control Center</h2>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={toggle} className="glass rounded-lg px-3 py-2">
              {theme === "dark" ? <Sun size={16} /> : <MoonStar size={16} />}
            </button>
            <button type="button" onClick={logout} className="rounded-lg bg-rose-500/90 px-3 py-2 text-white">
              Logout
            </button>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
