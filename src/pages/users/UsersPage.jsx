import { useMemo, useState } from "react";
import {
  Users,
  UserPlus,
  Search,
  ShieldCheck,
  Mail,
  X,
  CheckCircle2,
  Loader2,
  UserRound,
} from "lucide-react";

import { userService } from "../../services/user.service";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";

export default function UsersPage() {
  const { user } = useAuth();

  const {
    data: apiData,
    loading,
    reload,
  } = useApi(userService.list, []);

  const data = Array.isArray(apiData) ? apiData : [];

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const [f, setF] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
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
      email: "",
      password: "",
      role: "USER",
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

      await userService.create({
        name: f.name.trim(),
        email: f.email.trim(),
        password: f.password,
        role: f.role,
      });

      closeModal();
      reload();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to create user",
      );
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return data;

    return data.filter((item) =>
      [
        item.name,
        item.email,
        item.role,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(query),
        ),
    );
  }, [data, search]);

  const activeUsers = data.filter(
    (item) => item.active,
  ).length;

  const disabledUsers = data.filter(
    (item) => !item.active,
  ).length;

  const adminUsers = data.filter(
    (item) => item.role === "ADMIN",
  ).length;

  const canCreateUser = user?.role === "ADMIN";

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">

        {/* Header */}
        <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              <Users size={14} />
              Team management
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Users
            </h1>

            <p className="mt-1.5 max-w-2xl text-sm text-slate-500">
              Manage agency accounts, roles and access permissions.
            </p>
          </div>

          {canCreateUser && (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md"
            >
              <UserPlus size={17} />
              Add user
            </button>
          )}
        </div>

        {/* Account Limit */}
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <ShieldCheck size={17} />
            </div>

            <div>
              <p className="text-sm font-bold text-blue-900">
                Agency user limit
              </p>

              <p className="mt-0.5 text-xs text-blue-700">
                Maximum 5 active or inactive accounts per agency.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-blue-600">
              {data.length} / 5 accounts
            </span>

            <div className="h-2 w-20 overflow-hidden rounded-full bg-blue-100">
              <div
                className="h-full rounded-full bg-blue-600 transition-all"
                style={{
                  width: `${Math.min(
                    (data.length / 5) * 100,
                    100,
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <UserStat
            icon={Users}
            label="Total users"
            value={data.length}
            description="Agency accounts"
          />

          <UserStat
            icon={CheckCircle2}
            label="Active"
            value={activeUsers}
            description="Currently enabled"
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <UserStat
            icon={UserRound}
            label="Admins"
            value={adminUsers}
            description="Administrator accounts"
            iconClass="bg-violet-50 text-violet-600"
          />

          <UserStat
            icon={ShieldCheck}
            label="Disabled"
            value={disabledUsers}
            description="Inactive accounts"
            iconClass="bg-amber-50 text-amber-600"
          />
        </div>

        {/* Users List */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Toolbar */}
          <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Team directory
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                {filteredUsers.length} user
                {filteredUsers.length !== 1 ? "s" : ""} shown
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
                placeholder="Search name, email or role..."
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

          {/* Content */}
          {loading ? (
            <UsersSkeleton />
          ) : filteredUsers.length === 0 ? (
            <EmptyUsers
              hasSearch={Boolean(search)}
              canCreate={canCreateUser}
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
                        User
                      </th>

                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Email
                      </th>

                      <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Role
                      </th>

                      <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((item) => (
                      <tr
                        key={item._id}
                        className="transition hover:bg-slate-50/70"
                      >
                        {/* User */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar name={item.name} />

                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-slate-900">
                                {item.name || "Unnamed user"}
                              </p>

                              <p className="mt-0.5 text-xs text-slate-400">
                                Agency account
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Mail
                              size={14}
                              className="shrink-0 text-slate-400"
                            />

                            <span className="truncate">
                              {item.email}
                            </span>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-4 py-4 text-center">
                          <RoleBadge role={item.role} />
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 text-right">
                          <StatusBadge active={item.active} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="divide-y divide-slate-100 md:hidden">
                {filteredUsers.map((item) => (
                  <div
                    key={item._id}
                    className="p-4"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar name={item.name} />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-bold text-slate-900">
                              {item.name || "Unnamed user"}
                            </h3>

                            <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-slate-500">
                              <Mail size={12} />
                              {item.email}
                            </p>
                          </div>

                          <StatusBadge active={item.active} />
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <RoleBadge role={item.role} />

                          <span className="text-[10px] font-medium text-slate-400">
                            Agency account
                          </span>
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

      {/* Create User Modal */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <UserPlus size={17} />
                  </div>

                  <h2 className="text-lg font-bold text-slate-900">
                    Create agency user
                  </h2>
                </div>

                <p className="mt-1 pl-11 text-xs text-slate-500">
                  Add an account to your agency team.
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
                  label="Full name"
                  required
                  value={f.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="e.g. Arun Kumar"
                  icon={UserRound}
                />

                <Field
                  label="Email address"
                  required
                  type="email"
                  value={f.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="name@company.com"
                  icon={Mail}
                />

                <Field
                  label="Password"
                  required
                  type="password"
                  value={f.password}
                  onChange={(e) =>
                    set("password", e.target.value)
                  }
                  placeholder="Create a secure password"
                  icon={ShieldCheck}
                />

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Role
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <RoleOption
                      value="USER"
                      selected={f.role === "USER"}
                      title="User"
                      description="Standard access"
                      icon={UserRound}
                      onClick={() => set("role", "USER")}
                    />

                    <RoleOption
                      value="ADMIN"
                      selected={f.role === "ADMIN"}
                      title="Admin"
                      description="Full agency access"
                      icon={ShieldCheck}
                      onClick={() => set("role", "ADMIN")}
                    />
                  </div>
                </div>

                <div className="flex items-start gap-2 rounded-xl bg-blue-50 p-3.5 text-xs leading-5 text-blue-700">
                  <CheckCircle2
                    size={15}
                    className="mt-0.5 shrink-0"
                  />

                  <span>
                    The new account will be added to this agency and
                    can sign in immediately after creation.
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
                      Creating...
                    </>
                  ) : (
                    <>
                      <UserPlus size={16} />
                      Create user
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

function UserStat({
  icon: Icon,
  label,
  value,
  description,
  iconClass = "bg-blue-50 text-blue-600",
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

        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={17} />
        </div>
      </div>
    </div>
  );
}

function Avatar({ name }) {
  const initials = String(name || "U")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xs font-extrabold text-blue-600">
      {initials || "U"}
    </div>
  );
}

function RoleBadge({ role }) {
  const isAdmin = role === "ADMIN";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${
        isAdmin
          ? "bg-violet-50 text-violet-600"
          : "bg-slate-100 text-slate-600"
      }`}
    >
      {isAdmin ? (
        <ShieldCheck size={11} />
      ) : (
        <UserRound size={11} />
      )}

      {isAdmin ? "Admin" : "User"}
    </span>
  );
}

