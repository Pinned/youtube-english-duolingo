import Link from "next/link";
import clsx from "clsx";

export function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-zinc-50 text-zinc-900">
      <div className="mx-auto w-full max-w-4xl px-4 py-6">{children}</div>
    </div>
  );
}

export function TopNav() {
  return (
    <div className="mb-6 flex items-center justify-between">
      <Link href="/import" className="text-lg font-semibold tracking-tight">
        YED • MVP
      </Link>
      <div className="flex items-center gap-3 text-sm">
        <Link href="/courses" className="rounded-full px-3 py-1 hover:bg-zinc-200">
          Courses
        </Link>
      </div>
    </div>
  );
}

export function CardShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx("rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm", className)}>
      {children}
    </div>
  );
}

export function Pill({ children, tone }: { children: React.ReactNode; tone: "green" | "blue" | "zinc" }) {
  const cls =
    tone === "green"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : tone === "blue"
        ? "bg-sky-50 text-sky-700 border-sky-200"
        : "bg-zinc-50 text-zinc-700 border-zinc-200";
  return <span className={clsx("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium", cls)}>{children}</span>;
}

export function PrimaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={clsx(
        "inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 disabled:opacity-50",
        props.className,
      )}
    />
  );
}

export function SecondaryLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
    >
      {children}
    </Link>
  );
}
