import Link from "next/link";
import type { ReactNode } from "react";

export function Button({ href, children, variant = "primary" }: { href: string; children: ReactNode; variant?: "primary" | "secondary" }) {
  const className =
    variant === "primary"
      ? "bg-brand text-white hover:bg-brand-dark"
      : "border border-brand/20 bg-white text-brand-dark hover:border-brand";
  return (
    <Link className={`inline-flex min-h-11 items-center justify-center rounded px-4 py-2 text-sm font-semibold transition ${className}`} href={href}>
      {children}
    </Link>
  );
}
