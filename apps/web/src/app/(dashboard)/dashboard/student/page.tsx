"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/axios";

type StudentEnrollment = {
  id: string;
  status: string;
  classId: string;
  class?: { title?: string; description?: string | null };
  progressPercent?: number | null;
};

type StudentCertificate = { id: string };

export default function StudentDashboard() {
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([]);
  const [certificates, setCertificates] = useState<StudentCertificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    Promise.all([
      api.get<StudentEnrollment[]>("/enrollments/my"),
      api.get<StudentCertificate[]>("/enrollments/certificates/me"),
    ])
      .then(([enrollRes, certRes]) => {
        setEnrollments(enrollRes.data);
        setCertificates(certRes.data);
      })
      .catch((error) => {
        setLoadError(
          error.response?.data?.message ||
            "Gagal memuat ringkasan belajar. Coba muat ulang halaman.",
        );
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div
        aria-label="Memuat ringkasan belajar"
        className="h-48 animate-pulse border-y border-line bg-surface"
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-14 pb-12">
      <header className="border-b border-line pb-8">
        <p className="mb-5 font-mono text-xs uppercase tracking-[0.16em] text-turbo">
          01 / Dasbor siswa
        </p>
        <h1 className="max-w-4xl font-display text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
          Lanjutkan perjalanan belajar Anda.
        </h1>
        <div className="mt-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-2xl leading-relaxed text-muted">
            Pantau kelas, lanjutkan modul, dan kumpulkan sertifikat keahlian
            dari satu tempat.
          </p>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/courses">
              Jelajahi kelas <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </header>

      <section aria-label="Ringkasan aktivitas">
        <div className="grid grid-cols-2 divide-x divide-line border-y border-line sm:grid-cols-3">
          <div className="py-5 pr-4 sm:py-6">
            <p className="font-mono text-xs uppercase tracking-wider text-subtle">
              Kelas terdaftar
            </p>
            <p className="mt-2 font-display text-4xl tracking-tight">
              {enrollments.length}
            </p>
          </div>
          <div className="px-4 py-5 sm:px-6 sm:py-6">
            <p className="font-mono text-xs uppercase tracking-wider text-subtle">
              Sertifikat diraih
            </p>
            <p className="mt-2 font-display text-4xl tracking-tight">
              {certificates.length}
            </p>
          </div>
          <div className="col-span-2 border-t border-line py-5 sm:col-span-1 sm:border-t-0 sm:pl-6 sm:py-6">
            <p className="font-mono text-xs uppercase tracking-wider text-subtle">
              Status akun
            </p>
            <p className="mt-2 font-display text-2xl text-success">Aktif</p>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 font-mono text-xs uppercase tracking-[0.16em] text-turbo">
              02 / Aktivitas
            </p>
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Kelas Anda
            </h2>
          </div>
          <Link
            href="/dashboard/student/classes"
            className="inline-flex min-h-11 items-center gap-2 text-sm text-muted transition-colors hover:text-turbo"
          >
            Semua kelas <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>

        {loadError ? (
          <div
            role="alert"
            className="border-y border-danger/40 py-6 text-danger"
          >
            {loadError}
          </div>
        ) : enrollments.length === 0 ? (
          <div className="border-y border-line py-8">
            <p className="text-muted">
              Anda belum terdaftar di kelas mana pun.
            </p>
            <Link
              href="/courses"
              className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-turbo"
            >
              Pilih kelas pertama <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <ol className="border-t border-line">
            {enrollments.map((enr, index) => (
              <li
                key={enr.id}
                className="grid gap-5 border-b border-line py-5 sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:items-center"
              >
                <span className="font-mono text-sm text-subtle">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <p className="font-mono text-xs uppercase tracking-wider text-muted">
                    {enr.status}
                  </p>
                  <h3 className="mt-1 truncate font-display text-xl font-medium">
                    {enr.class?.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">
                    {enr.class?.description}
                  </p>
                  {enr.status === "ACTIVE" && (
                    <div className="mt-4 max-w-md">
                      <div className="mb-2 flex justify-between font-mono text-xs text-muted">
                        <span>Progres kelas</span>
                        <span>{enr.progressPercent ?? 0}%</span>
                      </div>
                      <div className="h-1 overflow-hidden bg-surface-3">
                        <div
                          className="h-full bg-turbo"
                          style={{ width: `${enr.progressPercent ?? 0}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <Button asChild variant="ghost" className="w-full sm:w-auto">
                  <Link
                    href={
                      enr.status === "ACTIVE"
                        ? `/dashboard/student/learn/${enr.classId}`
                        : "/dashboard/student/payments"
                    }
                  >
                    {enr.status === "ACTIVE"
                      ? "Lanjut belajar"
                      : "Selesaikan pembayaran"}
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </Button>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
