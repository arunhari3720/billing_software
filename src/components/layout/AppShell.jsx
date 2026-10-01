import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Receipt,
  Package,
  Store,
  Boxes,
  Users,
  Crown,
  FileText,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const agencyLinks = [
  ["/", "Dashboard", LayoutDashboard],
  ["/billing", "Billing", Receipt],
  ["/optional-billing", "Optional Billing", FileText],
  ["/products", "Products", Package],
  ["/stores", "Stores", Store],
  ["/stock", "Stock", Boxes],
  ["/users", "Users", Users],
];

const masterLinks = [
  ["/", "Dashboard", LayoutDashboard],
  ["/agencies", "Agencies", Crown],
];

export default function AppShell({ children }) {
  const { user, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const navigate = useNavigate();

  const links = user?.role === "MASTER" ? masterLinks : agencyLinks;

  const signOut = async () => {
    try {
      await logout?.();
    } finally {
      localStorage.removeItem("bf_token");
      localStorage.removeItem("bf_user");

      setMobileOpen(false);
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-900">

      {/* =====================================================
          MOBILE TOP BAR
      ====================================================== */}
      <header className="no-print sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">

        <div className="flex items-center gap-3">

          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-xs font-black text-white">
              BF
            </div>

            <div>
              <p className="font-bold leading-none text-slate-900">
                BillForge
              </p>

              <p className="mt-1 text-[9px] font-semibold uppercase tracking-widest text-slate-400">
                {user?.role === "MASTER"
                  ? "Master Control"
                  : user?.agency?.code || "Workspace"}
              </p>
            </div>
          </div>

        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-50 text-sm font-bold text-cyan-700">
          {user?.name?.charAt(0)?.toUpperCase() || "A"}
        </div>

      </header>


      {/* =====================================================
          MOBILE OVERLAY
      ====================================================== */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-[2px] lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}


      {/* =====================================================
          SIDEBAR
      ====================================================== */}
      <aside
        className={`
          no-print fixed left-0 top-0 z-50 flex h-screen flex-col
          border-r border-slate-200 bg-white
          shadow-[4px_0_24px_-18px_rgba(15,23,42,0.25)]
          transition-all duration-300

          lg:translate-x-0

          ${collapsed ? "lg:w-[78px]" : "lg:w-[260px]"}

          ${
            mobileOpen
              ? "translate-x-0 w-[280px]"
              : "-translate-x-full"
          }
        `}
      >

        {/* =================================================
            SIDEBAR HEADER
        ================================================== */}
        <div
          className={`
            flex h-20 shrink-0 items-center border-b border-slate-100
            ${
              collapsed
                ? "justify-center px-3"
                : "justify-between px-5"
            }
          `}
        >

          <NavLink
            to="/"
            onClick={() => setMobileOpen(false)}
            className="flex min-w-0 items-center gap-3"
          >

            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-900 text-xs font-black text-white shadow-sm">
              BF
            </div>

            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate font-bold tracking-tight text-slate-900">
                  BillForge
                </p>

                <p className="truncate text-[10px] font-medium text-slate-400">
                  Business workspace
                </p>
              </div>
            )}

          </NavLink>


          {/* Desktop collapse */}
          {!collapsed && (
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 lg:flex"
              title="Collapse sidebar"
            >
              <PanelLeftClose size={17} />
            </button>
          )}


          {/* Mobile close */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 lg:hidden"
          >
            <X size={18} />
          </button>

        </div>


        {/* =================================================
            COLLAPSED EXPAND BUTTON
        ================================================== */}
        {collapsed && (
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            className="mx-auto mt-4 hidden h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:bg-slate-50 hover:text-slate-700 lg:flex"
            title="Expand sidebar"
          >
            <PanelLeftOpen size={17} />
          </button>
        )}


        {/* =================================================
            NAVIGATION
        ================================================== */}
        <nav
          className={`
            flex-1 overflow-y-auto py-6
            ${collapsed ? "px-3" : "px-4"}
          `}
        >

          {!collapsed && (
            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Workspace
            </p>
          )}

          <div className="space-y-1">

            {links.map(([to, label, Icon]) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? label : undefined}
                className={({ isActive }) =>
                  `
                    group flex w-full items-center rounded-xl
                    text-sm font-medium transition-all duration-150

                    ${
                      collapsed
                        ? "justify-center px-3 py-3"
                        : "gap-3 px-3 py-2.5"
                    }

                    ${
                      isActive
                        ? "bg-cyan-50 text-cyan-700"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }
                  `
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`
                        shrink-0 transition-colors
                        ${
                          isActive
                            ? "text-cyan-600"
                            : "text-slate-400 group-hover:text-slate-600"
                        }
                      `}
                    >
                      <Icon size={18} />
                    </span>

                    {!collapsed && (
                      <span className="truncate">
                        {label}
                      </span>
                    )}

                    {!collapsed && isActive && (
                      <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-500" />
                    )}
                  </>
                )}
              </NavLink>
            ))}

          </div>

        </nav>


        {/* =================================================
            USER / LOGOUT
        ================================================== */}
        <div
          className={`
            shrink-0 border-t border-slate-100
            ${collapsed ? "p-3" : "p-4"}
          `}
        >

          {!collapsed && (
            <div className="mb-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-sm font-bold text-cyan-700">
                {user?.name?.charAt(0)?.toUpperCase() || "A"}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {user?.name || "Admin"}
                </p>

                <p className="truncate text-[11px] text-slate-400">
                  {user?.role === "MASTER"
                    ? "Master account"
                    : user?.agency?.code || "Agency account"}
                </p>
              </div>

            </div>
          )}


          <button
            type="button"
            onClick={signOut}
            title={collapsed ? "Sign out" : undefined}
            className={`
              flex w-full items-center rounded-xl
              text-sm font-medium text-slate-500
              transition hover:bg-red-50 hover:text-red-600

              ${
                collapsed
                  ? "justify-center p-3"
                  : "gap-3 px-3 py-2.5"
              }
            `}
          >

            <LogOut size={17} />

            {!collapsed && (
              <span>Sign out</span>
            )}

          </button>

        </div>

      </aside>


      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}
      <main
        className={`
          min-h-screen transition-[margin] duration-300
          ${collapsed ? "lg:ml-[78px]" : "lg:ml-[260px]"}
        `}
      >

        <div className="mx-auto min-w-0 max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </div>

      </main>

    </div>
  );
}