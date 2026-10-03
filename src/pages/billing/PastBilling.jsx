import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Eye,
  FileDown,
  Loader2,
  RefreshCw,
  Search,
  X,
  Receipt,
  UserRound,
  Phone,
  Store,
  CreditCard,
} from "lucide-react";
import { billService } from "../../services/bill.service";
import { createBillPdf } from "../../utils/billPdf";

const money = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
  })}`;

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function PastBilling() {
  const [bills, setBills] = useState([]);
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState("");

  const loadBills = async (silent = false) => {
    try {
      silent ? setRefreshing(true) : setLoading(true);
      const response = await billService.list();
      setBills(response.data?.data || []);
    } catch (error) {
      console.error("Past billing load failed:", error);
      alert(
        error.response?.data?.message ||
          "Past billing could not be loaded. Please try again."
      );
    } finally {
      silent ? setRefreshing(false) : setLoading(false);
    }
  };

  useEffect(() => {
    loadBills();
  }, []);

  const filteredBills = useMemo(() => {
    const query = search.trim().toLowerCase();
    const now = new Date();

    return bills.filter((bill) => {
      const billDate = new Date(bill.createdAt);
      if (Number.isNaN(billDate.getTime())) return false;

      if (period === "TODAY") {
        if (
          billDate.getFullYear() !== now.getFullYear() ||
          billDate.getMonth() !== now.getMonth() ||
          billDate.getDate() !== now.getDate()
        ) {
          return false;
        }
      }

      if (period === "MONTH") {
        if (
          billDate.getFullYear() !== now.getFullYear() ||
          billDate.getMonth() !== now.getMonth()
        ) {
          return false;
        }
      }

      if (period === "YEAR" && billDate.getFullYear() !== now.getFullYear()) {
        return false;
      }

      if (!query) return true;

      return [
        bill.billNo,
        bill.customerName,
        bill.customerPhone,
        bill.paymentMethod,
        bill.store?.name,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [bills, search, period]);

  const totals = useMemo(
    () => ({
      count: filteredBills.length,
      amount: filteredBills.reduce(
        (sum, bill) => sum + Number(bill.grandTotal || 0),
        0
      ),
    }),
    [filteredBills]
  );

  const openBill = async (bill) => {
    setSelectedBill(null);
    setViewLoading(true);

    try {
      const response = await billService.get(bill._id);
      setSelectedBill(response.data?.data || bill);
    } catch (error) {
      console.error("Bill details load failed:", error);
      alert(
        error.response?.data?.message ||
          "Bill details could not be loaded."
      );
    } finally {
      setViewLoading(false);
    }
  };

  const downloadPdf = async (bill) => {
    setPdfLoading(bill._id);

    try {
      let fullBill = bill;

      if (!bill.items?.length) {
        const response = await billService.get(bill._id);
        fullBill = response.data?.data || bill;
      }

      createBillPdf(fullBill);
    } catch (error) {
      console.error("Bill PDF failed:", error);
      alert("Could not create the bill PDF. Please try again.");
    } finally {
      setPdfLoading("");
    }
  };

  return (
    <section className="w-full">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
            <Receipt size={13} />
            Sales
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <span className="text-cyan-600">Past Billing</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[28px]">
            Billing history
          </h1>

          <p className="mt-1.5 text-sm text-slate-500">
            View previous invoices and create a PDF copy whenever you need it.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadBills(true)}
          disabled={refreshing}
          className="inline-flex h-10 w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.04)]">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
            Bills
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {totals.count}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.04)]">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
            Total billed
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {money(totals.amount)}
          </p>
        </div>
      </div>

      <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search bill no, customer, phone..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-50"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto">
            {[
              ["ALL", "All"],
              ["TODAY", "Today"],
              ["MONTH", "This month"],
              ["YEAR", "This year"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setPeriod(value)}
                className={`h-10 shrink-0 rounded-xl px-3.5 text-xs font-semibold transition ${
                  period === value
                    ? "bg-cyan-500 text-white"
                    : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)]">
        {loading ? (
          <div className="flex min-h-[320px] items-center justify-center">
            <Loader2 className="animate-spin text-cyan-500" size={24} />
          </div>
        ) : filteredBills.length === 0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center px-5 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-300">
              <Receipt size={22} />
            </div>
            <h3 className="mt-4 text-sm font-bold text-slate-700">
              No billing records found
            </h3>
            <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
              Create your first invoice or change the search/filter above.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[850px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                    {["Bill", "Date", "Customer", "Payment", "Total", "Actions"].map(
                      (heading) => (
                        <th
                          key={heading}
                          className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400"
                        >
                          {heading}
                        </th>
                      )
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredBills.map((bill) => (
                    <tr key={bill._id} className="transition hover:bg-slate-50/60">
                      <td className="px-5 py-4">
                        <p className="text-sm font-bold text-slate-800">
                          {bill.billNo}
                        </p>
                        <p className="mt-0.5 text-[10px] text-slate-400">
                          {bill.items?.length || 0} item(s)
                        </p>
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-500">
                        {formatDate(bill.createdAt)}
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-slate-700">
                          {bill.customerName || "Walk-in customer"}
                        </p>
                        {bill.customerPhone && (
                          <p className="mt-0.5 text-[10px] text-slate-400">
                            {bill.customerPhone}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                          {bill.paymentMethod || "CASH"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm font-bold text-slate-900">
                        {money(bill.grandTotal)}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openBill(bill)}
                            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
                          >
                            <Eye size={14} />
                            View
                          </button>

                          <button
                            type="button"
                            onClick={() => downloadPdf(bill)}
                            disabled={pdfLoading === bill._id}
                            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-slate-900 px-3 text-xs font-semibold text-white transition hover:bg-cyan-600 disabled:opacity-50"
                          >
                            {pdfLoading === bill._id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <FileDown size={14} />
                            )}
                            PDF
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-slate-100 md:hidden">
              {filteredBills.map((bill) => (
                <div key={bill._id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        {bill.billNo}
                      </p>
                      <p className="mt-1 text-[10px] text-slate-400">
                        {formatDate(bill.createdAt)}
                      </p>
                    </div>

                    <p className="text-sm font-bold text-slate-900">
                      {money(bill.grandTotal)}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-700">
                        {bill.customerName || "Walk-in customer"}
                      </p>
                      <p className="mt-1 text-[10px] text-slate-400">
                        {bill.paymentMethod || "CASH"} · {bill.items?.length || 0} item(s)
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openBill(bill)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-cyan-50 hover:text-cyan-600"
                      >
                        <Eye size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() => downloadPdf(bill)}
                        disabled={pdfLoading === bill._id}
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white hover:bg-cyan-600 disabled:opacity-50"
                      >
                        {pdfLoading === bill._id ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <FileDown size={15} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {viewLoading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="rounded-2xl bg-white px-6 py-5 shadow-xl">
            <Loader2 className="animate-spin text-cyan-500" size={24} />
          </div>
        </div>
      )}

      {selectedBill && (
        <BillDrawer
          bill={selectedBill}
          onClose={() => setSelectedBill(null)}
          onPdf={() => downloadPdf(selectedBill)}
          pdfLoading={pdfLoading === selectedBill._id}
        />
      )}
    </section>
  );
}

function BillDrawer({ bill, onClose, onPdf, pdfLoading }) {
  return (
    <div className="fixed inset-0 z-[110]">
      <div
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <aside className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col bg-white shadow-[-20px_0_60px_rgba(15,23,42,0.16)]">
        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-cyan-600">
              Invoice details
            </p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">
              {bill.billNo}
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              {formatDate(bill.createdAt)}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoCard
              icon={<UserRound size={15} />}
              label="Customer"
              value={bill.customerName || "Walk-in customer"}
            />
            <InfoCard
              icon={<Phone size={15} />}
              label="Phone"
              value={bill.customerPhone || "Not provided"}
            />
            <InfoCard
              icon={<Store size={15} />}
              label="Store"
              value={bill.store?.name || "Store"}
            />
            <InfoCard
              icon={<CreditCard size={15} />}
              label="Payment"
              value={bill.paymentMethod || "CASH"}
            />
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200">
            <div className="border-b border-slate-100 bg-slate-50/70 px-4 py-3">
              <p className="text-xs font-bold text-slate-700">Items</p>
            </div>

            <div className="divide-y divide-slate-100">
              {(bill.items || []).map((item, index) => (
                <div
                  key={`${item.product || item.name}-${index}`}
                  className="p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {item.name || "Item"}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {item.qty} × {money(item.price)} · GST {item.gstRate}%
                      </p>
                      {Number(item.discountPercent || 0) > 0 && (
                        <p className="mt-1 text-[10px] font-semibold text-amber-600">
                          Raw cost discount: {Number(item.discountPercent).toFixed(2)}%
                          {item.discountAmount != null
                            ? ` · ${money(item.discountAmount)} per unit`
                            : ""}
                        </p>
                      )}
                    </div>
                    <p className="text-sm font-bold text-slate-900">
                      {money(item.total)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-700">
                  {money(bill.subtotal)}
                </span>
              </div>

              <div className="flex justify-between text-slate-500">
                <span>GST</span>
                <span className="font-semibold text-slate-700">
                  {money(bill.gstTotal)}
                </span>
              </div>

              <div className="flex justify-between border-t border-slate-200 pt-3 text-base">
                <span className="font-bold text-slate-800">Grand total</span>
                <span className="font-bold text-slate-900">
                  {money(bill.grandTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 bg-white p-4 sm:p-5">
          <button
            type="button"
            onClick={onPdf}
            disabled={pdfLoading}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-cyan-600 disabled:opacity-50"
          >
            {pdfLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <FileDown size={16} />
            )}
            Create PDF
          </button>
        </div>
      </aside>
    </div>
  );
}

function InfoCard({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">
        {icon}
        {label}
      </div>
      <p className="mt-1.5 truncate text-sm font-semibold text-slate-700">
        {value}
      </p>
    </div>
  );
}
