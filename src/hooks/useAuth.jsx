import { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../services/auth.service";
const C = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!localStorage.getItem("bf_token")) return setLoading(false);
    authService
      .me()
      .then((r) => setUser(r.data.user))
      .catch(() => localStorage.removeItem("bf_token"))
      .finally(() => setLoading(false));
  }, []);
  const login = async (d) => {
    const r = await authService.login(d);
    localStorage.setItem("bf_token", r.data.token);
    setUser(r.data.user);
    return r.data.user;
  };
  const logout = () => {
    localStorage.removeItem("bf_token");
    setUser(null);
  };
  return (
    <C.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </C.Provider>
  );
}
export const useAuth = () => useContext(C);
