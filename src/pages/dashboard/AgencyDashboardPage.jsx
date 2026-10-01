import { NavLink } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
import { dashboardService } from "../../services/dashboard.service";

import {
  Receipt,
  Boxes,
  Package,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Users,
  WalletCards,
} from "lucide-react";

const money = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
  })}`;

export default function AgencyDashboardPage() {
  const { data, loading } = useApi(dashboardService.agency, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  const billingByUser = Object.entries(data?.byUser || {});
  const recentBills = data?.recentBills || [];

  return (
    <div className="w-full">

      {/* Page heading */}
      <section className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            <span>Workspace</span>
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <span className="text-cyan-600">Dashboard</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[28px]">
            Agency Dashboard
          </h1>

          <p className="mt-1.5 text-sm text-slate-500">
            Monitor your business performance and billing activity.
          </p>
        </div>

        <NavLink
          to="/billing"
          className="inline-flex w-fit items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
        >
          <Receipt size={16} />
          Create bill
          <ArrowUpRight size={14} />
        </NavLink>
      </section>

      {/* Stats */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <PremiumStat
          label="Total billed"
          value={money(data?.totalBilled)}
          icon={<WalletCards size={18} />}
          meta="Revenue"
        />

        <PremiumStat
          label="Stock units"
          value={Number(data?.totalStock || 0).toLocaleString("en-IN")}
          icon={<Boxes size={18} />}
          meta="Available inventory"
        />

        <PremiumStat
          label="Stock value"
          value={money(data?.stockValue)}
          icon={<Package size={18} />}
          meta="Current inventory value"
        />

        <PremiumStat
          label="Low stock"
          value={Number(data?.lowStock || 0).toLocaleString("en-IN")}
          icon={<AlertTriangle size={18} />}
          meta="Needs attention"
          warning
        />
      </section>

      {/* Main dashboard grid */}
      <section className="mt-5 grid gap-4 xl:grid-cols-[0.82fr_1.18fr]">

        {/* Billing by user */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)]">

          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Billing by user
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Team billing contribution
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
              <Users size={17} />
            </div>
          </div>

          <div className="p-5">
            {billingByUser.length === 0 ? (
              <EmptyState
                icon={<Users size={19} />}
                text="No billing data available"
              />
            ) : (
              <div className="space-y-5">
                {billingByUser.map(([name, amount]) => {
                  const values = Object.values(data?.byUser || {});
                  const max = Math.max(...values.map(Number), 1);
                  const percentage = (Number(amount) / max) * 100;

                  return (
                    <div key={name}>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
                            {name?.charAt(0)?.toUpperCase() || "U"}
                          </div>

                          <span className="truncate text-sm font-medium text-slate-700">
                            {name}
                          </span>
                        </div>

                        <span className="shrink-0 text-sm font-bold text-slate-900">
                          {money(amount)}
                        </span>
                      </div>

                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-cyan-500 transition-all duration-500"
                          style={{
                            width: `${Math.max(percentage, 4)}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recent bills */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)]">

          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Recent bills
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Latest billing activity
              </p>
            </div>

            <NavLink
              to="/billing"
              className="flex items-center gap-1 text-xs font-semibold text-cyan-600 transition hover:text-cyan-700"
            >
              View all
              <ArrowUpRight size={14} />
            </NavLink>
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Bill
                  </th>

                  <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Store
                  </th>

                  <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    User
                  </th>

                  <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Total
                  </th>
                </tr>
              </thead>

              <tbody>
                {recentBills.map((bill) => (
                  <tr
                    key={bill._id || bill.billNo}
                    className="border-b border-slate-100 last:border-0 transition hover:bg-slate-50/70"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600">
                          <Receipt size={14} />
                        </div>

                        <span className="text-sm font-semibold text-slate-800">
                          {bill.billNo}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-sm text-slate-500">
                      {bill.store?.name || "—"}
                    </td>

                    <td className="px-5 py-3.5 text-sm text-slate-500">
                      {bill.createdBy?.name || "—"}
                    </td>

                    <td className="px-5 py-3.5 text-right text-sm font-bold text-slate-900">
                      {money(bill.grandTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile bills */}
          <div className="divide-y divide-slate-100 md:hidden">
            {recentBills.map((bill) => (
              <div
                key={bill._id || bill.billNo}
                className="p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600">
                      <Receipt size={15} />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-800">
                        {bill.billNo}
                      </p>

                      <p className="mt-0.5 truncate text-xs text-slate-400">
                        {bill.store?.name || "No store"}
                      </p>
                    </div>
                  </div>

                  <p className="shrink-0 text-sm font-bold text-slate-900">
                    {money(bill.grandTotal)}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    Created by
                  </span>

                  <span className="font-medium text-slate-600">
                    {bill.createdBy?.name || "—"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {recentBills.length === 0 && (
            <EmptyState
              icon={<Receipt size={19} />}
              text="No recent bills"
            />
          )}
        </div>
      </section>

    </div>
  );
}

function PremiumStat({
  label,
  value,
  icon,
  meta,
  warning = false,
}) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,0.035)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_8px_24px_rgba(15,23,42,0.07)]">
      <div className="flex items-start justify-between">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${
            warning
              ? "bg-amber-50 text-amber-600"
              : "bg-cyan-50 text-cyan-600"
          }`}
        >
          {icon}
        </div>

        <span
          className={`h-1.5 w-1.5 rounded-full ${
            warning ? "bg-amber-400" : "bg-emerald-400"
          }`}
        />
      </div>

      <div className="mt-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-[22px]">
          {value}
        </p>

        <p className="mt-1 text-[11px] text-slate-400">
          {meta}
        </p>
      </div>
    </div>
  );
}

function EmptyState({ icon, text }) {
  return (
    <div className="flex min-h-[180px] flex-col items-center justify-center text-center">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
        {icon}
      </div>

      <p className="text-sm text-slate-400">
        {text}
      </p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="w-full">
      <div className="mb-6">
        <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />
        <div className="mt-3 h-8 w-56 animate-pulse rounded-lg bg-slate-200" />
        <div className="mt-2 h-4 w-72 animate-pulse rounded bg-slate-200" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-[145px] animate-pulse rounded-2xl border border-slate-200 bg-white"
          />
        ))}
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[0.82fr_1.18fr]">
        <div className="h-[360px] animate-pulse rounded-2xl border border-slate-200 bg-white" />

        <div className="h-[360px] animate-pulse rounded-2xl border border-slate-200 bg-white" />
      </div>
    </div>
  );
}