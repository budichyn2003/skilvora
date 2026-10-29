import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://skilvora-omega.vercel.app/"
  ).replace(/\/+$/, "");
  const [coursesResponse, roadmapsResponse] = await Promise.all([
    fetch(`${apiUrl}/courses?limit=9999`, { cache: "no-store" }),
    fetch(`${apiUrl}/roadmaps`, { cache: "no-store" }),
  ]);
  if (!coursesResponse.ok || !roadmapsResponse.ok) {
    throw new Error("Gagal membuat sitemap dari konten publik.");
  }

  const [courses, roadmaps] = await Promise.all([
    coursesResponse.json() as Promise<
      { data: Array<{ slug: string; updatedAt?: string }> }
    >,
    roadmapsResponse.json() as Promise<
      Array<{ slug: string; updatedAt?: string }>
    >,
  ]);

  const fixedRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/courses`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/roadmap`, changeFrequency: "weekly", priority: 0.8 },
  ];

  return [
    ...fixedRoutes,
    ...courses.data.map((course) => ({
      url: `${siteUrl}/courses/${encodeURIComponent(course.slug)}`,
      lastModified: course.updatedAt ? new Date(course.updatedAt) : undefined,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...roadmaps.map((roadmap) => ({
      url: `${siteUrl}/roadmap/${encodeURIComponent(roadmap.slug)}`,
      lastModified: roadmap.updatedAt ? new Date(roadmap.updatedAt) : undefined,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
