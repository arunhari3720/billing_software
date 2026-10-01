import { useMemo, useState } from "react";
import { useApi } from "../../hooks/useApi";
import { stockService } from "../../services/stock.service";
import {
  Boxes,
  Package,
  History,
  Search,
  AlertTriangle,
  TrendingUp,
  X,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const money = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
  })}`;

export default function StockPage() {
  const { data: apiData, loading } = useApi(
    stockService.summary,
    [],
  );

  const data = apiData || {};

  const products = Array.isArray(data.products)
    ? data.products
    : [];

  const movements = Array.isArray(data.movements)
    ? data.movements
    : [];

  const [search, setSearch] = useState("");

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return products;

    return products.filter((product) =>
      [
        product.name,
        product.sku,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(query),
        ),
    );
  }, [products, search]);

  const lowStockCount = useMemo(
    () =>
      products.filter(
        (product) =>
          Number(product.stockQty || 0) <=
          Number(product.lowStockThreshold ?? 5),
      ).length,
    [products],
  );

  if (loading) {
    return <StockSkeleton />;
  }

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">

        {/* Header */}
        <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              <Boxes size={14} />
              Inventory
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Stock
            </h1>

            <p className="mt-1.5 text-sm text-slate-500">
              Monitor inventory levels, stock value and movement history.
            </p>
          </div>

          {lowStockCount > 0 && (
            <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs font-bold text-amber-700">
              <AlertTriangle size={15} />
              {lowStockCount} low stock item
              {lowStockCount !== 1 ? "s" : ""}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-3">

          <StockStat
            label="Total units"
            value={Number(data.totalUnits || 0).toLocaleString(
              "en-IN",
            )}
            description="Units currently available"
            icon={Boxes}
            iconClass="bg-blue-50 text-blue-600"
          />

          <StockStat
            label="Stock value"
            value={money(data.stockValue)}
            description="Current inventory value"
            icon={Package}
            iconClass="bg-violet-50 text-violet-600"
          />

          <StockStat
            label="Movements"
            value={movements.length.toLocaleString("en-IN")}
            description="Recorded stock movements"
            icon={History}
            iconClass="bg-emerald-50 text-emerald-600"
          />
        </div>

        {/* Products */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Toolbar */}
          <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Inventory overview
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                {filteredProducts.length} product
                {filteredProducts.length !== 1 ? "s" : ""} shown
              </p>
            </div>

            <div className="relative w-full sm:max-w-sm">
              <Search
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search product or SKU..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <EmptyStock
              hasSearch={Boolean(search)}
            />
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[750px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70">
                      <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Product
                      </th>

                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        SKU
                      </th>

                      <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Price
                      </th>

                      <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Remaining
                      </th>

                      <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.map((product) => {
                      const stock = Number(
                        product.stockQty || 0,
                      );

                      const threshold = Number(
                        product.lowStockThreshold ?? 5,
                      );

                      return (
                        <tr
                          key={product._id}
                          className="transition hover:bg-slate-50/70"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <Package size={18} />
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-slate-900">
                                  {product.name}
                                </p>

                                <p className="mt-0.5 text-xs text-slate-400">
                                  Inventory item
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-semibold text-slate-600">
                              {product.sku || "—"}
                            </span>
                          </td>

                          <td className="px-4 py-4 text-right text-sm font-bold text-slate-900">
                            {money(product.price)}
                          </td>

                          <td className="px-4 py-4 text-right">
                            <span
                              className={`text-sm font-extrabold ${
                                stock === 0
                                  ? "text-rose-600"
                                  : stock <= threshold
                                    ? "text-amber-600"
                                    : "text-slate-900"
                              }`}
                            >
                              {stock.toLocaleString("en-IN")}
                            </span>

                            <p className="mt-0.5 text-[10px] text-slate-400">
                              units
                            </p>
                          </td>

                          <td className="px-6 py-4 text-right">
                            <StockBadge
                              stock={stock}
                              threshold={threshold}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="divide-y divide-slate-100 md:hidden">
                {filteredProducts.map((product) => {
                  const stock = Number(
                    product.stockQty || 0,
                  );

                  const threshold = Number(
                    product.lowStockThreshold ?? 5,
                  );

                  return (
                    <div
                      key={product._id}
                      className="p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                          <Package size={18} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="truncate text-sm font-bold text-slate-900">
                                {product.name}
                              </h3>

                              <p className="mt-1 font-mono text-[11px] text-slate-400">
                                {product.sku || "No SKU"}
                              </p>
                            </div>

                            <p className="shrink-0 text-sm font-bold text-slate-900">
                              {money(product.price)}
                            </p>
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-2">
                            <MobileInfo
                              label="Remaining"
                              value={`${stock.toLocaleString(
                                "en-IN",
                              )} units`}
                            />

                            <MobileInfo
                              label="Threshold"
                              value={`${threshold} units`}
                            />
                          </div>

                          <div className="mt-3">
                            <StockBadge
                              stock={stock}
                              threshold={threshold}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>

        {/* Movement History */}
        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <History size={17} />
              </div>

              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Recent movements
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  Latest inventory activity
                </p>
              </div>
            </div>

            <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">
              {movements.length} total
            </span>
          </div>

          {movements.length === 0 ? (
            <div className="flex min-h-[180px] flex-col items-center justify-center px-5 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                <History size={19} />
              </div>

              <p className="mt-3 text-sm font-bold text-slate-800">
                No stock movements
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Inventory movement history will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {movements.slice(0, 8).map((movement, index) => (
                <MovementRow
                  key={
                    movement._id ||
                    movement.id ||
                    index
                  }
                  movement={movement}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function StockStat({
  label,
  value,
  description,
  icon: Icon,
  iconClass,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-500">
            {label}
          </p>

          <p className="mt-2 truncate text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
            {value}
          </p>

          <p className="mt-1 text-[11px] text-slate-400">
            {description}
          </p>
        </div>

        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={17} />
        </div>
      </div>
    </div>
  );
}

function StockBadge({ stock, threshold }) {
  if (stock === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-bold text-rose-600">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
        Out of stock
      </span>
    );
  }

  if (stock <= threshold) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-600">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        Low stock
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      Healthy
    </span>
  );
}

function MobileInfo({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 px-2.5 py-2">
      <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-0.5 truncate text-xs font-semibold text-slate-700">
        {value}
      </p>
    </div>
  );
}

function MovementRow({ movement }) {
  const quantity = Number(
    movement.qty ??
      movement.quantity ??
      movement.change ??
      0,
  );

  const positive = quantity >= 0;

  return (
    <div className="flex items-center gap-3 px-5 py-3.5 sm:px-6">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
          positive
            ? "bg-emerald-50 text-emerald-600"
            : "bg-rose-50 text-rose-600"
        }`}
      >
        {positive ? (
          <ArrowUpRight size={17} />
        ) : (
          <ArrowDownRight size={17} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-800">
          {movement.product?.name ||
            movement.productName ||
            movement.name ||
            "Stock movement"}
        </p>

        <p className="mt-0.5 text-[11px] text-slate-400">
          {movement.type ||
            movement.reason ||
            "Inventory update"}
        </p>
      </div>

      <div className="text-right">
        <p
          className={`text-sm font-extrabold ${
            positive
              ? "text-emerald-600"
              : "text-rose-600"
          }`}
        >
          {positive ? "+" : ""}
          {quantity}
        </p>

        {movement.createdAt && (
          <p className="mt-0.5 text-[10px] text-slate-400">
            {new Date(
              movement.createdAt,
            ).toLocaleDateString("en-IN")}
          </p>
        )}
      </div>
    </div>
  );
}

