import { useEffect, useState } from "react";
import { productOptionService } from "../../services/productoption.service";

const ADD_NEW = "__ADD_NEW_OPTION__";

export default function DynamicProductOptionField({
  type,
  label,
  value = "",
  onChange,
  placeholder,
}) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newValue, setNewValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isBrand = type === "BRAND";

  useEffect(() => {
    let cancelled = false;

    const loadOptions = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await productOptionService.list(type);
        const items = response?.data ?? [];

        if (!cancelled) {
          setOptions(
            [...new Set(items.filter((item) => typeof item === "string"))]
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.response?.data?.message ||
              `Failed to load ${label.toLowerCase()} options`
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadOptions();

    return () => {
      cancelled = true;
    };
  }, [type, label]);

  const handleAddNew = async () => {
    const cleanedValue = newValue.trim().replace(/\s+/g, " ");

    if (!cleanedValue) {
      setError(`Enter a ${label.toLowerCase()} name`);
      return;
    }

    const existing = options.find(
      (item) => item.toLowerCase() === cleanedValue.toLowerCase()
    );

    // Select the existing value instead of adding a duplicate.
    if (existing) {
      onChange(existing);
      setAdding(false);
      setNewValue("");
      setError("");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await productOptionService.create({
        type,
        value: cleanedValue,
      });

      if (!response?.success) {
        throw new Error(response?.message || "Unable to save option");
      }

      const savedValue = response?.data?.value || cleanedValue;

      setOptions((previous) =>
        previous.some(
          (item) => item.toLowerCase() === savedValue.toLowerCase()
        )
          ? previous
          : [...previous, savedValue].sort((a, b) =>
              a.localeCompare(b)
            )
      );

      onChange(savedValue);
      setNewValue("");
      setAdding(false);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          `Failed to add ${label.toLowerCase()}`
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">
        {label}
      </label>

      {!adding ? (
        <div className="flex gap-2">
          <select
            value={value || ""}
            onChange={(event) => {
              const nextValue = event.target.value;

              if (nextValue === ADD_NEW) {
                setAdding(true);
                setNewValue("");
                setError("");
                return;
              }

              onChange(nextValue);
            }}
            disabled={loading}
            className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:opacity-60"
          >
            <option value="">
              {loading
                ? "Loading options..."
                : placeholder || `Select ${label.toLowerCase()}`}
            </option>

            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}

            <option value={ADD_NEW}>
              + Add New {isBrand ? "Brand" : "Category"}
            </option>
          </select>

          <button
            type="button"
            onClick={() => {
              setAdding(true);
              setNewValue("");
              setError("");
            }}
            className="shrink-0 rounded-lg border border-orange-300 px-3 text-sm font-medium text-orange-600 transition hover:bg-orange-50"
          >
            + Add
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={newValue}
            maxLength={100}
            autoFocus
            placeholder={`Enter new ${label.toLowerCase()}`}
            onChange={(event) => {
              setNewValue(event.target.value);
              setError("");
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                if (!saving) handleAddNew();
              }
            }}
            className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAddNew}
              disabled={saving || !newValue.trim()}
              className="rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => {
                setAdding(false);
                setNewValue("");
                setError("");
              }}
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}