function StatusBadge({ active }) {
  return active ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
      Disabled
    </span>
  );
}

function RoleOption({
  selected,
  title,
  description,
  icon: Icon,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
        selected
          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/10"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
          selected
            ? "bg-blue-100 text-blue-600"
            : "bg-slate-100 text-slate-500"
        }`}
      >
        <Icon size={16} />
      </div>

      <div className="min-w-0">
        <p
          className={`text-xs font-bold ${
            selected
              ? "text-blue-700"
              : "text-slate-800"
          }`}
        >
          {title}
        </p>

        <p className="mt-0.5 text-[10px] text-slate-400">
          {description}
        </p>
      </div>
    </button>
  );
}

function Field({
  label,
  required,
  icon: Icon,
  ...props
}) {
  return (
    <div>
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

        <input
          {...props}
          required={required}
          className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
        />
      </div>
    </div>
  );
}

function EmptyUsers({
  hasSearch,
  canCreate,
  onAdd,
}) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        {hasSearch ? (
          <Search size={24} />
        ) : (
          <Users size={24} />
        )}
      </div>

      <h3 className="mt-4 text-sm font-bold text-slate-900">
        {hasSearch
          ? "No users found"
          : "No agency users yet"}
      </h3>

      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
        {hasSearch
          ? "Try searching with a different name, email or role."
          : "Add your first team member to start managing agency access."}
      </p>

      {!hasSearch && canCreate && (
        <button
          type="button"
          onClick={onAdd}
          className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white transition hover:bg-blue-700"
        >
          <UserPlus size={15} />
          Add user
        </button>
      )}
    </div>
  );
}

function UsersSkeleton() {
  return (
    <div className="divide-y divide-slate-100">
      {[1, 2, 3, 4, 5].map((item) => (
        <div
          key={item}
          className="flex animate-pulse items-center gap-4 px-6 py-5"
        >
          <div className="h-10 w-10 rounded-xl bg-slate-100" />

          <div className="flex-1 space-y-2">
            <div className="h-3 w-36 rounded bg-slate-100" />
            <div className="h-2.5 w-48 rounded bg-slate-100" />
          </div>

          <div className="hidden h-5 w-16 rounded-full bg-slate-100 md:block" />
          <div className="h-5 w-16 rounded-full bg-slate-100" />
        </div>
      ))}
    </div>
  );
}