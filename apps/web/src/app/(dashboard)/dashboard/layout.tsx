"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

type Role = "STUDENT" | "INSTRUCTOR" | "ADMIN";

const navigation: Record<Role, { href: string; label: string }[]> = {
  STUDENT: [
    { href: "/dashboard/student", label: "Ringkasan" },
    { href: "/dashboard/student/classes", label: "Kelas saya" },
    { href: "/dashboard/student/certificates", label: "Sertifikat" },
    { href: "/dashboard/student/payments", label: "Pembayaran" },
  ],
  INSTRUCTOR: [
    { href: "/dashboard/instructor", label: "Ringkasan" },
    { href: "/dashboard/instructor/manage-classes", label: "Kelola kelas" },
    { href: "/dashboard/instructor/statistics", label: "Pendapatan" },
  ],
  ADMIN: [
    { href: "/dashboard/admin", label: "Ringkasan" },
    { href: "/dashboard/admin/roadmap", label: "Roadmap" },
    { href: "/dashboard/admin/verifications", label: "Verifikasi" },
    { href: "/dashboard/admin/users", label: "Pengguna" },
    { href: "/dashboard/admin/certificates", label: "Sertifikat" },
  ],
};

type DashboardUser = {
  role?: Role;
  name?: string;
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<DashboardUser | null>(null);

  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => {
        router.push("/auth/login");
      });
  }, [router]);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      toast.error(
        "Sesi server tidak dapat diakhiri. Token lokal tetap dihapus.",
      );
    } finally {
      Cookies.remove("token");
      router.replace("/auth/login");
      router.refresh();
    }
  };

  const items = user?.role ? navigation[user.role] : [];
  const isActive = (href: string) =>
    pathname === href ||
    (href !== "/dashboard/student" && pathname.startsWith(`${href}/`));

  return (
    <div className="min-h-screen bg-bg text-fg md:grid md:grid-cols-[248px_minmax(0,1fr)]">
      <aside className="hidden border-r border-line bg-surface md:sticky md:top-0 md:flex md:h-screen md:flex-col">
        <div className="border-b border-line px-6 py-6">
          <Link
            href="/"
            className="font-display text-xl font-bold tracking-tight text-fg"
          >
            Skilvora<span className="text-turbo">.</span>
          </Link>
          <p className="mt-8 font-mono text-xs uppercase tracking-[0.16em] text-subtle">
            {user?.role ?? "Memuat akun"}
          </p>
          <p className="mt-1 truncate text-sm text-muted">{user?.name ?? ""}</p>
        </div>
        <nav
          aria-label="Navigasi dasbor"
          className="flex-1 space-y-1 px-4 py-6"
        >
          {items.map(({ href, label }, index) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
              className={`flex min-h-11 items-center gap-3 border-l-2 px-3 text-sm transition-colors ${
                isActive(href)
                  ? "border-turbo bg-surface-2 text-fg"
                  : "border-transparent text-muted hover:bg-surface-2 hover:text-fg"
              }`}
            >
              <span className="font-mono text-xs text-subtle">
                {String(index + 1).padStart(2, "0")}
              </span>
              {label}
            </Link>
          ))}
          <Link
            href="/dashboard/profile"
            aria-current={
              pathname.startsWith("/dashboard/profile") ? "page" : undefined
            }
            className={`mt-6 flex min-h-11 items-center gap-3 border-t border-line px-3 pt-4 text-sm transition-colors ${
              pathname.startsWith("/dashboard/profile")
                ? "text-turbo"
                : "text-muted hover:text-fg"
            }`}
          >
            <span className="font-mono text-xs text-subtle">+</span>
            Pengaturan profil
          </Link>
        </nav>
        <div className="border-t border-line p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="min-h-11 w-full px-3 text-left text-sm text-muted transition-colors hover:text-danger"
          >
            Keluar dari akun
          </button>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="border-b border-line bg-bg px-4 py-3 md:hidden">
          <div className="flex items-center justify-between">
            <Link href="/" className="font-display text-lg font-bold text-fg">
              Skilvora<span className="text-turbo">.</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="min-h-10 px-2 text-sm text-muted"
            >
              Keluar
            </button>
          </div>
          <nav
            aria-label="Navigasi dasbor"
            className="-mx-1 mt-3 flex gap-1 overflow-x-auto pb-1"
          >
            {items.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                aria-current={isActive(href) ? "page" : undefined}
                className={`shrink-0 border-b-2 px-3 py-2 text-sm ${
                  isActive(href)
                    ? "border-turbo text-fg"
                    : "border-transparent text-muted"
                }`}
              >
                {label}
              </Link>
            ))}
            <Link
              href="/dashboard/profile"
              className="shrink-0 px-3 py-2 text-sm text-muted"
            >
              Profil
            </Link>
          </nav>
        </header>
        <main className="mx-auto min-h-screen w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
          {children}
        </main>
      </div>
    </div>
  );
}
