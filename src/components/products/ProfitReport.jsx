import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  Download,
  Filter,
  Package,
  RefreshCw,
  TrendingUp,
} from "lucide-react";

import { productService } from "../../services/product.service";
import { exportProfitReportPdf } from "../../utils/profitReport";

const money = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function ProfitReport({ products = [] }) {
  const [period, setPeriod] = useState("all");
  const [brand, setBrand] = useState("");
  const [productId, setProductId] = useState("");

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const [month, setMonth] = useState(
    new Date().getMonth() + 1,
  );

  const [year, setYear] = useState(
    new Date().getFullYear(),
  );

  // ----------------------------------------
  // Unique brands
  // ----------------------------------------

  const brands = useMemo(() => {
    return [
      ...new Set(
        products
          .map((product) => product.brand)
          .filter(Boolean),
      ),
    ].sort();
  }, [products]);

  // ----------------------------------------
  // Products filtered by selected brand
  // ----------------------------------------

  const productOptions = useMemo(() => {
    if (!brand) return products;

    return products.filter(
      (product) => product.brand === brand,
    );
  }, [products, brand]);

  // ----------------------------------------
  // Fetch report
  // ----------------------------------------

  const loadReport = async () => {
    try {
      setLoading(true);

      const params = {
        period,
      };

      if (period === "daily") {
        params.date = date;
      }

      if (period === "monthly") {
        params.year = year;
        params.month = month;
      }

      if (period === "yearly") {
        params.year = year;
      }

      if (brand) {
        params.brand = brand;
      }

      if (productId) {
        params.productId = productId;
      }

      const response = await productService.profitReport(params);

      setReport(response?.data?.data || null);
    } catch (error) {
      console.error("Profit report error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to load profit report",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [period, brand, productId, date, month, year]);

  // ----------------------------------------
  // Reset filters
  // ----------------------------------------

  const resetFilters = () => {
    setPeriod("all");
    setBrand("");
    setProductId("");

    setDate(new Date().toISOString().split("T")[0]);
    setMonth(new Date().getMonth() + 1);
    setYear(new Date().getFullYear());
  };

  // ----------------------------------------
  // Summary
  // ----------------------------------------

  const summary = report?.summary || {};

  const totalQuantity = Number(summary.totalQuantity || 0);
  const totalSales = Number(summary.totalSales || 0);
  const totalCost = Number(summary.totalCost || 0);
  const totalProfit = Number(summary.totalProfit || 0);

  const profitPercentage =
    totalCost > 0
      ? (totalProfit / totalCost) * 100
      : 0;

  // ----------------------------------------
  // Product report
  // ----------------------------------------

  const reportProducts = report?.products || [];

  // ----------------------------------------
  // PDF
  // ----------------------------------------

  const handleExportPdf = () => {
    exportProfitReportPdf({
      report,
      filters: {
        period,
        brand,
        productId,
        date,
        month,
        year,
      },
      products,
    });
  };

  return (
    <section className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}

      <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">
              <TrendingUp size={15} />

              Profit Analytics
            </div>

            <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
              Profit Report
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Analyse product and brand profit by period.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
            >
              <RefreshCw size={14} />

              Reset
            </button>

            <button
              type="button"
              onClick={handleExportPdf}
              disabled={loading || !report}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-xs font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download size={14} />

              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}

      <div className="border-b border-slate-100 bg-slate-50/60 px-5 py-4 sm:px-6">
        <div className="mb-3 flex items-center gap-2 text-xs font-bold text-slate-700">
          <Filter size={14} />

          Filters
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {/* Period */}

          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Period
            </label>

            <select
              value={period}
              onChange={(e) => {
                setPeriod(e.target.value);
              }}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="all">All</option>
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          {/* Brand */}

          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Brand
            </label>

            <select
              value={brand}
              onChange={(e) => {
                setBrand(e.target.value);
                setProductId("");
              }}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="">All Brands</option>

              {brands.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* Product */}

          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Product
            </label>

            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="">All Products</option>

              {productOptions.map((product) => (
                <option
                  key={product._id}
                  value={product._id}
                >
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          {/* Daily */}

          {period === "daily" && (
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500">
                Date
              </label>

              <div className="relative">
                <CalendarDays
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            </div>
          )}

          {/* Monthly */}

          {period === "monthly" && (
            <>
              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  Month
                </label>

                <select
                  value={month}
                  onChange={(e) =>
                    setMonth(Number(e.target.value))
                  }
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500"
                >
                  {[
                    "January",
                    "February",
                    "March",
                    "April",
                    "May",
                    "June",
                    "July",
                    "August",
                    "September",
                    "October",
                    "November",
                    "December",
                  ].map((name, index) => (
                    <option
                      key={name}
                      value={index + 1}
                    >
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  Year
                </label>

                <input
                  type="number"
                  value={year}
                  onChange={(e) =>
                    setYear(Number(e.target.value))
                  }
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500"
                />
              </div>
            </>
          )}

          {/* Yearly */}

          {period === "yearly" && (
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500">
                Year
              </label>

              <input
                type="number"
                value={year}
                onChange={(e) =>
                  setYear(Number(e.target.value))
                }
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* Summary */}

      <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-4 sm:px-6">
        <ReportCard
          icon={Package}
          label="Quantity Sold"
          value={totalQuantity.toLocaleString("en-IN")}
        />

        <ReportCard
          icon={BarChart3}
          label="Total Sales"
          value={money(totalSales)}
        />

        <ReportCard
          icon={IndianRupeeIcon}
          label="Total Cost"
          value={money(totalCost)}
        />

        <ReportCard
          icon={TrendingUp}
          label="Total Profit"
          value={money(totalProfit)}
          green
        />
      </div>

      {/* Profit percentage */}

      <div className="px-5 pb-5 sm:px-6">
        <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3">
          <span className="text-xs font-bold text-emerald-700">
            Overall Profit Percentage
          </span>

          <span className="text-sm font-extrabold text-emerald-700">
            {profitPercentage.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Table */}

      <div className="border-t border-slate-100">
        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
          <h3 className="text-sm font-bold text-slate-900">
            Product Profit Breakdown
          </h3>
        </div>

        {loading ? (
          <div className="flex min-h-[220px] items-center justify-center">
            <div className="text-sm font-semibold text-slate-400">
              Loading profit report...
            </div>
          </div>
        ) : reportProducts.length === 0 ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center px-5 text-center">
            <TrendingUp
              size={28}
              className="text-slate-300"
            />

            <p className="mt-3 text-sm font-bold text-slate-700">
              No profit data found
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Try changing your filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Product
                  </th>

                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Brand
                  </th>

                  <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Qty
                  </th>

                  <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Sales
                  </th>

                  <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Cost
                  </th>

                  <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Profit
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {reportProducts.map((item) => (
                  <tr
                    key={item.productId}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <p className="text-sm font-bold text-slate-900">
                        {item.name}
                      </p>

                      <p className="mt-0.5 text-[11px] text-slate-400">
                        {item.sku || "No SKU"}
                      </p>
                    </td>

                    <td className="px-4 py-4 text-sm font-semibold text-slate-600">
                      {item.brand || "—"}
                    </td>

                    <td className="px-4 py-4 text-right text-sm font-bold text-slate-700">
                      {Number(item.quantity || 0).toLocaleString(
                        "en-IN",
                      )}
                    </td>

                    <td className="px-4 py-4 text-right text-sm font-semibold text-slate-700">
                      {money(item.sales)}
                    </td>

                    <td className="px-4 py-4 text-right text-sm text-slate-500">
                      {money(item.cost)}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <p className="text-sm font-extrabold text-emerald-600">
                        {money(item.profit)}
                      </p>

                      <p className="mt-0.5 text-[10px] font-bold text-emerald-500">
                        {Number(
                          item.profitPercentage || 0,
                        ).toFixed(2)}
                        %
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

function ReportCard({
  icon: Icon,
  label,
  value,
  green = false,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-lg ${
          green
            ? "bg-emerald-100 text-emerald-600"
            : "bg-blue-100 text-blue-600"
        }`}
      >
        <Icon size={15} />
      </div>

      <p className="mt-3 text-[11px] font-semibold text-slate-500">
        {label}
      </p>

      <p
        className={`mt-1 text-lg font-extrabold ${
          green ? "text-emerald-600" : "text-slate-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function IndianRupeeIcon(props) {
  return <span {...props}>₹</span>;
}