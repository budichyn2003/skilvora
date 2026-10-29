"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

const navigation = [
  { href: "/", label: "Beranda" },
  { href: "/courses", label: "Katalog kelas" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/verify", label: "Verifikasi sertifikat" },
];

export function PublicHeader() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === href : pathname.startsWith(href);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

  const links = (mobile = false) =>
    navigation.map(({ href, label }) => (
      <Link
        key={href}
        href={href}
        aria-current={isActive(href) ? "page" : undefined}
        onClick={() => setIsMenuOpen(false)}
        className={`items-center transition-colors hover:text-fg ${
          mobile
            ? `flex min-h-16 border-l-2 px-4 font-display text-2xl font-medium ${
                isActive(href)
                  ? "border-turbo bg-surface-2 text-fg"
                  : "border-transparent text-muted hover:bg-surface-2"
              }`
            : `relative flex min-h-11 px-1 text-sm font-medium text-muted after:absolute after:inset-x-1 after:-bottom-[1.35rem] after:h-px after:transition-colors ${
                isActive(href)
                  ? "text-fg after:bg-turbo"
                  : "after:bg-transparent"
              }`
        }`}
      >
        {label}
      </Link>
    ));

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="shrink-0 rounded-lg font-display text-xl font-bold tracking-tight text-fg"
          aria-label="Skilvora, beranda"
        >
          Skilvora<span className="text-turbo">.</span>
        </Link>

        <nav
          aria-label="Navigasi utama"
          className="hidden items-center gap-6 md:flex"
        >
          {links()}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/auth/login"
            className="inline-flex min-h-11 items-center px-3 text-sm font-semibold text-muted transition-colors hover:text-fg"
          >
            Masuk
          </Link>
          <Link
            href="/auth/register"
            className="hidden min-h-10 items-center border border-line-strong px-4 text-sm font-semibold text-fg transition-colors hover:border-turbo hover:bg-surface-2 sm:inline-flex"
          >
            Daftar
          </Link>
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center border border-line-strong text-fg transition-colors hover:border-turbo hover:bg-surface-2 md:hidden"
            aria-label={isMenuOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-primary-navigation"
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <nav
          id="mobile-primary-navigation"
          aria-label="Navigasi utama mobile"
          className="fixed inset-x-0 bottom-0 top-16 z-40 border-t border-line bg-bg px-6 py-10 md:hidden"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-2">
            {links(true)}
            <Link
              href="/auth/register"
              onClick={() => setIsMenuOpen(false)}
              className="mt-8 inline-flex min-h-12 items-center justify-center bg-turbo px-5 text-sm font-semibold text-ink hover:bg-turbo-hover"
            >
              Daftar akun
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
