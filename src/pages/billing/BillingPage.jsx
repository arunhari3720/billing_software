import { useEffect, useMemo, useState } from "react";
import { productService } from "../../services/product.service";
import { storeService } from "../../services/store.service";
import { billService } from "../../services/bill.service";

import {
  Search,
  Store,
  Receipt,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  Package,
  Percent,
  CheckCircle2,
  Printer,
  ArrowRight,
  Sparkles,
  X,
  UserRound,
  Phone,
  CreditCard,
  Banknote,
  Smartphone,
  WalletCards,
  Loader2,
} from "lucide-react";

const money = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
  })}`;

export default function BillingPage() {
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);

  const [storeId, setStoreId] = useState("");
  const [cart, setCart] = useState([]);

  const [last, setLast] = useState(null);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // Confirmation / customer popup
  const [showCheckout, setShowCheckout] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");

  useEffect(() => {
    const load = async () => {
      try {
        const [storeResponse, productResponse] = await Promise.all([
          storeService.list(),
          productService.list(),
        ]);

        setStores(storeResponse.data.data || []);
        setProducts(productResponse.data.data || []);
      } catch (error) {
        console.error("Billing data load failed:", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const add = (product) => {
    if (Number(product.stockQty || 0) <= 0) return;

    setCart((current) => {
      const existing = current.find(
        (item) => item.productId === product._id,
      );

      if (existing) {
        if (existing.qty >= Number(product.stockQty || 0)) {
          return current;
        }

        return current.map((item) =>
          item.productId === product._id
            ? { ...item, qty: item.qty + 1 }
            : item,
        );
      }

      return [
        ...current,
        {
          productId: product._id,
          name: product.name,
          price: Number(product.price || 0),
          gstRate: Number(product.gstRate || 0),
          qty: 1,
          stock: Number(product.stockQty || 0),
        },
      ];
    });
  };

  const increase = (productId) => {
    setCart((current) =>
      current.map((item) =>
        item.productId === productId
          ? {
              ...item,
              qty: Math.min(item.qty + 1, item.stock),
            }
          : item,
      ),
    );
  };

  const decrease = (productId) => {
    setCart((current) =>
      current
        .map((item) =>
          item.productId === productId
            ? { ...item, qty: item.qty - 1 }
            : item,
        )
        .filter((item) => item.qty > 0),
    );
  };

  const remove = (productId) => {
    setCart((current) =>
      current.filter((item) => item.productId !== productId),
    );
  };

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + item.price * item.qty,
        0,
      ),
    [cart],
  );

  const gst = useMemo(
    () =>
      cart.reduce(
        (sum, item) =>
          sum +
          (item.price * item.qty * item.gstRate) / 100,
        0,
      ),
    [cart],
  );

  const total = subtotal + gst;

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return products;

    return products.filter((product) =>
      product.name?.toLowerCase().includes(query),
    );
  }, [products, search]);

  const openCheckout = () => {
    if (!storeId) {
      alert("Please select a store.");
      return;
    }

    if (!cart.length) {
      alert("Please add at least one product.");
      return;
    }

    setShowCheckout(true);
  };

  const closeCheckout = () => {
    if (creating) return;
    setShowCheckout(false);
  };

  const createBill = async () => {
    if (!storeId || !cart.length || creating) return;

    setCreating(true);

    try {
      const response = await billService.create({
        storeId,

        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),

        paymentMethod,

        items: cart.map((item) => ({
          productId: item.productId,
          qty: item.qty,
        })),
      });

      setLast(response.data.data);

      setCart([]);

      setCustomerName("");
      setCustomerPhone("");
      setPaymentMethod("CASH");

      setShowCheckout(false);
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Bill creation failed. Please try again.",
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="w-full">

      {/* PAGE HEADER */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
            <Receipt size={13} />
            Sales
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <span className="text-cyan-600">Billing</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[28px]">
            Create invoice
          </h1>

          <p className="mt-1.5 text-sm text-slate-500">
            Select products, review the invoice and complete the sale.
          </p>
        </div>

        <div className="flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600">
            <ShoppingCart size={14} />
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Current order
            </p>

            <p className="text-sm font-bold text-slate-800">
              {cart.length}{" "}
              {cart.length === 1 ? "item" : "items"}
            </p>
          </div>
        </div>
      </div>

      {/* SUCCESS */}
      {last && (
        <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
              <CheckCircle2 size={20} />
            </div>

            <div>
              <p className="text-sm font-bold text-emerald-900">
                Bill created successfully
              </p>

              <p className="mt-0.5 text-xs text-emerald-700">
                {last.billNo} · {money(last.grandTotal)}
              </p>
            </div>
          </div>

          <PrintButton bill={last} />
        </div>
      )}

      {/* STORE */}
      <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.04)] sm:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
              <Store size={18} />
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Billing store
              </h2>

              <p className="mt-0.5 text-xs text-slate-400">
                Choose where this sale is being recorded.
              </p>
            </div>
          </div>

          <div className="w-full md:max-w-sm">
            <select
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm font-medium text-slate-700 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-50"
            >
              <option value="">Select a store</option>

              {stores.map((store) => (
                <option key={store._id} value={store._id}>
                  {store.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* MAIN */}
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">

        {/* PRODUCTS */}
        <section className="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)]">

          <div className="border-b border-slate-100 p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Products
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Select a product to add it to the invoice.
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products..."
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-50"
                />
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5">
            {loading ? (
              <ProductSkeleton />
            ) : filteredProducts.length === 0 ? (
              <EmptyProducts search={search} />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((product) => {
                  const outOfStock =
                    Number(product.stockQty || 0) <= 0;

                  const cartItem = cart.find(
                    (item) => item.productId === product._id,
                  );

                  return (
                    <button
                      key={product._id}
                      type="button"
                      disabled={outOfStock}
                      onClick={() => add(product)}
                      className={`
                        group relative overflow-hidden rounded-xl border p-4 text-left transition-all duration-200

                        ${
                          outOfStock
                            ? "cursor-not-allowed border-slate-200 bg-slate-50 opacity-60"
                            : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-[0_8px_24px_rgba(15,23,42,0.07)]"
                        }
                      `}
                    >
                      {cartItem && (
                        <span className="absolute right-3 top-3 flex h-6 min-w-6 items-center justify-center rounded-full bg-cyan-500 px-1.5 text-[10px] font-bold text-white">
                          {cartItem.qty}
                        </span>
                      )}

                      <div className="mb-4 flex items-start justify-between">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 text-slate-500 transition group-hover:bg-cyan-50 group-hover:text-cyan-600">
                          <Package size={16} />
                        </div>

                        <span
                          className={`
                            rounded-full px-2 py-1 text-[10px] font-semibold
                            ${
                              outOfStock
                                ? "bg-red-50 text-red-500"
                                : "bg-emerald-50 text-emerald-600"
                            }
                          `}
                        >
                          {outOfStock
                            ? "Out of stock"
                            : `${product.stockQty} in stock`}
                        </span>
                      </div>

                      <p className="truncate pr-6 text-sm font-bold text-slate-800">
                        {product.name}
                      </p>

                      <div className="mt-3 flex items-end justify-between gap-2">
                        <div>
                          <p className="text-lg font-bold tracking-tight text-slate-900">
                            {money(product.price)}
                          </p>

                          <div className="mt-1 flex items-center gap-1 text-[10px] font-medium text-slate-400">
                            <Percent size={11} />
                            GST {product.gstRate}%
                          </div>
                        </div>

                        {!outOfStock && (
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white transition group-hover:bg-cyan-500">
                            <Plus size={15} />
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* INVOICE */}
        <aside className="xl:sticky xl:top-6">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_18px_rgba(15,23,42,0.06)]">

            <div className="border-b border-slate-100 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles
                      size={15}
                      className="text-cyan-500"
                    />

                    <h2 className="text-sm font-bold text-slate-900">
                      Current invoice
                    </h2>
                  </div>

                  <p className="mt-1 text-xs text-slate-400">
                    Review before creating the bill.
                  </p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
                  <Receipt size={16} />
                </div>
              </div>
            </div>

            {cart.length === 0 ? (
              <div className="px-5 py-12">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-300">
                  <ShoppingCart size={21} />
                </div>

                <div className="mt-4 text-center">
                  <p className="text-sm font-semibold text-slate-700">
                    Your invoice is empty
                  </p>

                  <p className="mx-auto mt-1 max-w-[220px] text-xs leading-5 text-slate-400">
                    Select products from the catalog to start building your invoice.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="max-h-[390px] overflow-y-auto px-5">
                  <div className="divide-y divide-slate-100">
                    {cart.map((item) => (
                      <div
                        key={item.productId}
                        className="py-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-800">
                              {item.name}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {money(item.price)} · GST {item.gstRate}%
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => remove(item.productId)}
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-300 transition hover:bg-red-50 hover:text-red-500"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50">
                            <button
                              type="button"
                              onClick={() =>
                                decrease(item.productId)
                              }
                              className="flex h-8 w-8 items-center justify-center text-slate-500 transition hover:text-slate-900"
                            >
                              <Minus size={13} />
                            </button>

                            <span className="flex h-8 min-w-8 items-center justify-center border-x border-slate-200 px-2 text-xs font-bold text-slate-700">
                              {item.qty}
                            </span>

                            <button
                              type="button"
                              disabled={item.qty >= item.stock}
                              onClick={() =>
                                increase(item.productId)
                              }
                              className="flex h-8 w-8 items-center justify-center text-slate-500 transition hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              <Plus size={13} />
                            </button>
                          </div>

                          <span className="text-sm font-bold text-slate-900">
                            {money(item.price * item.qty)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-100 bg-slate-50/50 p-5">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Subtotal</span>

                      <span className="font-semibold text-slate-700">
                        {money(subtotal)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-500">
                      <span>GST</span>

                      <span className="font-semibold text-slate-700">
                        {money(gst)}
                      </span>
                    </div>

                    <div className="border-t border-slate-200 pt-3">
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-xs font-medium text-slate-400">
                            Grand total
                          </p>

                          <p className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900">
                            {money(total)}
                          </p>
                        </div>

                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
                          TAX INCLUDED
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={!storeId || !cart.length}
                    onClick={openCheckout}
                    className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Create bill
                    <ArrowRight size={15} />
                  </button>

                  {!storeId && (
                    <p className="mt-2 text-center text-[10px] font-medium text-amber-600">
                      Select a store before creating the bill.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </aside>
      </div>

      {/* CHECKOUT MODAL */}
      {showCheckout && (
        <CheckoutModal
          customerName={customerName}
          setCustomerName={setCustomerName}
          customerPhone={customerPhone}
          setCustomerPhone={setCustomerPhone}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          subtotal={subtotal}
          gst={gst}
          total={total}
          creating={creating}
          onClose={closeCheckout}
          onCreate={createBill}
        />
      )}
    </div>
  );
}

/* =========================================================
   CHECKOUT MODAL
========================================================= */

function CheckoutModal({
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  paymentMethod,
  setPaymentMethod,
  subtotal,
  gst,
  total,
  creating,
  onClose,
  onCreate,
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">

      <div
        className="absolute inset-0"
        onClick={onClose}
      />

      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.2)]">

        {/* Modal header */}
        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
              <Receipt size={18} />
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900">
                Complete bill
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Add customer details and confirm payment.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={creating}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40"
          >
            <X size={18} />
          </button>
        </div>

        {/* Customer details */}
        <div className="space-y-4 p-5 sm:p-6">

          <div>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Customer details
            </p>

            <div className="grid gap-3 sm:grid-cols-2">

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Customer name
                </label>

                <div className="relative">
                  <UserRound
                    size={15}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={customerName}
                    onChange={(e) =>
                      setCustomerName(e.target.value)
                    }
                    placeholder="Optional"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-50"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Phone number
                </label>

                <div className="relative">
                  <Phone
                    size={15}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={customerPhone}
                    onChange={(e) =>
                      setCustomerPhone(e.target.value)
                    }
                    placeholder="Optional"
                    inputMode="tel"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-50"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Payment */}
          <div>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Payment method
            </p>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <PaymentOption
                value="CASH"
                label="Cash"
                icon={<Banknote size={16} />}
                active={paymentMethod === "CASH"}
                onClick={() => setPaymentMethod("CASH")}
              />

              <PaymentOption
                value="UPI"
                label="UPI"
                icon={<Smartphone size={16} />}
                active={paymentMethod === "UPI"}
                onClick={() => setPaymentMethod("UPI")}
              />

              <PaymentOption
                value="CARD"
                label="Card"
                icon={<CreditCard size={16} />}
                active={paymentMethod === "CARD"}
                onClick={() => setPaymentMethod("CARD")}
              />

              <PaymentOption
                value="CREDIT"
                label="Credit"
                icon={<WalletCards size={16} />}
                active={paymentMethod === "CREDIT"}
                onClick={() => setPaymentMethod("CREDIT")}
              />
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-700">
                  {money(subtotal)}
                </span>
              </div>

              <div className="flex justify-between text-slate-500">
                <span>GST</span>
                <span className="font-semibold text-slate-700">
                  {money(gst)}
                </span>
              </div>

              <div className="mt-2 flex items-end justify-between border-t border-slate-200 pt-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Payable amount
                  </p>

                  <p className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900">
                    {money(total)}
                  </p>
                </div>

                <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-[10px] font-bold text-cyan-700">
                  {paymentMethod}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={creating}
              className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onCreate}
              disabled={creating}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {creating ? (
                <>
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  Confirm & create bill
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

function PaymentOption({
  value,
  label,
  icon,
  active,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex flex-col items-center justify-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-semibold transition

        ${
          active
            ? "border-cyan-400 bg-cyan-50 text-cyan-700 ring-2 ring-cyan-100"
            : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50"
        }
      `}
    >
      {icon}
      {label}
    </button>
  );
}

