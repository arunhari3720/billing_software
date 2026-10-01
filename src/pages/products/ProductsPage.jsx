import { useMemo, useState } from "react";
import {
  Package,
  Plus,
  Search,
  Boxes,
  AlertTriangle,
  IndianRupee,
  X,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import { productService } from "../../services/product.service";
import { useApi } from "../../hooks/useApi";

const money = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
  })}`;

export default function ProductsPage() {
  const {
  data: apiData,
  loading,
  reload,
} = useApi(productService.list, []);

const data = Array.isArray(apiData) ? apiData : [];

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const [f, setF] = useState({
    name: "",
    sku: "",
    category: "",
    price: "",
    stockQty: "",
    gstRate: 18,
    lowStockThreshold: 5,
  });

  const set = (key, value) => {
    setF((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const resetForm = () => {
    setF({
      name: "",
      sku: "",
      category: "",
      price: "",
      stockQty: "",
      gstRate: 18,
      lowStockThreshold: 5,
    });
  };

  const closeModal = () => {
    if (saving) return;
    setOpen(false);
    resetForm();
  };

  const save = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      await productService.create({
        ...f,
        price: Number(f.price),
        stockQty: Number(f.stockQty),
        gstRate: Number(f.gstRate),
        lowStockThreshold: Number(f.lowStockThreshold),
      });

      closeModal();
      reload();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to create product",
      );
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return data;

    return data.filter((product) =>
      [
        product.name,
        product.sku,
        product.category,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(query),
        ),
    );
  }, [data, search]);

  const stats = useMemo(() => {
    const totalStock = data.reduce(
      (sum, product) => sum + Number(product.stockQty || 0),
      0,
    );

    const lowStock = data.filter(
      (product) =>
        Number(product.stockQty || 0) <=
        Number(product.lowStockThreshold ?? 5),
    ).length;

    const inventoryValue = data.reduce(
      (sum, product) =>
        sum +
        Number(product.price || 0) *
          Number(product.stockQty || 0),
      0,
    );

    return {
      totalProducts: data.length,
      totalStock,
      lowStock,
      inventoryValue,
    };
  }, [data]);

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">

        {/* Header */}
        <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              <Package size={14} />
              Inventory
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Products
            </h1>

            <p className="mt-1.5 text-sm text-slate-500">
              Manage your product catalogue, pricing, GST and stock.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md"
          >
            <Plus size={17} />
            Add product
          </button>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            icon={Package}
            label="Total products"
            value={stats.totalProducts}
            description="Products in catalogue"
          />

          <StatCard
            icon={Boxes}
            label="Total stock"
            value={stats.totalStock.toLocaleString("en-IN")}
            description="Units available"
          />

          <StatCard
            icon={AlertTriangle}
            label="Low stock"
            value={stats.lowStock}
            description="Needs attention"
            warning={stats.lowStock > 0}
          />

          <StatCard
            icon={IndianRupee}
            label="Inventory value"
            value={money(stats.inventoryValue)}
            description="Based on selling price"
          />
        </div>

        {/* Product List */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Toolbar */}
          <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Product catalogue
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
                placeholder="Search products, SKU or category..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Loading */}
          {loading ? (
            <ProductSkeleton />
          ) : filteredProducts.length === 0 ? (
            <EmptyProducts
              hasSearch={Boolean(search)}
              onAdd={() => setOpen(true)}
            />
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70">
                      <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Product
                      </th>

                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        SKU
                      </th>

                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Category
                      </th>

                      <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Price
                      </th>

                      <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        GST
                      </th>

                      <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Stock
                      </th>

                      <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.map((product) => {
                      const stock = Number(product.stockQty || 0);
                      const threshold = Number(
                        product.lowStockThreshold ?? 5,
                      );

                      const low = stock <= threshold;
                      const out = stock === 0;

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
                                  {product._id?.slice(-8) || "—"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-semibold text-slate-600">
                              {product.sku || "—"}
                            </span>
                          </td>

                          <td className="px-4 py-4 text-sm text-slate-600">
                            {product.category || "Uncategorized"}
                          </td>

                          <td className="px-4 py-4 text-right text-sm font-bold text-slate-900">
                            {money(product.price)}
                          </td>

                          <td className="px-4 py-4 text-center">
                            <span className="rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-bold text-violet-600">
                              {product.gstRate}%
                            </span>
                          </td>

                          <td className="px-4 py-4 text-right">
                            <span
                              className={`text-sm font-bold ${
                                out
                                  ? "text-rose-600"
                                  : low
                                    ? "text-amber-600"
                                    : "text-slate-900"
                              }`}
                            >
                              {stock.toLocaleString("en-IN")}
                            </span>
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

              {/* Mobile */}
              <div className="divide-y divide-slate-100 md:hidden">
                {filteredProducts.map((product) => {
                  const stock = Number(product.stockQty || 0);
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
                            <div>
                              <h3 className="text-sm font-bold text-slate-900">
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

                          <div className="mt-4 grid grid-cols-3 gap-2">
                            <MobileInfo
                              label="Category"
                              value={product.category || "—"}
                            />

                            <MobileInfo
                              label="GST"
                              value={`${product.gstRate}%`}
                            />

                            <MobileInfo
                              label="Stock"
                              value={stock.toLocaleString("en-IN")}
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
      </div>

      {/* Add Product Modal */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Plus size={17} />
                  </div>

                  <h2 className="text-lg font-bold text-slate-900">
                    Add product
                  </h2>
                </div>

                <p className="mt-1 pl-11 text-xs text-slate-500">
                  Add a new product to your catalogue.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={save}>
              <div className="max-h-[65vh] overflow-y-auto px-5 py-5 sm:px-6">

                <div className="grid gap-4 sm:grid-cols-2">

                  <Field
                    label="Product name"
                    required
                    value={f.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="e.g. Wireless Mouse"
                    className="sm:col-span-2"
                  />

                  <Field
                    label="SKU"
                    value={f.sku}
                    onChange={(e) => set("sku", e.target.value)}
                    placeholder="e.g. WM-001"
                  />

                  <Field
                    label="Category"
                    value={f.category}
                    onChange={(e) =>
                      set("category", e.target.value)
                    }
                    placeholder="e.g. Electronics"
                  />

                  <Field
                    label="Price"
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={f.price}
                    onChange={(e) => set("price", e.target.value)}
                    placeholder="0.00"
                    prefix="₹"
                  />

                  <Field
                    label="Opening stock"
                    required
                    type="number"
                    min="0"
                    value={f.stockQty}
                    onChange={(e) =>
                      set("stockQty", e.target.value)
                    }
                    placeholder="0"
                  />

                  <Field
                    label="GST rate"
                    required
                    type="number"
                    min="0"
                    max="100"
                    value={f.gstRate}
                    onChange={(e) =>
                      set("gstRate", e.target.value)
                    }
                    placeholder="18"
                    suffix="%"
                  />

                  <Field
                    label="Low stock threshold"
                    type="number"
                    min="0"
                    value={f.lowStockThreshold}
                    onChange={(e) =>
                      set(
                        "lowStockThreshold",
                        e.target.value,
                      )
                    }
                    placeholder="5"
                  />
                </div>

                <div className="mt-5 flex items-start gap-2 rounded-xl bg-blue-50 p-3.5 text-xs leading-5 text-blue-700">
                  <CheckCircle2
                    size={15}
                    className="mt-0.5 shrink-0"
                  />
                  <span>
                    The opening stock will be added to this product's
                    available inventory.
                  </span>
                </div>
              </div>

              <div className="flex gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4 sm:px-6">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="h-11 flex-1 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex h-11 flex-[1.5] items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saving ? (
                    <>
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Save product
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  description,
  warning = false,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-500">
            {label}
          </p>

          <p
            className={`mt-2 truncate text-xl font-extrabold tracking-tight sm:text-2xl ${
              warning ? "text-amber-600" : "text-slate-900"
            }`}
          >
            {value}
          </p>

          <p className="mt-1 text-[11px] text-slate-400">
            {description}
          </p>
        </div>

        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
            warning
              ? "bg-amber-50 text-amber-600"
              : "bg-blue-50 text-blue-600"
          }`}
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
      In stock
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

