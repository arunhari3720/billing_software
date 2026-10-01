import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Trash2,
  Store,
  Receipt,
  Percent,
  Calculator,
  CheckCircle2,
  X,
  ArrowRight,
  Loader2,
  FileText,
} from "lucide-react";

import { storeService } from "../../services/store.service";
import { optionalBillService } from "../../services/optionalBill.service";

const money = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
  })}`;

const emptyItem = () => ({
  name: "",
  price: "",
  qty: 1,
  gstRate: 18,
});

export default function OptionalBillingPage() {
  const [stores, setStores] = useState([]);
  const [storeId, setStoreId] = useState("");
  const [items, setItems] = useState([emptyItem()]);
  const [last, setLast] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [creating, setCreating] = useState(false);
  const [loadingStores, setLoadingStores] = useState(true);

  useEffect(() => {
    const loadStores = async () => {
      try {
        const r = await storeService.list();
        setStores(r.data.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingStores(false);
      }
    };

    loadStores();
  }, []);

  const validItems = useMemo(
    () =>
      items.filter(
        (item) =>
          item.name.trim() &&
          Number(item.price) > 0 &&
          Number(item.qty) > 0,
      ),
    [items],
  );

  const subtotal = useMemo(
    () =>
      validItems.reduce(
        (sum, item) =>
          sum + Number(item.price || 0) * Number(item.qty || 0),
        0,
      ),
    [validItems],
  );

  const gst = useMemo(
    () =>
      validItems.reduce(
        (sum, item) =>
          sum +
          (Number(item.price || 0) *
            Number(item.qty || 0) *
            Number(item.gstRate || 0)) /
            100,
        0,
      ),
    [validItems],
  );

  const total = subtotal + gst;

  const change = (index, key, value) => {
    setItems((current) =>
      current.map((item, i) =>
        i === index ? { ...item, [key]: value } : item,
      ),
    );

    setLast(null);
  };

  const addItem = () => {
    setItems((current) => [...current, emptyItem()]);
    setLast(null);
  };

  const removeItem = (index) => {
    setItems((current) => {
      if (current.length === 1) return [emptyItem()];
      return current.filter((_, i) => i !== index);
    });

    setLast(null);
  };

  const openCheckout = () => {
    if (!storeId) {
      alert("Please select a store");
      return;
    }

    if (!validItems.length) {
      alert("Please add at least one valid item");
      return;
    }

    setShowCheckout(true);
  };

  const closeCheckout = () => {
    if (creating) return;
    setShowCheckout(false);
  };

  const createBill = async () => {
    try {
      setCreating(true);

      const r = await optionalBillService.create({
        storeId,
        items: validItems.map((item) => ({
          name: item.name.trim(),
          price: Number(item.price),
          qty: Number(item.qty),
          gstRate: Number(item.gstRate || 0),
        })),
      });

      setLast(r.data.data);
      setShowCheckout(false);
      setItems([emptyItem()]);
    } catch (e) {
      alert(e.response?.data?.message || "Failed to create optional bill");
    } finally {
      setCreating(false);
    }
  };

  const selectedStore = stores.find((store) => store._id === storeId);

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">

        {/* Header */}
        <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              <Receipt size={14} />
              Manual billing
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Optional Billing
            </h1>

            <p className="mt-1.5 max-w-2xl text-sm text-slate-500">
              Create manual invoices without affecting your inventory stock.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs font-semibold text-amber-700">
            <FileText size={15} />
            Stock unaffected
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">

          {/* Left */}
          <div className="space-y-5">

            {/* Store Card */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Store size={19} />
                  </div>

                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      Billing store
                    </h2>
                    <p className="text-xs text-slate-500">
                      Select where this manual bill belongs
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <label className="mb-2 block text-xs font-semibold text-slate-700">
                  Store
                </label>

                <div className="relative max-w-xl">
                  <Store
                    size={17}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <select
                    value={storeId}
                    onChange={(e) => {
                      setStoreId(e.target.value);
                      setLast(null);
                    }}
                    disabled={loadingStores}
                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50"
                  >
                    <option value="">
                      {loadingStores ? "Loading stores..." : "Select store"}
                    </option>

                    {stores.map((store) => (
                      <option key={store._id} value={store._id}>
                        {store.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* Items */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                    <Receipt size={19} />
                  </div>

                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      Invoice items
                    </h2>
                    <p className="text-xs text-slate-500">
                      Add products or services manually
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={addItem}
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                >
                  <Plus size={15} />
                  Add item
                </button>
              </div>

              <div className="p-5 sm:p-6">
                <div className="hidden grid-cols-[minmax(180px,2fr)_1fr_100px_100px_90px_40px] gap-3 px-1 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 lg:grid">
                  <span>Item</span>
                  <span>Price</span>
                  <span>Qty</span>
                  <span>GST</span>
                  <span>Amount</span>
                  <span />
                </div>

                <div className="space-y-3">
                  {items.map((item, index) => {
                    const amount =
                      Number(item.price || 0) * Number(item.qty || 0);

                    return (
                      <div
                        key={index}
                        className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 transition hover:border-slate-300"
                      >
                        <div className="grid gap-3 lg:grid-cols-[minmax(180px,2fr)_1fr_100px_100px_90px_40px] lg:items-end">

                          {/* Item */}
                          <div>
                            <label className="mb-1.5 block text-[11px] font-semibold text-slate-500 lg:hidden">
                              Item
                            </label>

                            <input
                              value={item.name}
                              onChange={(e) =>
                                change(index, "name", e.target.value)
                              }
                              placeholder="Item or service name"
                              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                            />
                          </div>

                          {/* Price */}
                          <div>
                            <label className="mb-1.5 block text-[11px] font-semibold text-slate-500 lg:hidden">
                              Price
                            </label>

                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                                ₹
                              </span>

                              <input
                                type="number"
                                min="0"
                                value={item.price}
                                onChange={(e) =>
                                  change(index, "price", e.target.value)
                                }
                                placeholder="0.00"
                                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-7 pr-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                              />
                            </div>
                          </div>

                          {/* Qty */}
                          <div>
                            <label className="mb-1.5 block text-[11px] font-semibold text-slate-500 lg:hidden">
                              Quantity
                            </label>

                            <input
                              type="number"
                              min="1"
                              value={item.qty}
                              onChange={(e) =>
                                change(index, "qty", e.target.value)
                              }
                              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                            />
                          </div>

                          {/* GST */}
                          <div>
                            <label className="mb-1.5 block text-[11px] font-semibold text-slate-500 lg:hidden">
                              GST %
                            </label>

                            <div className="relative">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={item.gstRate}
                                onChange={(e) =>
                                  change(index, "gstRate", e.target.value)
                                }
                                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 pr-7 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                              />

                              <Percent
                                size={13}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                              />
                            </div>
                          </div>

                          {/* Amount */}
                          <div>
                            <label className="mb-1.5 block text-[11px] font-semibold text-slate-500 lg:hidden">
                              Amount
                            </label>

                            <div className="flex h-10 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-900">
                              {money(amount)}
                            </div>
                          </div>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="flex h-10 w-full items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 lg:w-10"
                            title="Remove item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={addItem}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 py-3 text-xs font-bold text-slate-500 transition hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-600"
                >
                  <Plus size={15} />
                  Add another item
                </button>
              </div>
            </section>
          </div>

          {/* Right Summary */}
          <aside className="h-fit xl:sticky xl:top-6">
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="bg-slate-900 px-5 py-5 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-300">
                      Invoice summary
                    </p>
                    <h2 className="mt-1 text-lg font-bold">
                      {selectedStore?.name || "New optional bill"}
                    </h2>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                    <Calculator size={19} />
                  </div>
                </div>
              </div>

              <div className="p-5">
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      Subtotal
                    </span>
                    <span className="font-semibold text-slate-900">
                      {money(subtotal)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Percent size={13} />
                      GST
                    </span>
                    <span className="font-semibold text-slate-900">
                      {money(gst)}
                    </span>
                  </div>

                  <div className="my-4 border-t border-dashed border-slate-200" />

                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-400">
                        Total payable
                      </p>
                      <p className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
                        {money(total)}
                      </p>
                    </div>

                    <div className="rounded-lg bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-600">
                      Manual
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={openCheckout}
                  disabled={!storeId || !validItems.length}
                  className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
                >
                  Create optional bill
                  <ArrowRight size={17} />
                </button>

                <div className="mt-4 flex items-start gap-2 rounded-xl bg-emerald-50 p-3 text-xs leading-5 text-emerald-700">
                  <CheckCircle2
                    size={15}
                    className="mt-0.5 shrink-0"
                  />
                  <span>
                    This invoice is manual and will not reduce or modify
                    your product stock.
                  </span>
                </div>

                {last && (
                  <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5">
                    <div className="flex items-start gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                        <CheckCircle2 size={16} />
                      </div>

                      <div>
                        <p className="text-sm font-bold text-emerald-800">
                          Bill created successfully
                        </p>

                        <p className="mt-0.5 text-xs text-emerald-700">
                          {last.billNo}
                        </p>

                        <p className="mt-1 text-xs text-emerald-600">
                          Stock was not changed.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Review optional bill
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Confirm the invoice before creating it.
                </p>
              </div>

              <button
                type="button"
                onClick={closeCheckout}
                disabled={creating}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-5">

              {/* Store */}
              <div className="mb-5 rounded-xl bg-slate-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Store
                </p>

                <p className="mt-1 text-sm font-bold text-slate-900">
                  {selectedStore?.name || "—"}
                </p>
              </div>

              {/* Items */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Items
                  </p>

                  <span className="text-xs font-semibold text-slate-500">
                    {validItems.length} item
                    {validItems.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="space-y-2">
                  {validItems.map((item, index) => {
                    const amount =
                      Number(item.price || 0) * Number(item.qty || 0);

                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-xl border border-slate-100 px-3.5 py-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {item.name}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-400">
                            {item.qty} × {money(item.price)} · GST{" "}
                            {item.gstRate}%
                          </p>
                        </div>

                        <p className="ml-4 shrink-0 text-sm font-bold text-slate-900">
                          {money(amount)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Totals */}
              <div className="mt-5 rounded-xl bg-slate-900 p-4 text-white">
                <div className="space-y-2.5">
                  <div className="flex justify-between text-sm text-slate-300">
                    <span>Subtotal</span>
                    <span>{money(subtotal)}</span>
                  </div>

                  <div className="flex justify-between text-sm text-slate-300">
                    <span>GST</span>
                    <span>{money(gst)}</span>
                  </div>

                  <div className="my-3 border-t border-white/10" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">
                      Total
                    </span>

                    <span className="text-xl font-extrabold">
                      {money(total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4">
              <button
                type="button"
                onClick={closeCheckout}
                disabled={creating}
                className="h-11 flex-1 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={createBill}
                disabled={creating}
                className="flex h-11 flex-[1.5] items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {creating ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Confirm & create
                    <CheckCircle2 size={17} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}