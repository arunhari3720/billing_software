import { useCallback, useEffect, useState } from "react";
export function useApi(loader, dependencies = []) {
  const [data, setData] = useState(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const r = await loader();
      setData(r.data.data ?? r.data);
    } catch (e) {
      setError(e.response?.data?.message || "Request failed");
    } finally {
      setLoading(false);
    }
  }, dependencies);
  useEffect(() => {
    load();
  }, [load]);
  return { data, setData, loading, error, reload: load };
}
