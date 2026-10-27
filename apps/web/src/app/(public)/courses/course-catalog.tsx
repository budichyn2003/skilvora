"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, BookOpen, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";

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
    <div className="bg-gradient-to-b from-[#EAEDFB]/40 to-[#FAFAFA] py-16 min-h-[calc(100vh-4rem)]">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="inline-block py-1.5 px-4 rounded-full bg-[#0033FF]/10 text-[#0033FF] text-xs font-bold tracking-widest uppercase mb-4 border border-[#0033FF]/20 shadow-sm">
            Katalog Pembelajaran
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#00033D] tracking-tight mb-4">
            Jelajahi Berbagai Kelas Pilihan
          </h1>
          <p className="text-[#00033D]/70 text-lg leading-relaxed">
            Temukan kelas terstruktur yang sesuai dengan keahlian dan tujuan
            belajar Anda.
          </p>
        </div>

        <div className="mb-10 grid gap-3 rounded-2xl bg-white/80 p-4 shadow-sm md:grid-cols-[1fr_220px_200px]">
          <label className="relative">
            <span className="sr-only">Cari kelas</span>
            <Search
              aria-hidden="true"
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#00033D]/50"
            />
            <input
              className="h-11 w-full rounded-xl border border-[#00033D]/15 pl-10 pr-3 text-sm"
              type="search"
              placeholder="Cari kelas..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <label>
            <span className="sr-only">Filter kategori</span>
            <select
              className="h-11 w-full rounded-xl border border-[#00033D]/15 bg-white px-3 text-sm"
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
            <span className="sr-only">Filter level</span>
            <select
              className="h-11 w-full rounded-xl border border-[#00033D]/15 bg-white px-3 text-sm"
              value={level}
              onChange={(event) => setLevel(event.target.value)}
            >
              <option value="">Semua level</option>
              <option value="BEGINNER">Pemula</option>
              <option value="INTERMEDIATE">Menengah</option>
              <option value="ADVANCED">Lanjutan</option>
            </select>
          </label>
        </div>

        {filtered.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <BookOpen className="mx-auto mb-4 h-12 w-12 text-[#0033FF]/50" />
            <h2 className="font-bold text-[#00033D]">Kelas tidak ditemukan</h2>
            <p className="mt-2 text-sm text-[#00033D]/60">
              Coba kata kunci atau filter lain.
            </p>
          </GlassCard>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((course) => (
              <GlassCard
                key={course.id}
                className="flex flex-col overflow-hidden rounded-3xl bg-white/90 p-0 shadow-lg"
              >
                <div className="h-52 bg-[#EAEDFB]">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 font-semibold text-[#00033D]/40">
                      Skilvora Academy
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col justify-between p-6">
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#0033FF]">
                      {course.category?.name || "Umum"} · {course.level}
                    </p>
                    <h2 className="mb-3 line-clamp-2 text-xl font-bold text-[#00033D]">
                      {course.title}
                    </h2>
                    <p className="mb-5 line-clamp-2 text-sm text-[#00033D]/60">
                      {course.description ||
                        "Pelajari materi terstruktur bersama Skilvora."}
                    </p>
                  </div>
                  <div>
                    <div className="mb-5 flex gap-4 border-t border-gray-100 pt-4 text-xs text-[#00033D]/60">
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4 text-[#0033FF]" />{" "}
                        {course._count?.modules || 0} Modul
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-[#0033FF]" />{" "}
                        {course._count?.enrollments || 0} Siswa
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-[#0033FF]">
                        {Number(course.price) === 0
                          ? "GRATIS"
                          : `Rp ${Number(course.price).toLocaleString("id-ID")}`}
                      </span>
                      <Button asChild>
                        <Link
                          href={`/courses/${course.slug}`}
                          className="gap-2"
                        >
                          Detail <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