function EmptyStock({ hasSearch }) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        {hasSearch ? (
          <Search size={24} />
        ) : (
          <Boxes size={24} />
        )}
      </div>

      <h3 className="mt-4 text-sm font-bold text-slate-900">
        {hasSearch
          ? "No products found"
          : "No inventory available"}
      </h3>

      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
        {hasSearch
          ? "Try searching with a different product name or SKU."
          : "Products with available inventory will appear here."}
      </p>
    </div>
  );
}

function StockSkeleton() {
  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">

        <div className="mb-7 animate-pulse space-y-3">
          <div className="h-3 w-24 rounded bg-slate-200" />
          <div className="h-8 w-32 rounded bg-slate-200" />
          <div className="h-3 w-72 rounded bg-slate-200" />
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="h-16 animate-pulse border-b border-slate-100 bg-slate-50" />

          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="flex animate-pulse items-center gap-4 border-b border-slate-100 px-6 py-5"
            >
              <div className="h-10 w-10 rounded-xl bg-slate-100" />

              <div className="flex-1 space-y-2">
                <div className="h-3 w-40 rounded bg-slate-100" />
                <div className="h-2.5 w-24 rounded bg-slate-100" />
              </div>

              <div className="h-3 w-20 rounded bg-slate-100" />
              <div className="h-3 w-16 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}