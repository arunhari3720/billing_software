
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Button from "../../components/ui/Button";

export default function RegisterPage() {
  const [f, setF] = useState({
    agencyName: "",
    agencyCode: "",
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
  });

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const nav = useNavigate();

  const set = (k, v) => {
    setF((x) => ({
      ...x,
      [k]: v,
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const { authService } = await import("../../services/auth.service");

      const r = await authService.register(f);

      localStorage.setItem("bf_token", r.data.token);

      await login(f);

      nav("/");
    } catch (e) {
      setError(
        e.response?.data?.message || "Registration failed"
      );
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f8fafc] text-slate-900">

      {/* =====================================================
          BACKGROUND DECORATION
      ====================================================== */}

      <div className="pointer-events-none absolute -left-40 -top-40 h-[450px] w-[450px] rounded-full bg-cyan-100/60 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-blue-100/60 blur-3xl" />

      {/* =====================================================
          MAIN
      ====================================================== */}

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:py-12">

        {/* =================================================
            TOP BRAND
        ================================================== */}

        <div className="mb-8 flex items-center justify-between">

          {/* Logo */}

          <Link
            to="/login"
            className="flex items-center gap-3"
          >
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
          </Link>

          {/* Login */}

          <div className="hidden items-center gap-3 sm:flex">

            <span className="text-sm text-slate-500">
              Already have an account?
            </span>

            <Link
              to="/login"
              className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white hover:text-cyan-600"
            >
              Sign in →
            </Link>

          </div>
        </div>

        {/* =================================================
            CONTENT
        ================================================== */}

        <div className="grid overflow-hidden rounded-[30px] border border-slate-200/80 bg-white shadow-[0_30px_80px_-30px_rgba(15,23,42,0.18)] lg:grid-cols-[0.85fr_1.5fr]">

          {/* =================================================
              LEFT INFO
          ================================================== */}

          <div className="relative hidden bg-slate-900 p-10 text-white lg:block xl:p-12">

            {/* Glow */}

            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />

            <div className="relative z-10 flex h-full flex-col justify-between">

              <div>

                {/* Badge */}

                <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-cyan-300">

                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />

                  Get started

                </div>

                <h1 className="text-4xl font-black leading-tight tracking-tight xl:text-5xl">

                  Build your
                  <br />

                  <span className="text-cyan-400">
                    billing workspace.
                  </span>

                </h1>

                <p className="mt-6 max-w-sm text-sm leading-7 text-slate-400">
                  Set up your agency workspace and start managing
                  customers, invoices and payments from one place.
                </p>

              </div>

              {/* Benefits */}

              <div className="mt-12 space-y-4">

                <Benefit
                  icon="✓"
                  title="Centralized billing"
                  text="Keep your billing operations organized."
                />

                <Benefit
                  icon="↗"
                  title="Business insights"
                  text="Understand your revenue with clear reports."
                />

                <Benefit
                  icon="⌁"
                  title="Built to scale"
                  text="Grow your workspace as your business grows."
                />

              </div>

              <p className="mt-12 text-xs text-slate-600">
                © 2026 BillingFlow
              </p>

            </div>
          </div>

          {/* =================================================
              RIGHT FORM
          ================================================== */}

          <div className="p-6 sm:p-9 lg:p-10 xl:p-12">

            {/* Header */}

            <div className="mb-8">

              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-600">
                Create workspace
              </p>

              <h2 className="text-3xl font-bold tracking-[-0.03em] text-slate-900">
                Set up your agency
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Enter your business and admin details to get started.
              </p>

            </div>

            {/* =================================================
                FORM
            ================================================== */}

            <form
              onSubmit={submit}
              className="space-y-7"
            >

              {/* =================================================
                  AGENCY INFORMATION
              ================================================== */}

              <FormSection
                number="01"
                title="Agency information"
                description="Tell us about your business."
              >

                <div className="grid gap-5 sm:grid-cols-2">

                  <PremiumInput
                    label="Agency name"
                    placeholder="e.g. ABC Billing Agency"
                    value={f.agencyName}
                    onChange={(e) =>
                      set("agencyName", e.target.value)
                    }
                    icon={<BuildingIcon />}
                    required
                  />

                  <PremiumInput
                    label="Agency code"
                    placeholder="e.g. ABC001"
                    value={f.agencyCode}
                    onChange={(e) =>
                      set("agencyCode", e.target.value)
                    }
                    icon={<HashIcon />}
                    required
                  />

                </div>

              </FormSection>

              {/* =================================================
                  ADMIN INFORMATION
              ================================================== */}

              <FormSection
                number="02"
                title="Admin details"
                description="Create the primary administrator account."
              >

                <div className="grid gap-5 sm:grid-cols-2">

                  <PremiumInput
                    label="Admin name"
                    placeholder="Your full name"
                    value={f.name}
                    onChange={(e) =>
                      set("name", e.target.value)
                    }
                    icon={<UserIcon />}
                    required
                  />

                  <PremiumInput
                    label="Phone number"
                    placeholder="+91 98765 43210"
                    value={f.phone}
                    onChange={(e) =>
                      set("phone", e.target.value)
                    }
                    icon={<PhoneIcon />}
                  />

                  <PremiumInput
                    label="Email address"
                    type="email"
                    placeholder="you@company.com"
                    value={f.email}
                    onChange={(e) =>
                      set("email", e.target.value)
                    }
                    icon={<MailIcon />}
                    required
                  />

                  {/* PASSWORD */}

                  <div>

                    <label
                      htmlFor="password"
                      className="mb-2 block text-[13px] font-semibold text-slate-700"
                    >
                      Password
                    </label>

                    <div className="group relative">

                      <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-cyan-500">
                        <LockIcon />
                      </div>

                      <input
                        id="password"
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        value={f.password}
                        onChange={(e) =>
                          set("password", e.target.value)
                        }
                        placeholder="Create a password"
                        required
                        autoComplete="new-password"
                        className="h-[52px] w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-11 pr-12 text-[14px] font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10"
                      />

                      {/* Eye */}

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(
                            (prev) => !prev
                          )
                        }
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                        className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      >
                        {showPassword ? (
                          <EyeOffIcon />
                        ) : (
                          <EyeIcon />
                        )}
                      </button>

                    </div>

                    <p className="mt-2 text-[11px] text-slate-400">
                      Use at least 8 characters for a stronger password.
                    </p>

                  </div>

                  {/* ADDRESS */}

                  <div className="sm:col-span-2">

                    <label
                      htmlFor="address"
                      className="mb-2 block text-[13px] font-semibold text-slate-700"
                    >
                      Business address
                    </label>

                    <div className="group relative">

                      <div className="pointer-events-none absolute left-4 top-4 text-slate-400 transition-colors group-focus-within:text-cyan-500">
                        <LocationIcon />
                      </div>

                      <textarea
                        id="address"
                        value={f.address}
                        onChange={(e) =>
                          set("address", e.target.value)
                        }
                        placeholder="Enter your business address"
                        rows={3}
                        className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/60 py-3.5 pl-11 pr-4 text-[14px] font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10"
                      />

                    </div>

                  </div>

                </div>

              </FormSection>

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

              {/* SUBMIT */}

              <div className="border-t border-slate-100 pt-6">

                <Button
                  type="submit"
                  className="group h-[54px] w-full rounded-xl !bg-slate-900 !text-white shadow-[0_10px_25px_-10px_rgba(15,23,42,0.5)] transition-all duration-200 hover:-translate-y-[1px] hover:!bg-slate-800 hover:shadow-[0_15px_30px_-10px_rgba(15,23,42,0.45)] active:translate-y-0"
                >

                  <span className="flex items-center justify-center gap-2 text-[14px] font-semibold">

                    Create agency

                    <span className="text-lg transition-transform duration-200 group-hover:translate-x-1">
                      →
                    </span>

                  </span>

                </Button>

                <p className="mt-4 text-center text-[11px] leading-5 text-slate-400">
                  By creating an account, you agree to our{" "}
                  <span className="font-medium text-slate-500">
                    Terms of Service
                  </span>{" "}
                  and{" "}
                  <span className="font-medium text-slate-500">
                    Privacy Policy
                  </span>
                  .
                </p>

              </div>

            </form>

            {/* Mobile Login */}

            <div className="mt-7 border-t border-slate-100 pt-6 text-center sm:hidden">

              <span className="text-sm text-slate-500">
                Already registered?{" "}
              </span>

              <Link
                to="/login"
                className="font-semibold text-cyan-600"
              >
                Sign in
              </Link>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   FORM SECTION
========================================================= */

function FormSection({
  number,
  title,
  description,
  children,
}) {
  return (
    <section>

      <div className="mb-5 flex items-start gap-3">

        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-bold text-slate-500">
          {number}
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-900">
            {title}
          </h3>

          <p className="mt-0.5 text-xs text-slate-400">
            {description}
          </p>
        </div>

      </div>

      {children}

    </section>
  );
}

/* =========================================================
   PREMIUM INPUT
========================================================= */

function PremiumInput({
  label,
  icon,
  type = "text",
  ...props
}) {
  return (
    <div>

      <label className="mb-2 block text-[13px] font-semibold text-slate-700">
        {label}
      </label>

      <div className="group relative">

        <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-cyan-500">
          {icon}
        </div>

        <input
          type={type}
          {...props}
          className="h-[52px] w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-11 pr-4 text-[14px] font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10"
        />

      </div>

    </div>
  );
}

/* =========================================================
   BENEFIT
========================================================= */

function Benefit({
  icon,
  title,
  text,
}) {
  return (
    <div className="flex gap-3">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-sm font-bold text-cyan-400">
        {icon}
      </div>

      <div>
        <p className="text-sm font-semibold text-slate-200">
          {title}
        </p>

        <p className="mt-0.5 text-xs leading-5 text-slate-500">
          {text}
        </p>
      </div>

    </div>
  );
}

/* =========================================================
   ICONS
========================================================= */

function BuildingIcon() {
  return (
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
        d="M3 21h18"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 7h2M9 11h2M9 15h2M14 7h2M14 11h2M14 15h2"
      />
    </svg>
  );
}

function HashIcon() {
  return (
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
        d="M10 3L8 21M16 3l-2 18M4 9h16M3 15h16"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-[18px] w-[18px]"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="8" r="3.5" />

      <path
        strokeLinecap="round"
        d="M5 20a7 7 0 0114 0"
      />
    </svg>
  );
}

function MailIcon() {
  return (
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
  );
}

function PhoneIcon() {
  return (
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
        d="M6.5 3h3l1.5 4-2 1.5a14 14 0 006.5 6.5l1.5-2 4 1.5v3c0 1.1-.9 2-2 2C10.7 19.5 4.5 13.3 4.5 5c0-1.1.9-2 2-2z"
      />
    </svg>
  );
}

function LockIcon() {
  return (
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
  );
}

function LocationIcon() {
  return (
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
        d="M12 21s7-6.1 7-12a7 7 0 10-14 0c0 5.9 7 12 7 12z"
      />

      <circle
        cx="12"
        cy="9"
        r="2.2"
      />
    </svg>
  );
}

function EyeIcon() {
  return (
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
  );
}

function EyeOffIcon() {
  return (
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
  );
}
