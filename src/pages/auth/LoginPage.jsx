import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Button from "../../components/ui/Button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const u = await login({ email, password });

      nav(u.role === "MASTER" ? "/" : "/");
    } catch (e) {
      setError(e.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f8fafc] text-slate-900">

      {/* Background Decoration */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[450px] w-[450px] rounded-full bg-cyan-100/60 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-blue-100/60 blur-3xl" />

      {/* Main */}
      <div className="relative z-10 grid min-h-screen lg:grid-cols-2">

        {/* =====================================================
            LEFT BRANDING SECTION
        ====================================================== */}
        <div className="hidden flex-col justify-between bg-white p-10 lg:flex xl:p-14">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-slate-900 font-black text-white shadow-lg shadow-slate-900/10">
              BF
            </div>

            <div>
              <p className="text-lg font-bold tracking-tight text-slate-900">
                BillingFlow
              </p>

              <p className="text-xs text-slate-400">
                Business billing platform
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-xl">

            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-700">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />

              Built for modern businesses
            </div>

            <h2 className="text-5xl font-black leading-[1.05] tracking-tight text-slate-900 xl:text-6xl">
              Everything you need
              <br />

              <span className="text-cyan-500">
                to run your billing.
              </span>
            </h2>

            <p className="mt-6 max-w-lg text-base leading-7 text-slate-500">
              Manage invoices, customers, payments and business operations
              from one simple and powerful workspace.
            </p>

            {/* Features */}
            <div className="mt-10 grid max-w-lg grid-cols-3 gap-3">

              <Feature
                icon="₹"
                title="Billing"
                text="Simple"
              />

              <Feature
                icon="↗"
                title="Reports"
                text="Powerful"
              />

              <Feature
                icon="✓"
                title="Security"
                text="Reliable"
              />

            </div>
          </div>

          {/* Footer */}
          <p className="text-xs text-slate-400">
            © 2026 BillingFlow. All rights reserved.
          </p>
        </div>

        {/* =====================================================
            RIGHT LOGIN SECTION
        ====================================================== */}
        <div className="flex items-center justify-center px-5 py-10 sm:px-8">

          <div className="w-full max-w-md">

            {/* Mobile Logo */}
            <div className="mb-10 flex items-center justify-center gap-3 lg:hidden">

              <div className="grid h-11 w-11 place-items-center rounded-xl bg-slate-900 font-black text-white shadow-lg">
                BF
              </div>

              <div>
                <p className="font-bold text-slate-900">
                  BillingFlow
                </p>

                <p className="text-xs text-slate-400">
                  Business billing platform
                </p>
              </div>

            </div>

            {/* =================================================
                LOGIN CARD
            ================================================== */}
            <div className="rounded-[28px] border border-slate-200/80 bg-white p-7 shadow-[0_24px_70px_-25px_rgba(15,23,42,0.18)] sm:p-9">

              {/* Header */}
              <div className="mb-8">

                {/* Icon */}
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                    />

                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 20a8 8 0 0116 0"
                    />
                  </svg>

                </div>

                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-600">
                  Welcome back
                </p>

                <h1 className="text-[30px] font-bold tracking-[-0.03em] text-slate-900">
                  Sign in to your account
                </h1>

                <p className="mt-2 text-[14px] leading-6 text-slate-500">
                  Enter your credentials to access your billing workspace.
                </p>

              </div>

              {/* =================================================
                  FORM
              ================================================== */}
              <form onSubmit={submit} className="space-y-5">

                {/* EMAIL */}
                <div>

                  <label
                    htmlFor="email"
                    className="mb-2 block text-[13px] font-semibold text-slate-700"
                  >
                    Email address
                  </label>

                  <div className="group relative">

                    {/* Email Icon */}
                    <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-cyan-500">

                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-[18px] w-[18px]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <rect
                          x="3"
                          y="5"
                          width="18"
                          height="14"
                          rx="2"
                        />

                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 7l9 6 9-6"
                        />
                      </svg>

                    </div>

                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      required
                      autoComplete="email"
                      className="h-[52px] w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-11 pr-4 text-[14px] font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10"
                    />

                  </div>
                </div>

                {/* PASSWORD */}
                <div>

                  <div className="mb-2 flex items-center justify-between">

                    <label
                      htmlFor="password"
                      className="block text-[13px] font-semibold text-slate-700"
                    >
                      Password
                    </label>

                    <button
                      type="button"
                      className="text-[12px] font-semibold text-cyan-600 transition hover:text-cyan-700"
                    >
                      Forgot password?
                    </button>

                  </div>

                  <div className="group relative">

                    {/* Lock Icon */}
                    <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-cyan-500">

                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-[18px] w-[18px]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <rect
                          x="5"
                          y="10"
                          width="14"
                          height="10"
                          rx="2"
                        />

                        <path
                          strokeLinecap="round"
                          d="M8 10V7a4 4 0 018 0v3"
                        />
                      </svg>

                    </div>

                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      autoComplete="current-password"
                      className="h-[52px] w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-11 pr-12 text-[14px] font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10"
                    />

                    {/* Eye Button */}
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >

                      {showPassword ? (

                        /* Eye Off */
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-[18px] w-[18px]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 3l18 18"
                          />

                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M10.6 10.6a2 2 0 102.8 2.8"
                          />

                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9.9 4.2A10.8 10.8 0 0112 4c5.5 0 9.5 4.8 10.5 7-.5 1-1.6 2.6-3.3 4"
                          />

                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6.2 6.2C4.2 7.5 2.7 9.5 1.5 11c1.4 2.4 5.2 7 10.5 7 1.1 0 2.1-.2 3-.5"
                          />
                        </svg>

                      ) : (

                        /* Eye */
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-[18px] w-[18px]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"
                          />

                          <circle
                            cx="12"
                            cy="12"
                            r="3"
                          />
                        </svg>

                      )}

                    </button>

                  </div>
                </div>

                {/* ERROR */}
                {error && (
                  <div className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3">

                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-600">
                      !
                    </div>

                    <p className="text-[13px] font-medium text-red-600">
                      {error}
                    </p>

                  </div>
                )}

                {/* SIGN IN */}
                <Button
                  type="submit"
                  className="group mt-2 h-[52px] w-full rounded-xl !bg-slate-900 !text-white shadow-[0_8px_20px_-8px_rgba(15,23,42,0.5)] transition-all duration-200 hover:-translate-y-[1px] hover:!bg-slate-800 hover:shadow-[0_12px_25px_-8px_rgba(15,23,42,0.45)] active:translate-y-0"
                >

                  <span className="flex items-center justify-center gap-2 text-[14px] font-semibold">

                    Sign in

                    <span className="text-[18px] transition-transform duration-200 group-hover:translate-x-1">
                      →
                    </span>

                  </span>

                </Button>

              </form>

              {/* DIVIDER */}
              <div className="my-7 flex items-center gap-4">

                <div className="h-px flex-1 bg-slate-200" />

                <span className="whitespace-nowrap text-[10px] font-bold tracking-[0.16em] text-slate-400">
                  NEW TO BILLINGFLOW?
                </span>

                <div className="h-px flex-1 bg-slate-200" />

              </div>

              {/* REGISTER */}
              <Link
                to="/register"
                className="group flex h-[52px] w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-[14px] font-semibold text-slate-700 transition-all duration-200 hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
              >

                Create your workspace

                <span className="transition-transform duration-200 group-hover:translate-x-1">
                  →
                </span>

              </Link>

            </div>

            {/* TERMS */}
            <p className="mt-6 text-center text-[11px] leading-5 text-slate-400">

              By continuing, you agree to our{" "}

              <span className="font-medium text-slate-500">
                Terms of Service
              </span>

              {" "}and{" "}

              <span className="font-medium text-slate-500">
                Privacy Policy
              </span>

              .

            </p>

          </div>
        </div>

      </div>
    </div>
  );
}

/* =========================================================
   FEATURE CARD
========================================================= */

function Feature({ icon, title, text }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-200 hover:bg-cyan-50/50">

      <div className="mb-3 grid h-8 w-8 place-items-center rounded-lg bg-cyan-100 text-sm font-bold text-cyan-600">
        {icon}
      </div>

      <p className="text-sm font-semibold text-slate-800">
        {title}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {text}
      </p>

    </div>
  );
}
