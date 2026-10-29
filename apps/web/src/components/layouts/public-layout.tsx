import React from "react";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { PublicHeader } from "@/components/layouts/public-header";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-bg text-fg">
      <PublicHeader />
      <main className="flex-1">{children}</main>

      <footer className="mt-auto border-t border-line bg-surface py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p
            aria-hidden="true"
            className="mb-10 border-b border-line pb-6 font-display text-[clamp(4rem,14vw,12rem)] font-semibold leading-[0.85] tracking-[-0.07em]"
          >
            Skilvora<span className="text-turbo">.</span>
          </p>
          <div className="mb-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
            <div className="space-y-4">
              <Link
                href="/"
                className="inline-flex min-h-11 items-center font-display text-2xl font-bold tracking-tight text-fg"
              >
                Skilvora<span className="text-turbo">.</span>
              </Link>
              <p className="max-w-xs text-sm leading-relaxed text-muted">
                Platform belajar teknologi dengan jalur belajar terarah untuk
                membangun keterampilan digital yang siap digunakan.
              </p>
            </div>
            <div>
              <h2 className="mb-4 font-mono text-xs uppercase tracking-wider text-fg">
                Jelajahi
              </h2>
              <ul className="space-y-2.5 text-sm text-muted">
                <li>
                  <Link
                    className="inline-flex min-h-11 items-center transition-colors hover:text-fg"
                    href="/courses"
                  >
                    Katalog kelas
                  </Link>
                </li>
                <li>
                  <Link
                    className="inline-flex min-h-11 items-center transition-colors hover:text-fg"
                    href="/roadmap"
                  >
                    Roadmap belajar
                  </Link>
                </li>
                <li>
                  <Link
                    className="inline-flex min-h-11 items-center transition-colors hover:text-fg"
                    href="/verify"
                  >
                    Verifikasi sertifikat
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="mb-4 font-mono text-xs uppercase tracking-wider text-fg">
                Akun
              </h2>
              <ul className="space-y-2.5 text-sm text-muted">
                <li>
                  <Link
                    className="inline-flex min-h-11 items-center transition-colors hover:text-fg"
                    href="/auth/login"
                  >
                    Masuk
                  </Link>
                </li>
                <li>
                  <Link
                    className="inline-flex min-h-11 items-center transition-colors hover:text-fg"
                    href="/auth/register"
                  >
                    Daftar akun
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="mb-4 font-mono text-xs uppercase tracking-wider text-fg">
                Hubungi kami
              </h2>
              <ul className="space-y-3 text-sm text-muted">
                <li className="flex items-center gap-3">
                  <Mail
                    aria-hidden="true"
                    className="size-4 shrink-0 text-subtle"
                  />
                  support@skilvora.com
                </li>
                <li className="flex items-center gap-3">
                  <Phone
                    aria-hidden="true"
                    className="size-4 shrink-0 text-subtle"
                  />
                  +62 811 2233 4455
                </li>
                <li className="flex items-start gap-3">
                  <MapPin
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-subtle"
                  />
                  Jakarta Selatan, Indonesia
                </li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col gap-2 border-t border-line pt-6 text-xs text-subtle sm:flex-row sm:items-center sm:justify-between">
            <p>
              &copy; {new Date().getFullYear()} Skilvora. Hak Cipta Dilindungi.
            </p>
            <p>Dibuat untuk mendukung perjalanan belajar teknologi.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
