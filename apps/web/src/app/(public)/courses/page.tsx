import type { Metadata } from "next";
import { Suspense } from "react";
import { CourseCatalog } from "./course-catalog";

export const metadata: Metadata = {
  title: "Katalog Kelas Online",
  description:
    "Jelajahi kelas pemrograman dan teknologi terstruktur di Skilvora.",
  alternates: { canonical: "/courses" },
  openGraph: {
    title: "Katalog Kelas Online | Skilvora",
    description:
      "Temukan kelas pemrograman dan teknologi sesuai tujuan belajar Anda.",
    url: "/courses",
    type: "website",
  },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

async function getPublishedCourses(params: Record<string, string | undefined>) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v) qs.set(k, v);
  });
  const url = `${apiUrl}/courses?${qs.toString()}`;
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok)
    throw new Error(`Gagal memuat katalog kelas (${response.status})`);
  return response.json();
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;

  // Normalise: ambil string pertama kalau ada array
  const params: Record<string, string | undefined> = {
    page: Array.isArray(sp.page) ? sp.page[0] : sp.page,
    limit: Array.isArray(sp.limit) ? sp.limit[0] : sp.limit,
    search: Array.isArray(sp.search) ? sp.search[0] : sp.search,
    category: Array.isArray(sp.category) ? sp.category[0] : sp.category,
    level: Array.isArray(sp.level) ? sp.level[0] : sp.level,
  };

  const payload = await getPublishedCourses(params);

  return (
    <Suspense>
      <CourseCatalog payload={payload} />
    </Suspense>
  );
}
