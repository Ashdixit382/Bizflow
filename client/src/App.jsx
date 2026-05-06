import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import OrdersPage from "./pages/OrdersPage";
import Reports from "./pages/Reports";
import Insights from "./pages/Insights";
import SimplePage from "./pages/SimplePage";
import NotificationsPage from "./pages/NotificationsPage";
import ProductsPage from "./pages/ProductsPage";
import CustomersPage from "./pages/CustomersPage";
import CrudPage from "./pages/CrudPage";
import AnalyticsPage from "./pages/AnalyticsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />

        <Route
          path="products"
          element={<ProductsPage />}
        />

        <Route path="customers" element={<CustomersPage />} />

        <Route path="orders" element={<OrdersPage />} />

        <Route
          path="sales"
          element={<CrudPage title="Sales Management" endpoint="sales" fields={["amount", "cost", "profit"]} />}
        />

        <Route
          path="reports"
          element={
            <ProtectedRoute roles={["admin"]}>
              <Reports />
            </ProtectedRoute>
          }
        />

        <Route
          path="analytics"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="settings"
          element={
            <ProtectedRoute roles={["admin"]}>
              <SimplePage title="Settings" desc="Company profile, security, invoicing and preferences." />
            </ProtectedRoute>
          }
        />

        <Route path="profile" element={<SimplePage title="Profile" desc="Manage your account details." />} />

        <Route path="notifications" element={<NotificationsPage />} />

        <Route path="insights" element={<Insights />} />
      </Route>
    </Routes>
  );
}
