import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export function Button({
  className, variant = "primary", size = "md", loading, disabled, children, ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
        variant === "primary" && "bg-gradient-to-br from-brand-dark to-brand text-white shadow-lg shadow-brand/25 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand/30 active:translate-y-0",
        variant === "secondary" && "bg-bg3 text-fg border border-border hover:border-brand/40 hover:bg-brand/10",
        variant === "ghost" && "text-fg3 hover:text-fg hover:bg-bg3",
        size === "sm" && "text-sm px-4 py-2",
        size === "md" && "text-sm px-5 py-2.5",
        size === "lg" && "text-base px-7 py-3",
        (disabled || loading) && "opacity-50 cursor-not-allowed transform-none",
        className
      )}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
