"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";

type Course = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail: string | null;
  level: string;
  price: number | string;
  category?: { name: string; slug: string };
  _count?: { modules: number; enrollments: number };
};

const levelLabels: Record<string, string> = {
  BEGINNER: "Pemula",
  INTERMEDIATE: "Menengah",
  ADVANCED: "Lanjutan",
};

export function CourseCatalog({ courses }: { courses: Course[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");

  const categories = useMemo(
    () => [
      ...new Map(
        courses
          .filter((course) => course.category)
          .map((course) => [course.category!.slug, course.category!]),
      ).values(),
    ],
    [courses],
  );
  const filtered = courses.filter((course) => {
    const matchesText = `${course.title} ${course.description || ""}`
      .toLowerCase()
      .includes(query.trim().toLowerCase());
    return (
      matchesText &&
      (!category || course.category?.slug === category) &&
      (!level || course.level === level)
    );
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] py-14 sm:py-20">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <header className="mb-12 border-b border-line pb-8 sm:mb-16">
          <p className="mb-5 font-mono text-xs uppercase tracking-[0.16em] text-turbo">
            01 / Katalog pembelajaran
          </p>
          <h1 className="max-w-5xl font-display text-[clamp(3rem,8vw,7rem)] font-semibold leading-[0.95] tracking-[-0.05em]">
            Pilih keahlian <span className="text-turbo">berikutnya.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
            Materi bertahap untuk membangun keterampilan teknologi sesuai tujuan
            belajar Anda.
          </p>
        </header>

        <section
          aria-label="Filter katalog kelas"
          className="mb-8 grid gap-3 border-b border-line pb-6 sm:grid-cols-[minmax(0,1fr)_220px_200px]"
        >
          <label>
            <span className="mb-2 block font-mono text-xs uppercase tracking-wider text-subtle">
              Cari kelas
            </span>
            <input
              className="h-11 w-full rounded-lg border border-line bg-surface-2 px-4 text-sm text-fg placeholder:text-subtle transition-colors hover:border-line-strong focus-visible:border-turbo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turbo/40"
              type="search"
              placeholder="Contoh: JavaScript"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <label>
            <span className="mb-2 block font-mono text-xs uppercase tracking-wider text-subtle">
              Kategori
            </span>
            <select
              className="h-11 w-full rounded-lg border border-line bg-surface-2 px-4 text-sm text-fg transition-colors hover:border-line-strong focus-visible:border-turbo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turbo/40"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="">Semua kategori</option>
              {categories.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-2 block font-mono text-xs uppercase tracking-wider text-subtle">
              Level
            </span>
            <select
              className="h-11 w-full rounded-lg border border-line bg-surface-2 px-4 text-sm text-fg transition-colors hover:border-line-strong focus-visible:border-turbo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turbo/40"
              value={level}
              onChange={(event) => setLevel(event.target.value)}
            >
              <option value="">Semua level</option>
              <option value="BEGINNER">Pemula</option>
              <option value="INTERMEDIATE">Menengah</option>
              <option value="ADVANCED">Lanjutan</option>
            </select>
          </label>
        </section>

        <div className="mb-4 flex items-center justify-between font-mono text-xs uppercase tracking-wider text-subtle">
          <span>02 / Kelas tersedia</span>
          <span>{filtered.length} hasil</span>
        </div>

        {filtered.length === 0 ? (
          <div className="border-y border-line py-10">
            <h2 className="font-display text-2xl font-medium">
              Kelas tidak ditemukan
            </h2>
            <p className="mt-2 text-muted">
              Coba kata kunci atau filter yang lain.
            </p>
          </div>
        ) : (
          <ol className="border-t border-line">
            {filtered.map((course, index) => (
              <li
                key={course.id}
                className="grid gap-4 border-b border-line py-6 sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:items-center sm:gap-6 sm:py-7"
              >
                <span className="font-mono text-xs text-subtle">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="grid min-w-0 gap-4 sm:grid-cols-[minmax(0,1fr)_160px] sm:items-center">
                  <div className="min-w-0">
                    <p className="mb-2 font-mono text-xs uppercase tracking-wider text-muted">
                      {course.category?.name || "Umum"}{" "}
                      <span className="px-1 text-line-strong">/</span>{" "}
                      {levelLabels[course.level] || course.level}
                    </p>
                    <h2 className="truncate font-display text-xl font-medium tracking-tight sm:text-2xl">
                      {course.title}
                    </h2>
                    <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-relaxed text-muted">
                      {course.description ||
                        "Pelajari materi terstruktur bersama Skilvora."}
                    </p>
                    <p className="mt-3 font-mono text-xs text-subtle">
                      {course._count?.modules || 0} modul{" "}
                      <span className="px-1 text-line-strong">/</span>{" "}
                      {course._count?.enrollments || 0} siswa
                    </p>
                  </div>
                  {course.thumbnail && (
                    <div className="relative hidden aspect-video overflow-hidden border border-line bg-surface-2 sm:block">
                      <Image
                        src={course.thumbnail}
                        alt={`Sampul kelas ${course.title}`}
                        fill
                        unoptimized
                        sizes="160px"
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-line pt-4 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
                  <span className="font-medium tabular-nums">
                    {Number(course.price) === 0
                      ? "Gratis"
                      : `Rp ${Number(course.price).toLocaleString("id-ID")}`}
                  </span>
                  <Link
                    href={`/courses/${course.slug}`}
                    aria-label={`Lihat detail kelas ${course.title}`}
                    className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-fg transition-colors hover:text-turbo"
                  >
                    Detail <ArrowRight aria-hidden="true" size={16} />
                  </Link>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
