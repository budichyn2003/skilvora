"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, ChevronLeft, ChevronRight, Search } from "lucide-react";

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

type Meta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type Category = { id: string; name: string; slug: string };

type CatalogPayload = {
  data: Course[];
  meta: Meta;
  categories: Category[];
};

const levelLabels: Record<string, string> = {
  BEGINNER: "Pemula",
  INTERMEDIATE: "Menengah",
  ADVANCED: "Lanjutan",
};

export function CourseCatalog({ payload }: { payload: CatalogPayload }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  // Local state untuk debounce search
  const [localQuery, setLocalQuery] = useState(
    searchParams.get("search") ?? "",
  );

  // Build URL dengan search params baru
  const buildUrl = useCallback(
    (params: Record<string, string | undefined>) => {
      const current = new URLSearchParams(searchParams.toString());
      Object.entries(params).forEach(([key, value]) => {
        if (value) current.set(key, value);
        else current.delete(key);
      });
      // Reset ke halaman 1 jika filter berubah (bukan page change)
      return `${pathname}?${current.toString()}`;
    },
    [pathname, searchParams],
  );

  const handleFilterChange = useCallback(
    (params: Record<string, string | undefined>) => {
      const newParams = { ...params, page: undefined }; // reset page
      startTransition(() => {
        router.push(buildUrl(newParams), { scroll: false });
      });
    },
    [buildUrl, router],
  );

  // Debounce search input — tunggu 450ms sebelum push ke URL
  useEffect(() => {
    const id = setTimeout(() => {
      const current = searchParams.get("search") ?? "";
      if (localQuery !== current) {
        handleFilterChange({ search: localQuery || undefined });
      }
    }, 450);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localQuery]);

  const { data: courses, meta, categories } = payload;
  const currentCategory = searchParams.get("category") ?? "";
  const currentLevel = searchParams.get("level") ?? "";
  const currentPage = meta.page;

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

        {/* Filter bar */}
        <section
          aria-label="Filter katalog kelas"
          className="mb-8 grid gap-3 border-b border-line pb-6 sm:grid-cols-[minmax(0,1fr)_220px_200px]"
        >
          <label>
            <span className="mb-2 block font-mono text-xs uppercase tracking-wider text-subtle">
              Cari kelas
            </span>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
              <input
                className="h-11 w-full rounded-lg border border-line bg-surface-2 pl-9 pr-4 text-sm text-fg placeholder:text-subtle transition-colors hover:border-line-strong focus-visible:border-turbo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turbo/40"
                type="search"
                placeholder="Contoh: JavaScript"
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
              />
            </div>
          </label>
          <label>
            <span className="mb-2 block font-mono text-xs uppercase tracking-wider text-subtle">
              Kategori
            </span>
            <select
              className="h-11 w-full rounded-lg border border-line bg-surface-2 px-4 text-sm text-fg transition-colors hover:border-line-strong focus-visible:border-turbo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turbo/40"
              value={currentCategory}
              onChange={(e) =>
                handleFilterChange({
                  category: e.target.value || undefined,
                })
              }
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
              value={currentLevel}
              onChange={(e) =>
                handleFilterChange({ level: e.target.value || undefined })
              }
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
          <span>
            {meta.total} hasil (hal. {currentPage}/{meta.totalPages})
          </span>
        </div>

        {courses.length === 0 ? (
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
            {courses.map((course, index) => (
              <li
                key={course.id}
                className="grid gap-4 border-b border-line py-6 sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:items-center sm:gap-6 sm:py-7"
              >
                <span className="font-mono text-xs text-subtle">
                  {String((currentPage - 1) * meta.limit + index + 1).padStart(
                    2,
                    "0",
                  )}
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

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() =>
                startTransition(() => {
                  router.push(
                    buildUrl({ page: String(currentPage - 1) }),
                    { scroll: true },
                  );
                })
              }
              disabled={currentPage <= 1}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-surface-2 text-muted transition-colors hover:border-line-strong hover:text-fg disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Halaman sebelumnya"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 ||
                  p === meta.totalPages ||
                  Math.abs(p - currentPage) <= 1,
              )
              .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
                acc.push(p);
                return acc;
              }, [])
              .map((item, idx) =>
                item === "…" ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-1 font-mono text-xs text-subtle"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    onClick={() =>
                      startTransition(() => {
                        router.push(buildUrl({ page: String(item) }), {
                          scroll: true,
                        });
                      })
                    }
                    className={`flex h-10 w-10 items-center justify-center rounded-lg border font-mono text-xs transition-colors ${
                      item === currentPage
                        ? "border-turbo bg-turbo text-ink font-bold"
                        : "border-line bg-surface-2 text-muted hover:border-line-strong hover:text-fg"
                    }`}
                    aria-current={item === currentPage ? "page" : undefined}
                  >
                    {item}
                  </button>
                ),
              )}

            <button
              onClick={() =>
                startTransition(() => {
                  router.push(
                    buildUrl({ page: String(currentPage + 1) }),
                    { scroll: true },
                  );
                })
              }
              disabled={currentPage >= meta.totalPages}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-surface-2 text-muted transition-colors hover:border-line-strong hover:text-fg disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Halaman berikutnya"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
