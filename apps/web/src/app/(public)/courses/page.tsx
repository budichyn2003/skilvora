import type { Metadata } from "next";
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

async function getPublishedCourses() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  const response = await fetch(`${apiUrl}/courses`, { cache: "no-store" });
  if (!response.ok)
    throw new Error(`Gagal memuat katalog kelas (${response.status})`);
  return response.json();
}

export default async function CatalogPage() {
  const courses = await getPublishedCourses();
  return <CourseCatalog courses={courses} />;
}
