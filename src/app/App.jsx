import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "../hooks/useAuth";
import AppShell from "../components/layout/AppShell";
import ProtectedRoute from "../components/layout/ProtectedRoute";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import AgencyDashboardPage from "../pages/dashboard/AgencyDashboardPage";
import MasterDashboardPage from "../pages/dashboard/MasterDashboardPage";
import AgenciesPage from "../pages/agencies/AgenciesPage";
import ProductsPage from "../pages/products/ProductsPage";
import StoresPage from "../pages/stores/StoresPage";
import UsersPage from "../pages/users/UsersPage";
import StockPage from "../pages/stock/StockPage";
import BillingPage from "../pages/billing/BillingPage";
import OptionalBillingPage from "../pages/billing/OptionalBillingPage";
export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppShell>
                <AppRoutes />
              </AppShell>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route
        path="/"
        element={
          user.role === "MASTER" ? (
            <MasterDashboardPage />
          ) : (
            <AgencyDashboardPage />
          )
        }
      />
      {user.role === "MASTER" && (
        <Route path="/agencies" element={<AgenciesPage />} />
      )}{" "}
      {user.role !== "MASTER" && (
        <>
          <Route path="/billing" element={<BillingPage />} />
          <Route path="/optional-billing" element={<OptionalBillingPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/stores" element={<StoresPage />} />
          <Route path="/stock" element={<StockPage />} />
          <Route path="/users" element={<UsersPage />} />
        </>
      )}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
