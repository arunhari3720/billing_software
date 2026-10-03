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
  Eye,
  Pencil,
  AlertCircle,
  Save,
  Trash2,
} from "lucide-react";

import { productService } from "../../services/product.service";

import ProfitReport from "../../components/products/ProfitReport";

import { useApi } from "../../hooks/useApi";

const money = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,

    maximumFractionDigits: 2,
  })}`;

const calculatePricingPreview = ({
  rawPrice,

  gstRate,

  marginPercentage,
}) => {
  const raw = Number(rawPrice || 0);

  const gst = Number(gstRate || 0);

  const margin = Number(marginPercentage || 0);

  const rawGstAmount = (raw * gst) / 100;

  const rawTotalPrice = raw + rawGstAmount;

  const marginPrice = (rawTotalPrice * margin) / 100;

  const marginGst = (marginPrice * gst) / 100;

  const retailPrice = rawTotalPrice + marginPrice + marginGst;

  return {
    rawGstAmount,

    rawTotalPrice,

    marginPrice,

    marginGst,

    retailPrice,
  };
};

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

  const [drawerOpen, setDrawerOpen] = useState(false);

  const [drawerMode, setDrawerMode] = useState("view");

  const [selectedProduct, setSelectedProduct] = useState(null);

  const [deleteOpen, setDeleteOpen] = useState(false);

  const [deleting, setDeleting] = useState(false);

  const [updating, setUpdating] = useState(false);

  const [f, setF] = useState({
    name: "",

    brand: "",

    sku: "",

    category: "",

    rawPrice: "",

    marginPercentage: "",

    stockQty: "",

    gstRate: 18,

    lowStockThreshold: 5,
  });

  const [editForm, setEditForm] = useState({
    name: "",

    brand: "",

    sku: "",

    category: "",

    rawPrice: "",

    marginPercentage: "",

    stockQty: "",

    gstRate: 0,

    lowStockThreshold: 5,
  });

  const setEdit = (key, value) => {
    setEditForm((current) => ({
      ...current,

      [key]: value,
    }));
  };

  const openDrawer = (product, mode = "view") => {
    setSelectedProduct(product);

    setDrawerMode(mode);

    setEditForm({
      name: product.name || "",

      brand: product.brand || "",

      sku: product.sku || "",

      category: product.category || "",

      rawPrice: product.rawPrice ?? "",

      marginPercentage: product.marginPercentage ?? "",

      stockQty: product.stockQty ?? "",

      gstRate: product.gstRate ?? 0,

      lowStockThreshold: product.lowStockThreshold ?? 5,
    });

    setDeleteOpen(false);

    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    if (updating || deleting) return;

    setDrawerOpen(false);

    setSelectedProduct(null);

    setDeleteOpen(false);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    const rawPrice = Number(editForm.rawPrice);

    const marginPercentage = Number(editForm.marginPercentage);

    const stockQty = Number(editForm.stockQty);

    const gstRate = Number(editForm.gstRate);

    const lowStockThreshold = Number(editForm.lowStockThreshold);

    if (!Number.isFinite(rawPrice) || rawPrice < 0) {
      alert("Please enter a valid raw price.");

      return;
    }

    if (
      !Number.isFinite(marginPercentage) ||
      marginPercentage < 0 ||
      marginPercentage > 1000
    ) {
      alert("Please enter a valid margin percentage.");

      return;
    }

    if (!Number.isFinite(stockQty) || stockQty < 0) {
      alert("Please enter a valid stock quantity.");

      return;
    }

    if (!Number.isFinite(gstRate) || gstRate < 0 || gstRate > 100) {
      alert("Please enter a valid GST rate.");

      return;
    }

    if (!Number.isFinite(lowStockThreshold) || lowStockThreshold < 0) {
      alert("Please enter a valid low stock threshold.");

      return;
    }

    try {
      setUpdating(true);

      await productService.update(selectedProduct._id, {
        name: editForm.name.trim(),

        brand: editForm.brand.trim(),

        sku: editForm.sku.trim(),

        category: editForm.category.trim(),

        rawPrice,

        marginPercentage,

        stockQty,

        gstRate,

        lowStockThreshold,
      });

      setDrawerOpen(false);

      setSelectedProduct(null);

      reload();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update product");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct?._id) return;

    try {
      setDeleting(true);

      await productService.remove(selectedProduct._id);

      setDeleteOpen(false);

      setDrawerOpen(false);

      setSelectedProduct(null);

      reload();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete product");
    } finally {
      setDeleting(false);
    }
  };

  const set = (key, value) => {
    setF((current) => ({
      ...current,

      [key]: value,
    }));
  };

  const resetForm = () => {
    setF({
      name: "",

      brand: "",

      sku: "",

      category: "",

      rawPrice: "",

      marginPercentage: "",

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

    const rawPrice = Number(f.rawPrice);

    const gstRate = Number(f.gstRate);

    const marginPercentage = Number(f.marginPercentage);

    const stockQty = Number(f.stockQty);

    const lowStockThreshold = Number(f.lowStockThreshold);

    if (!Number.isFinite(rawPrice) || rawPrice < 0) {
      alert("Please enter a valid raw price.");

      return;
    }

    if (!Number.isFinite(gstRate) || gstRate < 0 || gstRate > 100) {
      alert("Please enter a valid GST rate.");

      return;
    }

    if (
      !Number.isFinite(marginPercentage) ||
      marginPercentage < 0 ||
      marginPercentage > 1000
    ) {
      alert("Please enter a valid margin percentage.");

      return;
    }

    if (!Number.isFinite(stockQty) || stockQty < 0) {
      alert("Please enter a valid stock quantity.");

      return;
    }

    if (!Number.isFinite(lowStockThreshold) || lowStockThreshold < 0) {
      alert("Please enter a valid low stock threshold.");

      return;
    }

    try {
      setSaving(true);

      await productService.create({
        name: f.name.trim(),

        brand: f.brand.trim(),

        sku: f.sku.trim(),

        category: f.category.trim(),

        rawPrice,

        marginPercentage,

        stockQty,

        gstRate,

        lowStockThreshold,
      });

      closeModal();

      reload();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to create product");
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return data;

    return data.filter((product) =>
      [product.name, product.brand, product.sku, product.category]

        .filter(Boolean)

        .some((value) =>
          String(value)
            .toLowerCase()

            .includes(query),
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
        Number(product.stockQty || 0) <= Number(product.lowStockThreshold ?? 5),
    ).length;

    const inventoryValue = data.reduce(
      (sum, product) =>
        sum + Number(product.retailPrice || 0) * Number(product.stockQty || 0),

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
            description="Based on retail price"
          />
        </div>

        {/* Profit Report */}

        <ProfitReport products={data} />

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
                placeholder="Search products, brand, SKU or category..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
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
                <table className="w-full min-w-[1350px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70">
                      <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Product
                      </th>

                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Brand
                      </th>

                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        SKU
                      </th>

                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Category
                      </th>

                      <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Raw Price
                      </th>

                      <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Margin
                      </th>

                      <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Margin Price
                      </th>

                      <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Retail Price
                      </th>

                      <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Profit
                      </th>

                      <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        GST
                      </th>

                      <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Stock
                      </th>

                      <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Status
                      </th>

                      <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.map((product) => {
                      const stock = Number(product.stockQty || 0);

                      const threshold = Number(product.lowStockThreshold ?? 5);

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

                          <td className="px-4 py-4 text-sm font-semibold text-slate-700">
                            {product.brand || "—"}
                          </td>

                          <td className="px-4 py-4">
                            <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-semibold text-slate-600">
                              {product.sku || "—"}
                            </span>
                          </td>

                          <td className="px-4 py-4 text-sm text-slate-600">
                            {product.category || "Uncategorized"}
                          </td>

                          <td className="px-4 py-4 text-right text-sm font-semibold text-slate-600">
                            {money(product.rawPrice)}
                          </td>

                          <td className="px-4 py-4 text-center">
                            <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-600">
                              {Number(product.marginPercentage || 0).toFixed(2)}
                              %
                            </span>
                          </td>

                          <td className="px-4 py-4 text-right text-sm font-semibold text-slate-700">
                            {money(product.marginPrice)}
                          </td>

                          <td className="px-4 py-4 text-right text-sm font-bold text-slate-900">
                            {money(product.retailPrice)}
                          </td>

                          <td className="px-4 py-4 text-right">
                            <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600">
                              {Number(product.profitPercentage || 0).toFixed(2)}
                              %
                            </span>
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

                          <td className="px-4 py-4 text-center">
                            <StockBadge stock={stock} threshold={threshold} />
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => openDrawer(product, "view")}
                                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                              >
                                <Eye size={14} />
                                View
                              </button>

                              <button
                                type="button"
                                onClick={() => openDrawer(product, "edit")}
                                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-slate-900 px-3 text-xs font-bold text-white transition hover:bg-slate-800"
                              >
                                <Pencil size={14} />
                                Edit
                              </button>
                            </div>
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

                  const threshold = Number(product.lowStockThreshold ?? 5);

                  return (
                    <div key={product._id} className="p-4">
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

                              <p className="mt-1 text-xs text-slate-500">
                                {product.brand || "No brand"}
                              </p>

                              <p className="mt-1 font-mono text-[11px] text-slate-400">
                                {product.sku || "No SKU"}
                              </p>
                            </div>

                            <div className="shrink-0 text-right">
                              <p className="text-sm font-bold text-slate-900">
                                {money(product.retailPrice)}
                              </p>

                              <p className="mt-1 text-[11px] font-semibold text-emerald-600">
                                {Number(product.profitPercentage || 0).toFixed(
                                  2,
                                )}
                                % profit
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-2">
                            <MobileInfo
                              label="Category"
                              value={product.category || "—"}
                            />

                            <MobileInfo
                              label="Raw Price"
                              value={money(product.rawPrice)}
                            />

                            <MobileInfo
                              label="Retail"
                              value={money(product.retailPrice)}
                            />

                            <MobileInfo
                              label="GST"
                              value={`${product.gstRate}%`}
                            />

                            <MobileInfo
                              label="Margin"
                              value={`${Number(
                                product.marginPercentage || 0,
                              ).toFixed(2)}%`}
                            />

                            <MobileInfo
                              label="Margin Price"
                              value={money(product.marginPrice)}
                            />

                            <MobileInfo
                              label="Stock"
                              value={stock.toLocaleString("en-IN")}
                            />

                            <MobileInfo
                              label="Profit"
                              value={`${Number(
                                product.profitPercentage || 0,
                              ).toFixed(2)}%`}
                            />
                          </div>

                          <div className="mt-3 flex items-center justify-between gap-2">
                            <StockBadge stock={stock} threshold={threshold} />

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => openDrawer(product, "view")}
                                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition hover:bg-blue-50 hover:text-blue-600"
                              >
                                <Eye size={14} />
                                View
                              </button>

                              <button
                                type="button"
                                onClick={() => openDrawer(product, "edit")}
                                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-slate-900 px-3 text-xs font-bold text-white transition hover:bg-slate-800"
                              >
                                <Pencil size={14} />
                                Edit
                              </button>
                            </div>
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

      {/* Product View / Edit Drawer */}

      {drawerOpen && selectedProduct && (
        <div className="fixed inset-0 z-[110]">
          <button
            type="button"
            aria-label="Close drawer"
            onClick={closeDrawer}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
          />

          <aside className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
            <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  {drawerMode === "edit" ? (
                    <Pencil size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </div>

                <div className="min-w-0">
                  <h2 className="truncate text-lg font-bold text-slate-900">
                    {drawerMode === "edit" ? "Edit product" : "Product details"}
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-500">
                    {drawerMode === "edit"
                      ? "Update product information and pricing."
                      : "View product information and inventory details."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeDrawer}
                disabled={updating || deleting}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
              {drawerMode === "view" ? (
                <div className="space-y-5">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                        <Package size={20} />
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-slate-900">
                          {selectedProduct.name}
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                          {selectedProduct.brand || "No brand"}

                          {selectedProduct.sku
                            ? ` • ${selectedProduct.sku}`
                            : ""}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                      Product information
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      <DetailBox
                        label="Category"
                        value={selectedProduct.category || "—"}
                      />

                      <DetailBox
                        label="SKU"
                        value={selectedProduct.sku || "—"}
                      />

                      <DetailBox
                        label="Raw price"
                        value={money(selectedProduct.rawPrice)}
                      />

                      <DetailBox
                        label="Raw GST"
                        value={money(selectedProduct.rawGstAmount)}
                      />

                      <DetailBox
                        label="Raw total"
                        value={money(selectedProduct.rawTotalPrice)}
                      />

                      <DetailBox
                        label="Margin"
                        value={`${Number(
                          selectedProduct.marginPercentage || 0,
                        ).toFixed(2)}%`}
                      />

                      <DetailBox
                        label="Margin price"
                        value={money(selectedProduct.marginPrice)}
                      />

                      <DetailBox
                        label="Margin GST"
                        value={money(selectedProduct.marginGst)}
                      />

                      <DetailBox
                        label="Retail price"
                        value={money(selectedProduct.retailPrice)}
                      />

                      <DetailBox
                        label="GST rate"
                        value={`${selectedProduct.gstRate ?? 0}%`}
                      />

                      <DetailBox
                        label="Stock"
                        value={Number(
                          selectedProduct.stockQty || 0,
                        ).toLocaleString("en-IN")}
                      />

                      <DetailBox
                        label="Low stock threshold"
                        value={Number(
                          selectedProduct.lowStockThreshold ?? 5,
                        ).toLocaleString("en-IN")}
                      />

                      <DetailBox
                        label="Profit"
                        value={`${Number(
                          selectedProduct.profitPercentage || 0,
                        ).toFixed(2)}%`}
                        highlight
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2
                        size={16}
                        className="mt-0.5 shrink-0 text-emerald-600"
                      />

                      <div>
                        <p className="text-xs font-bold text-emerald-800">
                          Current inventory value
                        </p>

                        <p className="mt-1 text-lg font-extrabold text-emerald-700">
                          {money(
                            Number(selectedProduct.retailPrice || 0) *
                              Number(selectedProduct.stockQty || 0),
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <form
                  id="edit-product-form"
                  onSubmit={handleUpdate}
                  className="space-y-5"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="Product name"
                      required
                      value={editForm.name}
                      onChange={(e) => setEdit("name", e.target.value)}
                      className="sm:col-span-2"
                    />

                    <Field
                      label="Brand"
                      value={editForm.brand}
                      onChange={(e) => setEdit("brand", e.target.value)}
                    />

                    <Field
                      label="SKU"
                      value={editForm.sku}
                      onChange={(e) => setEdit("sku", e.target.value)}
                    />

                    <Field
                      label="Category"
                      value={editForm.category}
                      onChange={(e) => setEdit("category", e.target.value)}
                      className="sm:col-span-2"
                    />

                    <Field
                      label="Raw price"
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      value={editForm.rawPrice}
                      onChange={(e) => setEdit("rawPrice", e.target.value)}
                      prefix="₹"
                    />

                    <Field
                      label="Margin percentage"
                      required
                      type="number"
                      min="0"
                      max="1000"
                      step="0.01"
                      value={editForm.marginPercentage}
                      onChange={(e) =>
                        setEdit(
                          "marginPercentage",

                          e.target.value,
                        )
                      }
                      suffix="%"
                    />

                    <Field
                      label="Stock quantity"
                      required
                      type="number"
                      min="0"
                      step="1"
                      value={editForm.stockQty}
                      onChange={(e) => setEdit("stockQty", e.target.value)}
                    />

                    <Field
                      label="GST rate"
                      required
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={editForm.gstRate}
                      onChange={(e) => setEdit("gstRate", e.target.value)}
                      suffix="%"
                    />

                    <Field
                      label="Low stock threshold"
                      type="number"
                      min="0"
                      step="1"
                      value={editForm.lowStockThreshold}
                      onChange={(e) =>
                        setEdit(
                          "lowStockThreshold",

                          e.target.value,
                        )
                      }
                    />
                  </div>

                  {Number.isFinite(Number(editForm.rawPrice)) &&
                    Number(editForm.rawPrice) >= 0 && (
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">
                          Pricing preview
                        </p>

                        {(() => {
                          const preview = calculatePricingPreview(editForm);

                          return (
                            <div className="grid grid-cols-2 gap-2">
                              <MobileInfo
                                label="Raw GST"
                                value={money(preview.rawGstAmount)}
                              />

                              <MobileInfo
                                label="Raw total"
                                value={money(preview.rawTotalPrice)}
                              />

                              <MobileInfo
                                label="Margin Price"
                                value={money(preview.marginPrice)}
                              />

                              <MobileInfo
                                label="Margin GST"
                                value={money(preview.marginGst)}
                              />

                              <div className="col-span-2 rounded-lg bg-emerald-50 px-3 py-2.5">
                                <p className="text-[9px] font-bold uppercase tracking-wide text-emerald-600">
                                  Final retail price
                                </p>

                                <p className="mt-0.5 text-base font-extrabold text-emerald-700">
                                  {money(preview.retailPrice)}
                                </p>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}

                  <div className="flex items-start gap-2 rounded-xl bg-blue-50 p-3.5 text-xs leading-5 text-blue-700">
                    <AlertCircle size={15} className="mt-0.5 shrink-0" />

                    <span>
                      Product pricing is calculated automatically from raw
                      price, GST and margin percentage. Retail price is
                      calculated by the backend.
                    </span>
                  </div>
                </form>
              )}
            </div>

            <div className="shrink-0 border-t border-slate-100 bg-slate-50 px-5 py-4 sm:px-6">
              {drawerMode === "view" ? (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setDrawerMode("edit")}
                    className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 text-sm font-bold text-white transition hover:bg-slate-800"
                  >
                    <Pencil size={16} />
                    Edit product
                  </button>

                  <button
                    type="button"
                    onClick={closeDrawer}
                    className="h-11 flex-1 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 transition hover:bg-slate-100"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setDrawerMode("view")}
                      disabled={updating || deleting}
                      className="h-11 flex-1 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      form="edit-product-form"
                      disabled={updating || deleting}
                      className="flex h-11 flex-[1.5] items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {updating ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          Save changes
                        </>
                      )}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setDeleteOpen(true)}
                    disabled={updating || deleting}
                    className="flex h-10 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 text-xs font-bold text-rose-600 transition hover:bg-rose-100 disabled:opacity-50"
                  >
                    <Trash2 size={15} />
                    Delete product
                  </button>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* Delete Confirmation */}

      {deleteOpen && selectedProduct && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                  <Trash2 size={19} />
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Delete product?
                  </h3>

                  <p className="mt-1.5 text-sm leading-6 text-slate-500">
                    Are you sure you want to delete{" "}
                    <span className="font-bold text-slate-700">
                      {selectedProduct.name}
                    </span>
                    ? This product will be removed from the active catalogue.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4 sm:px-6">
              <button
                type="button"
                onClick={() => setDeleteOpen(false)}
                disabled={deleting}
                className="h-11 flex-1 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-rose-600 text-sm font-bold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {deleting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}

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

            {/* Form */}

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
                    label="Brand"
                    value={f.brand}
                    onChange={(e) => set("brand", e.target.value)}
                    placeholder="e.g. Samsung"
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
                    onChange={(e) => set("category", e.target.value)}
                    placeholder="e.g. Electronics"
                  />

                  <Field
                    label="Raw Price"
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={f.rawPrice}
                    onChange={(e) => set("rawPrice", e.target.value)}
                    placeholder="0.00"
                    prefix="₹"
                  />

                  <Field
                    label="Margin percentage"
                    required
                    type="number"
                    min="0"
                    max="1000"
                    step="0.01"
                    value={f.marginPercentage}
                    onChange={(e) =>
                      set(
                        "marginPercentage",

                        e.target.value,
                      )
                    }
                    placeholder="20"
                    suffix="%"
                  />

                  <Field
                    label="Opening stock"
                    required
                    type="number"
                    min="0"
                    step="1"
                    value={f.stockQty}
                    onChange={(e) => set("stockQty", e.target.value)}
                    placeholder="0"
                  />

                  <Field
                    label="GST rate"
                    required
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={f.gstRate}
                    onChange={(e) => set("gstRate", e.target.value)}
                    placeholder="18"
                    suffix="%"
                  />

                  <Field
                    label="Low stock threshold"
                    type="number"
                    min="0"
                    step="1"
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

                {/* Pricing preview */}

                {Number.isFinite(Number(f.rawPrice)) &&
                  Number(f.rawPrice) >= 0 && (
                    <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                      <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">
                        Pricing preview
                      </p>

                      {(() => {
                        const preview = calculatePricingPreview(f);

                        return (
                          <div className="grid grid-cols-2 gap-2">
                            <MobileInfo
                              label="Raw GST"
                              value={money(preview.rawGstAmount)}
                            />

                            <MobileInfo
                              label="Raw total"
                              value={money(preview.rawTotalPrice)}
                            />

                            <MobileInfo
                              label="Margin Price"
                              value={money(preview.marginPrice)}
                            />

                            <MobileInfo
                              label="Margin GST"
                              value={money(preview.marginGst)}
                            />

                            <div className="col-span-2 rounded-lg bg-emerald-50 px-3 py-2.5">
                              <p className="text-[9px] font-bold uppercase tracking-wide text-emerald-600">
                                Final retail price
                              </p>

                              <p className="mt-0.5 text-base font-extrabold text-emerald-700">
                                {money(preview.retailPrice)}
                              </p>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                {/* Info */}

                <div className="mt-5 flex items-start gap-2 rounded-xl bg-blue-50 p-3.5 text-xs leading-5 text-blue-700">
                  <CheckCircle2 size={15} className="mt-0.5 shrink-0" />

                  <span>
                    The opening stock will be added to this product's available
                    inventory.
                  </span>
                </div>
              </div>

              {/* Modal Footer */}

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
                      <Loader2 size={16} className="animate-spin" />
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

/* -------------------------------------------------------

   Stat Card

\------------------------------------------------------- */

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
          <p className="text-xs font-semibold text-slate-500">{label}</p>

          <p
            className={`mt-2 truncate text-xl font-extrabold tracking-tight sm:text-2xl ${
              warning ? "text-amber-600" : "text-slate-900"
            }`}
          >
            {value}
          </p>

          <p className="mt-1 text-[11px] text-slate-400">{description}</p>
        </div>

        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
            warning ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"
          }`}
        >
          <Icon size={17} />
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------

   Stock Badge