function PrintButton({ bill }) {
  const printInvoice = () => {
    const windowRef = window.open(
      "",
      "_blank",
      "width=420,height=700",
    );

    if (!windowRef) return;

    windowRef.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${bill.billNo || "Invoice"}</title>

          <style>
            @page {
              size: 80mm auto;
              margin: 3mm;
            }

            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              padding: 10px;
              font-family: Arial, sans-serif;
              font-size: 11px;
              color: #111827;
            }

            h2 {
              margin: 0 0 6px;
              text-align: center;
              font-size: 18px;
            }

            .muted {
              color: #6b7280;
            }

            .center {
              text-align: center;
            }

            .row {
              display: flex;
              justify-content: space-between;
              gap: 12px;
              margin: 6px 0;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 12px;
            }

            td {
              padding: 5px 0;
              vertical-align: top;
            }

            td:last-child {
              text-align: right;
            }

            hr {
              border: 0;
              border-top: 1px dashed #d1d5db;
              margin: 10px 0;
            }

            .total {
              font-size: 14px;
              font-weight: bold;
            }
          </style>
        </head>

        <body>
          <h2>TAX INVOICE</h2>

          <div class="center muted">
            ${bill.billNo || ""}
          </div>

          ${
            bill.customerName
              ? `<div class="center" style="margin-top:8px">
                  ${bill.customerName}
                </div>`
              : ""
          }

          ${
            bill.customerPhone
              ? `<div class="center muted">
                  ${bill.customerPhone}
                </div>`
              : ""
          }

          <table>
            ${(bill.items || [])
              .map(
                (item) => `
                  <tr>
                    <td>
                      ${item.name || "Item"} × ${item.qty}
                    </td>

                    <td>
                      ₹${Number(item.total || 0).toFixed(2)}
                    </td>
                  </tr>
                `,
              )
              .join("")}
          </table>

          <hr />

          <div class="row">
            <span>Subtotal</span>
            <span>
              ₹${Number(bill.subtotal || 0).toFixed(2)}
            </span>
          </div>

          <div class="row">
            <span>GST</span>
            <span>
              ₹${Number(bill.gstTotal || 0).toFixed(2)}
            </span>
          </div>

          <div class="row">
            <span>Payment</span>
            <span>
              ${bill.paymentMethod || "CASH"}
            </span>
          </div>

          <hr />

          <div class="row total">
            <span>Total</span>
            <span>
              ₹${Number(bill.grandTotal || 0).toFixed(2)}
            </span>
          </div>

          <script>
            window.onload = function () {
              window.print();
            };
          </script>
        </body>
      </html>
    `);

    windowRef.document.close();
  };

  return (
    <button
      type="button"
      onClick={printInvoice}
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50"
    >
      <Printer size={15} />
      Print invoice
    </button>
  );
}

function ProductSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <div
          key={item}
          className="h-[170px] animate-pulse rounded-xl border border-slate-200 bg-slate-50"
        />
      ))}
    </div>
  );
}

function EmptyProducts({ search }) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-300">
        <Package size={22} />
      </div>

      <h3 className="mt-4 text-sm font-bold text-slate-700">
        {search ? "No products found" : "No products available"}
      </h3>

      <p className="mt-1 max-w-xs text-xs leading-5 text-slate-400">
        {search
          ? `Nothing matched "${search}". Try another product name.`
          : "Add products to your inventory before creating a bill."}
      </p>
    </div>
  );
}