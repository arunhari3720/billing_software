export default function Button({
  children,
  variant = "primary",
  className = "",
  ...p
}) {
  return (
    <button
      className={`btn ${variant === "primary" ? "btn-primary" : variant === "danger" ? "btn-danger" : "btn-secondary"} ${className}`}
      {...p}
    >
      {children}
    </button>
  );
}