\------------------------------------------------------- */

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

/* -------------------------------------------------------

   Mobile Info

\------------------------------------------------------- */

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

/* -------------------------------------------------------

   Detail Box

\------------------------------------------------------- */

function DetailBox({
  label,

  value,

  highlight = false,
}) {
  return (
    <div
      className={`rounded-xl border px-3.5 py-3 ${
        highlight
          ? "border-emerald-100 bg-emerald-50"
          : "border-slate-200 bg-white"
      }`}
    >
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p
        className={`mt-1 truncate text-sm font-bold ${
          highlight ? "text-emerald-700" : "text-slate-800"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

/* -------------------------------------------------------

   Form Field

\------------------------------------------------------- */

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

        {required && <span className="ml-1 text-rose-500">*</span>}
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

/* -------------------------------------------------------

   Empty Products

\------------------------------------------------------- */

function EmptyProducts({
  hasSearch,

  onAdd,
}) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        {hasSearch ? <Search size={24} /> : <Package size={24} />}
      </div>

      <h3 className="mt-4 text-sm font-bold text-slate-900">
        {hasSearch ? "No products found" : "No products yet"}
      </h3>

      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
        {hasSearch
          ? "Try a different product name, brand, SKU or category."
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

/* -------------------------------------------------------

   Product Skeleton

\------------------------------------------------------- */

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
