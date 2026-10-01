import { useMemo, useState } from "react";
import {
  Store,
  Plus,
  Search,
  MapPin,
  Phone,
  Hash,
  X,
  CheckCircle2,
  Loader2,
  Building2,
} from "lucide-react";

import { storeService } from "../../services/store.service";
import { useApi } from "../../hooks/useApi";

export default function StoresPage() {
  const {
    data: apiData,
    loading,
    reload,
  } = useApi(storeService.list, []);

  const data = Array.isArray(apiData) ? apiData : [];

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const [f, setF] = useState({
    name: "",
    code: "",
    phone: "",
    address: "",
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
      code: "",
      phone: "",
      address: "",
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

      await storeService.create({
        name: f.name.trim(),
        code: f.code.trim(),
        phone: f.phone.trim(),
        address: f.address.trim(),
      });

      closeModal();
      reload();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to create store",
      );
    } finally {
      setSaving(false);
    }
  };

  const filteredStores = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return data;

    return data.filter((store) =>
      [
        store.name,
        store.code,
        store.phone,
        store.address,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(query),
        ),
    );
  }, [data, search]);

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">

        {/* Header */}
        <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              <Store size={14} />
              Locations
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Stores
            </h1>

            <p className="mt-1.5 text-sm text-slate-500">
              Manage your billing locations and store information.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md"
          >
            <Plus size={17} />
            Add store
          </button>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
          <StoreStat
            icon={Store}
            label="Total stores"
            value={data.length}
            description="Billing locations"
          />

          <StoreStat
            icon={Building2}
            label="Active locations"
            value={data.length}
            description="Available for billing"
          />

          <StoreStat
            icon={MapPin}
            label="Addresses"
            value={
              data.filter((store) => store.address?.trim()).length
            }
            description="Locations with address"
          />
        </div>

        {/* Store List */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Toolbar */}
          <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Store directory
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                {filteredStores.length} store
                {filteredStores.length !== 1 ? "s" : ""} shown
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
                placeholder="Search store, code or phone..."
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

          {/* Loading */}
          {loading ? (
            <StoreSkeleton />
          ) : filteredStores.length === 0 ? (
            <EmptyStores
              hasSearch={Boolean(search)}
              onAdd={() => setOpen(true)}
            />
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[750px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70">
                      <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Store
                      </th>

                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Code
                      </th>

                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Phone
                      </th>

                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Address
                      </th>

                      <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredStores.map((store) => (
                      <tr
                        key={store._id}
                        className="transition hover:bg-slate-50/70"
                      >
                        {/* Store */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                              <Store size={18} />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-slate-900">
                                {store.name}
                              </p>

                              <p className="mt-0.5 text-xs text-slate-400">
                                Billing location
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Code */}
                        <td className="px-4 py-4">
                          {store.code ? (
                            <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-semibold text-slate-600">
                              {store.code}
                            </span>
                          ) : (
                            <span className="text-sm text-slate-400">
                              —
                            </span>
                          )}
                        </td>

                        {/* Phone */}
                        <td className="px-4 py-4">
                          {store.phone ? (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Phone
                                size={14}
                                className="text-slate-400"
                              />
                              {store.phone}
                            </div>
                          ) : (
                            <span className="text-sm text-slate-400">
                              —
                            </span>
                          )}
                        </td>

                        {/* Address */}
                        <td className="max-w-[320px] px-4 py-4">
                          <div className="flex items-start gap-2 text-sm text-slate-600">
                            <MapPin
                              size={14}
                              className="mt-0.5 shrink-0 text-slate-400"
                            />

                            <span className="truncate">
                              {store.address || "No address"}
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 text-right">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="divide-y divide-slate-100 md:hidden">
                {filteredStores.map((store) => (
                  <div
                    key={store._id}
                    className="p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Store size={18} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-bold text-slate-900">
                              {store.name}
                            </h3>

                            {store.code && (
                              <p className="mt-1 font-mono text-[11px] text-slate-400">
                                {store.code}
                              </p>
                            )}
                          </div>

                          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        </div>

                        <div className="mt-4 space-y-2">
                          <MobileInfo
                            icon={Phone}
                            value={store.phone || "No phone"}
                          />

                          <MobileInfo
                            icon={MapPin}
                            value={
                              store.address || "No address"
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </div>

      {/* Add Store Modal */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Plus size={17} />
                  </div>

                  <h2 className="text-lg font-bold text-slate-900">
                    Add store
                  </h2>
                </div>

                <p className="mt-1 pl-11 text-xs text-slate-500">
                  Add a new billing location to your account.
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
              <div className="space-y-4 px-5 py-5 sm:px-6">

                <Field
                  label="Store name"
                  required
                  value={f.name}
                  onChange={(e) =>
                    set("name", e.target.value)
                  }
                  placeholder="e.g. Main Branch"
                  icon={Store}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Store code"
                    value={f.code}
                    onChange={(e) =>
                      set("code", e.target.value)
                    }
                    placeholder="e.g. ST-001"
                    icon={Hash}
                  />

                  <Field
                    label="Phone"
                    type="tel"
                    value={f.phone}
                    onChange={(e) =>
                      set("phone", e.target.value)
                    }
                    placeholder="e.g. 9876543210"
                    icon={Phone}
                  />
                </div>

                <Field
                  label="Address"
                  value={f.address}
                  onChange={(e) =>
                    set("address", e.target.value)
                  }
                  placeholder="Enter store address"
                  icon={MapPin}
                />

                <div className="flex items-start gap-2 rounded-xl bg-blue-50 p-3.5 text-xs leading-5 text-blue-700">
                  <CheckCircle2
                    size={15}
                    className="mt-0.5 shrink-0"
                  />

                  <span>
                    This store will be available as a billing location
                    across the application.
                  </span>
                </div>
              </div>

              {/* Footer */}
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
                      Save store
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

function StoreStat({
  icon: Icon,
  label,
  value,
  description,
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

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Icon size={17} />
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  icon: Icon,
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
        {Icon && (
          <Icon
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
        )}

        {label === "Address" ? (
          <textarea
            {...props}
            required={required}
            rows={3}
            className="w-full resize-none rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          />
        ) : (
          <input
            {...props}
            required={required}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          />
        )}
      </div>
    </div>
  );
}

function MobileInfo({ icon: Icon, value }) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg bg-slate-50 px-3 py-2.5">
      <Icon
        size={14}
        className="shrink-0 text-slate-400"
      />

      <span className="truncate text-xs font-medium text-slate-600">
        {value}
      </span>
    </div>
  );
}

function EmptyStores({ hasSearch, onAdd }) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        {hasSearch ? (
          <Search size={24} />
        ) : (
          <Store size={24} />
        )}
      </div>

      <h3 className="mt-4 text-sm font-bold text-slate-900">
        {hasSearch
          ? "No stores found"
          : "No stores yet"}
      </h3>

      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
        {hasSearch
          ? "Try searching with a different store name, code or phone."
          : "Add your first billing location to get started."}
      </p>

      {!hasSearch && (
        <button
          type="button"
          onClick={onAdd}
          className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white transition hover:bg-blue-700"
        >
          <Plus size={15} />
          Add store
        </button>
      )}
    </div>
  );
}

function StoreSkeleton() {
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
          <div className="hidden h-3 w-28 rounded bg-slate-100 md:block" />
          <div className="h-3 w-16 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}