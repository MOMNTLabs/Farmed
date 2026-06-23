import { clsx } from "clsx";

type BadgeProps = {
  children: React.ReactNode;
  tone?: "green" | "amber" | "red" | "slate";
};

export function Badge({ children, tone = "slate" }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
        tone === "green" && "bg-emerald-50 text-emerald-700",
        tone === "amber" && "bg-amber-50 text-amber-800",
        tone === "red" && "bg-red-50 text-red-700",
        tone === "slate" && "bg-slate-100 text-slate-700"
      )}
    >
      {children}
    </span>
  );
}