function Field({
  label,
  required,
  prefix,
  suffix,
  className = "",
  ...props
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-xs font-semibold text-slate-700">
        {label}
        {required && (
          <span className="ml-1 text-rose-500">*</span>
        )}
      </label>

      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
            {prefix}
          </span>
        )}

        <input
          {...props}
          required={required}
          className={`h-11 w-full rounded-xl border border-slate-200 bg-white text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 ${
            prefix ? "pl-8" : "pl-3.5"
          } ${suffix ? "pr-8" : "pr-3.5"}`}
        />

        {suffix && (
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function EmptyProducts({ hasSearch, onAdd }) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        {hasSearch ? (
          <Search size={24} />
        ) : (
          <Package size={24} />
        )}
      </div>

      <h3 className="mt-4 text-sm font-bold text-slate-900">
        {hasSearch ? "No products found" : "No products yet"}
      </h3>

      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
        {hasSearch
          ? "Try a different product name, SKU or category."
          : "Start building your catalogue by adding your first product."}
      </p>

      {!hasSearch && (
        <button
          type="button"
          onClick={onAdd}
          className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white transition hover:bg-blue-700"
        >
          <Plus size={15} />
          Add product
        </button>
      )}
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="divide-y divide-slate-100">
      {[1, 2, 3, 4, 5].map((item) => (
        <div
          key={item}
          className="flex animate-pulse items-center gap-4 px-6 py-5"
        >
          <div className="h-10 w-10 rounded-xl bg-slate-100" />

          <div className="flex-1 space-y-2">
            <div className="h-3 w-40 rounded bg-slate-100" />
            <div className="h-2.5 w-24 rounded bg-slate-100" />
          </div>

          <div className="hidden h-3 w-20 rounded bg-slate-100 md:block" />
          <div className="hidden h-3 w-16 rounded bg-slate-100 md:block" />
          <div className="h-3 w-14 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}