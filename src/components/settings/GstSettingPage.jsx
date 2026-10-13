import { useCallback, useEffect, useState } from "react";
import { gstSettingService } from "../../services/gst.settings.service";

const DEFAULT_SETTINGS = {
  enabled: false,
  calculationMode: "BEFORE_TAX",
  taxType: "AUTO",
  defaultGstRate: 18,
  sellerState: "",
};

const INDIAN_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Other",
];

function normalizeSettings(data = {}) {
  return {
    enabled: Boolean(data.enabled ?? DEFAULT_SETTINGS.enabled),
    calculationMode:
      data.calculationMode ?? DEFAULT_SETTINGS.calculationMode,
    taxType: data.taxType ?? DEFAULT_SETTINGS.taxType,
    defaultGstRate: data.defaultGstRate ?? DEFAULT_SETTINGS.defaultGstRate,
    sellerState: data.sellerState ?? DEFAULT_SETTINGS.sellerState,
  };
}

function SectionHeading({ title, description }) {
  return (
    <div className="mb-5">
      <h2 className="text-sm font-semibold text-[#10233f]">{title}</h2>
      {description ? (
        <p className="mt-1 text-sm leading-6 text-[#6f829f]">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function TaxOption({
  title,
  description,
  value,
  selected,
  disabled,
  onChange,
}) {
  const active = selected === value;

  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={active}
      onClick={() => onChange(value)}
      className={`flex w-full items-center justify-between gap-4 rounded-xl border p-4 text-left transition ${
        active
          ? "border-[#9cdeea] bg-[#079bc7]/5"
          : "border-[#e2e9f2] bg-[#f8fafc] hover:border-[#d6e0eb]"
      } disabled:cursor-not-allowed disabled:opacity-60`}
    >
      <span className="flex min-w-0 items-center gap-3">
        <span
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
            active ? "border-[#079bc7]" : "border-[#c7d3e1]"
          }`}
          aria-hidden="true"
        >
          {active ? (
            <span className="h-2.5 w-2.5 rounded-full bg-[#079bc7]" />
          ) : null}
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-medium text-[#10233f]">
            {title}
          </span>
          <span className="mt-0.5 block text-xs leading-5 text-[#8a9bb3]">
            {description}
          </span>
        </span>
      </span>
    </button>
  );
}

export default function GstSettingsPage() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const response = await gstSettingService.get();
      const data = response?.data?.data ?? response?.data ?? {};

      setSettings(normalizeSettings(data));
    } catch (err) {
      console.error("Failed to load GST settings:", err);
      setError(
        err?.response?.data?.message || "Failed to load GST settings."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleChange = (field, value) => {
    setSettings((current) => ({ ...current, [field]: value }));
    setMessage("");
    setError("");
  };

  const handleSave = async (event) => {
    event.preventDefault();

    const gstRate = Number(settings.defaultGstRate);
    if (!Number.isFinite(gstRate) || gstRate < 0 || gstRate > 100) {
      setError("Enter a GST rate between 0 and 100.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const payload = {
        enabled: Boolean(settings.enabled),
        calculationMode: settings.calculationMode,
        taxType: settings.taxType,
        defaultGstRate: gstRate,
        sellerState: settings.sellerState.trim(),
      };

      const response = await gstSettingService.update(payload);
      const data = response?.data?.data ?? response?.data;

      if (data && typeof data === "object") {
        setSettings(normalizeSettings(data));
      }

      setMessage(response?.message || "GST settings saved successfully.");
    } catch (err) {
      console.error("Failed to save GST settings:", err);
      setError(
        err?.response?.data?.message || "Failed to save GST settings."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#f6f9fc] px-4">
        <div className="flex items-center gap-3 text-sm text-[#6f829f]">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#c7d3e1] border-t-[#079bc7]" />
          Loading GST settings...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#f6f9fc] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#079bc7]">
              Billing Configuration
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-[#10233f] sm:text-3xl">
              GST Calculation
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6f829f]">
              Configure how GST should be calculated and applied automatically
              to your bills.
            </p>
          </div>

          <div
            className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${
              settings.enabled
                ? "border-[#bdebdc] bg-[#ecfbf5] text-[#159a72]"
                : "border-[#d6e0eb] bg-white text-[#6f829f]"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                settings.enabled ? "bg-[#16b981]" : "bg-[#9aa9bc]"
              }`}
            />
            {settings.enabled ? "GST Enabled" : "GST Disabled"}
          </div>
        </header>

        <form onSubmit={handleSave}>
          <section className="mb-6 overflow-hidden rounded-2xl border border-[#e2e9f2] bg-white shadow-[0_8px_30px_rgba(30,70,110,0.06)]">
            <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e8f8fc] text-[#079bc7]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 3v18M5 7h14M5 17h14"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-[#10233f]">
                    Enable GST Calculation
                  </h2>
                  <p className="mt-1 text-sm leading-5 text-[#6f829f]">
                    Automatically calculate GST when creating customer bills.
                  </p>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={settings.enabled}
                aria-label="Enable GST calculation"
                onClick={() => handleChange("enabled", !settings.enabled)}
                className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                  settings.enabled ? "bg-[#079bc7]" : "bg-[#9aa9bc]"
                }`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    settings.enabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </section>

          <div
            className={`space-y-6 transition-opacity ${
              settings.enabled ? "opacity-100" : "opacity-60"
            }`}
          >
            <section className="rounded-2xl border border-[#e2e9f2] bg-white p-5 shadow-[0_8px_30px_rgba(30,70,110,0.06)] sm:p-6">
              <SectionHeading
                title="Calculation Method"
                description="Choose whether your product price includes GST or GST should be added separately."
              />

              <div className="grid gap-4 md:grid-cols-2">
                <button
                  type="button"
                  disabled={!settings.enabled}
                  aria-pressed={settings.calculationMode === "BEFORE_TAX"}
                  onClick={() =>
                    handleChange("calculationMode", "BEFORE_TAX")
                  }
                  className={`rounded-xl border p-5 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    settings.calculationMode === "BEFORE_TAX"
                      ? "border-[#66cfe4] bg-[#079bc7]/5 ring-1 ring-[#079bc7]/10"
                      : "border-[#e2e9f2] bg-[#f8fafc] hover:border-[#d6e0eb]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-[#10233f]">
                        Before Tax
                      </h3>
                      <p className="mt-2 text-sm leading-5 text-[#6f829f]">
                        Product price does not include GST. GST will be added
                        to the price.
                      </p>
                    </div>
                    <span
                      className={`mt-1 h-4 w-4 shrink-0 rounded-full border ${
                        settings.calculationMode === "BEFORE_TAX"
                          ? "border-[#079bc7] bg-[#079bc7] ring-4 ring-[#079bc7]/10"
                          : "border-[#c7d3e1]"
                      }`}
                    />
                  </div>
                  <div className="mt-4 rounded-lg bg-[#f8fafc] px-3 py-2 text-xs text-[#6f829f]">
                    ₹1,000 + 18% GST = ₹1,180
                  </div>
                </button>

                <button
                  type="button"
                  disabled={!settings.enabled}
                  aria-pressed={settings.calculationMode === "AFTER_TAX"}
                  onClick={() => handleChange("calculationMode", "AFTER_TAX")}
                  className={`rounded-xl border p-5 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    settings.calculationMode === "AFTER_TAX"
                      ? "border-[#66cfe4] bg-[#079bc7]/5 ring-1 ring-[#079bc7]/10"
                      : "border-[#e2e9f2] bg-[#f8fafc] hover:border-[#d6e0eb]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-[#10233f]">
                        After Tax
                      </h3>
                      <p className="mt-2 text-sm leading-5 text-[#6f829f]">
                        Product price already includes GST. GST will be
                        reverse-calculated.
                      </p>
                    </div>
                    <span
                      className={`mt-1 h-4 w-4 shrink-0 rounded-full border ${
                        settings.calculationMode === "AFTER_TAX"
                          ? "border-[#079bc7] bg-[#079bc7] ring-4 ring-[#079bc7]/10"
                          : "border-[#c7d3e1]"
                      }`}
                    />
                  </div>
                  <div className="mt-4 rounded-lg bg-[#f8fafc] px-3 py-2 text-xs text-[#6f829f]">
                    ₹1,180 includes ₹180 GST
                  </div>
                </button>
              </div>
            </section>

            <section className="rounded-2xl border border-[#e2e9f2] bg-white p-5 shadow-[0_8px_30px_rgba(30,70,110,0.06)] sm:p-6">
              <SectionHeading
                title="Tax Type"
                description="Choose how GST should be split on invoices."
              />

              <div className="space-y-3">
                <TaxOption
                  title="Auto"
                  description="Automatically use CGST + SGST or IGST based on state."
                  value="AUTO"
                  selected={settings.taxType}
                  disabled={!settings.enabled}
                  onChange={(value) => handleChange("taxType", value)}
                />
                <TaxOption
                  title="CGST + SGST"
                  description="Use intra-state GST split between CGST and SGST."
                  value="CGST_SGST"
                  selected={settings.taxType}
                  disabled={!settings.enabled}
                  onChange={(value) => handleChange("taxType", value)}
                />
                <TaxOption
                  title="IGST"
                  description="Use IGST for inter-state transactions."
                  value="IGST"
                  selected={settings.taxType}
                  disabled={!settings.enabled}
                  onChange={(value) => handleChange("taxType", value)}
                />
              </div>
            </section>

            <section className="rounded-2xl border border-[#e2e9f2] bg-white p-5 shadow-[0_8px_30px_rgba(30,70,110,0.06)] sm:p-6">
              <SectionHeading
                title="GST Defaults"
                description="These values are used as fallback billing configuration."
              />

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="defaultGstRate"
                    className="mb-2 block text-sm font-medium text-[#10233f]"
                  >
                    Default GST Rate (%)
                  </label>
                  <input
                    id="defaultGstRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    required
                    disabled={!settings.enabled}
                    value={settings.defaultGstRate}
                    onChange={(event) =>
                      handleChange("defaultGstRate", event.target.value)
                    }
                    className="w-full rounded-xl border border-[#d6e0eb] bg-[#f8fafc] px-4 py-3 text-sm text-[#10233f] outline-none transition focus:border-[#079bc7] focus:ring-2 focus:ring-[#079bc7]/10 disabled:cursor-not-allowed"
                  />
                  <p className="mt-2 text-xs text-[#8a9bb3]">
                    Product-specific GST rates take priority when available.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="sellerState"
                    className="mb-2 block text-sm font-medium text-[#10233f]"
                  >
                    Seller State
                  </label>
                  <select
                    id="sellerState"
                    disabled={!settings.enabled}
                    value={settings.sellerState}
                    onChange={(event) =>
                      handleChange("sellerState", event.target.value)
                    }
                    className="w-full rounded-xl border border-[#d6e0eb] bg-[#f8fafc] px-4 py-3 text-sm text-[#10233f] outline-none transition focus:border-[#079bc7] focus:ring-2 focus:ring-[#079bc7]/10 disabled:cursor-not-allowed"
                  >
                    <option value="">Select state</option>
                    {INDIAN_STATES.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-xs text-[#8a9bb3]">
                    Used by Auto tax type to determine CGST/SGST or IGST.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {message ? (
            <div
              role="status"
              className="mt-5 rounded-xl border border-[#bdebdc] bg-[#ecfbf5] px-4 py-3 text-sm text-[#159a72]"
            >
              {message}
            </div>
          ) : null}

          {error ? (
            <div
              role="alert"
              className="mt-5 rounded-xl border border-[#f3caca] bg-[#fff3f3] px-4 py-3 text-sm text-[#d44b4b]"
            >
              {error}
            </div>
          ) : null}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={loadSettings}
              disabled={saving || loading}
              className="rounded-xl border border-[#d6e0eb] bg-white px-5 py-3 text-sm font-medium text-[#6f829f] transition hover:border-[#c7d3e1] hover:text-[#10233f] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#079bc7] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#079bc7]/10 transition hover:bg-[#058db5] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : null}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
