"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AuthService, UserProfile } from "@/services/auth.service";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setUser(await AuthService.getProfile());
      } catch {
        Cookies.remove("token");
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

  const logout = async () => {
    try {
      await AuthService.logout();
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg text-muted">
        Memuat dasbor...
      </div>
    );
  }

  const homeRoute =
    user?.role === "STUDENT"
      ? "/dashboard/student"
      : user?.role === "INSTRUCTOR"
        ? "/dashboard/instructor"
        : "/dashboard/admin";
  const links =
    user?.role === "STUDENT"
      ? [
          { href: homeRoute, label: "Ringkasan" },
          { href: "/dashboard/student/classes", label: "Kelas saya" },
          { href: "/dashboard/student/certificates", label: "Sertifikat" },
        ]
      : user?.role === "INSTRUCTOR"
        ? [
            { href: homeRoute, label: "Ringkasan" },
            {
              href: "/dashboard/instructor/manage-classes",
              label: "Kelola kelas",
            },
            { href: "/dashboard/instructor/statistics", label: "Pendapatan" },
          ]
        : [
            { href: homeRoute, label: "Ringkasan" },
            { href: "/dashboard/admin/roadmap", label: "Roadmap" },
            { href: "/dashboard/admin/verifications", label: "Verifikasi" },
            { href: "/dashboard/admin/users", label: "Pengguna" },
          ];
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="min-h-screen bg-bg text-fg md:grid md:grid-cols-[248px_minmax(0,1fr)]">
      <aside className="hidden border-r border-line bg-surface md:flex md:flex-col">
        <div className="border-b border-line px-6 py-6">
          <Link
            href="/"
            className="font-display text-xl font-bold tracking-tight"
          >
            Skilvora<span className="text-turbo">.</span>
          </Link>
          <p className="mt-8 font-mono text-xs uppercase tracking-wider text-subtle">
            {user?.role}
          </p>
          <p className="mt-1 truncate text-sm text-muted">{user?.name}</p>
        </div>
        <nav
          aria-label="Navigasi dasbor"
          className="flex-1 space-y-1 px-4 py-6"
        >
          {links.map(({ href, label }, index) => (
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
            className="mt-6 flex min-h-11 items-center border-t border-line px-3 pt-4 text-sm text-muted hover:text-fg"
          >
            Pengaturan profil
          </Link>
        </nav>
        <div className="border-t border-line p-4">
          <button
            type="button"
            onClick={logout}
            className="min-h-11 w-full px-3 text-left text-sm text-muted transition-colors hover:text-danger"
          >
            Keluar dari akun
          </button>
        </div>
      </aside>
      <main className="min-w-0 px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
        {children}
      </main>
    </div>
  );
}
