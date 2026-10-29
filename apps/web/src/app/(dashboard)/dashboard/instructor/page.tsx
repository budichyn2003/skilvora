"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/axios";

type InstructorClass = {
  id: string;
  title: string;
  status: string;
  price: string | number;
  _count?: { enrollments?: number | null };
};

export default function InstructorDashboard() {
  const [classes, setClasses] = useState<InstructorClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get<InstructorClass[]>("/courses/instructor/my-classes")
      .then((res) => setClasses(res.data))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div
        aria-label="Memuat ringkasan kelas"
        className="h-48 animate-pulse border-y border-line bg-surface"
      />
    );
  }

  const totalStudents = classes.reduce(
    (acc, curr) => acc + (curr._count?.enrollments || 0),
    0,
  );
  const publishedCount = classes.filter((c) => c.status === "PUBLISHED").length;
  const draftCount = classes.filter((c) => c.status === "DRAFT").length;
  const metrics = [
    { label: "Kelas", value: classes.length },
    { label: "Siswa", value: totalStudents },
    { label: "Terbit", value: publishedCount },
    { label: "Draft", value: draftCount },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-14 pb-12">
      <header className="border-b border-line pb-8">
        <p className="mb-5 font-mono text-xs uppercase tracking-[0.16em] text-turbo">
          01 / Dasbor instruktur
        </p>
        <h1 className="max-w-4xl font-display text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
          Materi Anda. Progres siswa.
        </h1>
        <div className="mt-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-2xl leading-relaxed text-muted">
            Kelola kurikulum, perbarui materi, dan lihat jumlah siswa yang
            mengikuti kelas Anda.
          </p>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/dashboard/instructor/manage-classes">
              Kelola kelas <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </header>

      <section aria-label="Statistik kelas">
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.16em] text-subtle">
          02 / Ringkasan kelas
        </p>
        <dl className="grid grid-cols-2 divide-x divide-line border-y border-line sm:grid-cols-4">
          {metrics.map((metric, index) => (
            <div
              key={metric.label}
              className={`${index > 1 ? "border-t border-line sm:border-t-0" : ""} py-5 pr-3 ${index % 2 ? "pl-4 sm:pl-6" : "sm:pr-6"}`}
            >
              <dt className="font-mono text-xs uppercase tracking-wider text-subtle">
                {metric.label}
              </dt>
              <dd className="mt-2 font-display text-4xl tracking-tight">
                {metric.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <div className="mb-5">
          <p className="mb-2 font-mono text-xs uppercase tracking-[0.16em] text-turbo">
            03 / Kurikulum
          </p>
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Kelas yang dikelola
          </h2>
        </div>
        {classes.length === 0 ? (
          <div className="border-y border-line py-8">
            <p className="text-muted">Anda belum membuat kelas.</p>
            <Link
              href="/dashboard/instructor/manage-classes"
              className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-turbo"
            >
              Mulai membuat kelas <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <ol className="border-t border-line">
            {classes.map((cls, index) => (
              <li
                key={cls.id}
                className="grid gap-4 border-b border-line py-5 sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:items-center"
              >
                <span className="font-mono text-sm text-subtle">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <p className="font-mono text-xs uppercase tracking-wider text-muted">
                    {cls.status}{" "}
                    <span className="px-2 text-line-strong">/</span>
                    Rp {Number(cls.price).toLocaleString("id-ID")}
                  </p>
                  <h3 className="mt-1 truncate font-display text-xl font-medium">
                    {cls.title}
                  </h3>
                </div>
                <Button variant="ghost" asChild className="w-full sm:w-auto">
                  <Link href={`/dashboard/instructor/manage-classes/${cls.id}`}>
                    Kelola materi <ArrowRight size={16} aria-hidden="true" />
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
