"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InstructorService } from "@/services/instructor.service";

type InstructorClass = {
  id: string;
  title: string;
  status: string;
  _count?: { modules?: number | null; enrollments?: number | null };
};

export default function ManageClassesPage() {
  const [classes, setClasses] = useState<InstructorClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    InstructorService.getMyClasses()
      .then(setClasses)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="mx-auto w-full max-w-6xl">
      <header className="mb-12 border-b border-line pb-8">
        <p className="mb-5 font-mono text-xs uppercase tracking-[0.16em] text-turbo">
          01 / Ruang instruktur
        </p>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-6xl">
              Manajemen kelas
            </h1>
            <p className="mt-4 max-w-2xl leading-relaxed text-muted">
              Perbarui materi, susun evaluasi, dan pantau siswa yang mengikuti
              kelas Anda.
            </p>
          </div>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/dashboard/instructor/manage-classes/create">
              Buat kelas <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </header>

      <section>
        <div className="mb-4 flex items-center justify-between font-mono text-xs uppercase tracking-wider text-subtle">
          <h2>02 / Kurikulum</h2>
          <span>{classes.length} kelas</span>
        </div>

        {isLoading ? (
          <div
            aria-label="Memuat kelas"
            className="h-48 animate-pulse border-y border-line bg-surface"
          />
        ) : classes.length === 0 ? (
          <div className="border-y border-line py-8">
            <h3 className="font-display text-2xl font-medium">
              Belum ada kelas
            </h3>
            <p className="mt-2 max-w-xl leading-relaxed text-muted">
              Mulai bagikan keahlian Anda dengan membuat kelas dan menambahkan
              materi.
            </p>
            <Link
              href="/dashboard/instructor/manage-classes/create"
              className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-turbo"
            >
              Buat kelas pertama <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <ol className="border-t border-line">
            {classes.map((course, index) => (
              <li
                key={course.id}
                className="grid gap-4 border-b border-line py-5 sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:items-center sm:gap-6"
              >
                <span className="font-mono text-sm text-subtle">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <p className="font-mono text-xs uppercase tracking-wider text-muted">
                    {course.status}{" "}
                    <span className="px-1 text-line-strong">/</span>{" "}
                    {course._count?.modules || 0} modul{" "}
                    <span className="px-1 text-line-strong">/</span>{" "}
                    {course._count?.enrollments || 0} siswa
                  </p>
                  <h3 className="mt-1 truncate font-display text-xl font-medium">
                    {course.title}
                  </h3>
                </div>
                <Button variant="ghost" asChild className="w-full sm:w-auto">
                  <Link
                    href={`/dashboard/instructor/manage-classes/${course.id}`}
                  >
                    Kelola konten <ArrowRight size={16} aria-hidden="true" />
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
