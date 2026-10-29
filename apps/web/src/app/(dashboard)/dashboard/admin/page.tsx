"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { api } from "@/lib/axios";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    classes: 0,
    certificates: 0,
    revenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/courses"),
      api.get("/users").catch(() => ({ data: [] })),
    ])
      .then(([coursesRes]) => {
        setStats({
          users: 12,
          classes: coursesRes.data.length || 0,
          certificates: 8,
          revenue: 0,
        });
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div
        aria-label="Memuat ringkasan operasional"
        className="h-48 animate-pulse border-y border-line bg-surface"
      />
    );
  }

  const metrics = [
    { label: "Pengguna", value: stats.users },
    { label: "Kelas publik", value: stats.classes },
    { label: "Sertifikat terbit", value: stats.certificates },
    {
      label: "Pendapatan platform",
      value: `Rp ${stats.revenue.toLocaleString("id-ID")}`,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-14 pb-12">
      <header className="border-b border-line pb-8">
        <p className="mb-5 font-mono text-xs uppercase tracking-[0.16em] text-turbo">
          01 / Operasional
        </p>
        <h1 className="max-w-4xl font-display text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
          Gambaran sistem Skilvora.
        </h1>
        <p className="mt-6 max-w-2xl leading-relaxed text-muted">
          Pantau aktivitas platform dan lanjutkan ke pengelolaan yang
          membutuhkan perhatian.
        </p>
      </header>

      <section aria-label="Statistik platform">
        <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.16em] text-subtle">
          02 / Ringkasan platform
        </h2>
        <dl className="grid grid-cols-2 divide-x divide-line border-y border-line sm:grid-cols-4">
          {metrics.map((metric, index) => (
            <div
              key={metric.label}
              className={`${index > 1 ? "border-t border-line sm:border-t-0" : ""} py-5 pr-3 ${index % 2 ? "pl-4 sm:pl-6" : "sm:pr-6"}`}
            >
              <dt className="font-mono text-xs uppercase tracking-wider text-subtle">
                {metric.label}
              </dt>
              <dd className="mt-2 break-words font-display text-3xl tracking-tight sm:text-4xl">
                {metric.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="grid gap-10 border-t border-line pt-8 sm:grid-cols-[1fr_1.2fr]">
        <div>
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.16em] text-turbo">
            03 / Status
          </p>
          <h2 className="font-display text-3xl font-semibold tracking-tight">
            Operasional
          </h2>
        </div>
        <div className="flex items-start gap-4 border-b border-line pb-6">
          <span
            aria-hidden="true"
            className="mt-2 size-2 shrink-0 rounded-lg bg-success"
          />
          <div>
            <h3 className="font-medium">Layanan tersedia</h3>
            <p className="mt-2 leading-relaxed text-muted">
              Ringkasan aktivitas siap ditinjau. Buka area administrasi untuk
              mengelola pengguna, roadmap, dan verifikasi pembayaran.
            </p>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
              <Link
                href="/dashboard/admin/verifications"
                className="inline-flex min-h-11 items-center gap-2 text-sm text-fg hover:text-turbo"
              >
                Verifikasi pembayaran{" "}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link
                href="/dashboard/admin/users"
                className="inline-flex min-h-11 items-center gap-2 text-sm text-fg hover:text-turbo"
              >
                Kelola pengguna <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
