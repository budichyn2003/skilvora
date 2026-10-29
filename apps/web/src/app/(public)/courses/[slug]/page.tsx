import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { EnrollButton } from "@/components/courses/enroll-button";
import {
  BookOpen,
  Check,
  Clock3,
  GraduationCap,
  UserRound,
} from "lucide-react";

type CourseDetail = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  level: string;
  price: number | string;
  thumbnail: string | null;
  category?: { name: string };
  instructor?: { name: string | null };
  modules?: Array<{
    id: string;
    title: string;
    order: number;
    isFreePreview: boolean;
  }>;
};

// Fungsi fetch langsung untuk Server Component agar mendukung caching & SEO ISR
async function getCourseData(slug: string): Promise<CourseDetail | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  const res = await fetch(`${apiUrl}/courses/${encodeURIComponent(slug)}`, {
    next: { revalidate: 3600 }, // Incremental Static Regeneration (ISR) tiap 1 jam
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Gagal memuat kelas (${res.status})`);
  return res.json() as Promise<CourseDetail>;
}

// Generate Meta Tags dinamis untuk SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  // Await params terlebih dahulu untuk Next.js 15+
  const resolvedParams = await params;
  const course = await getCourseData(resolvedParams.slug);

  if (!course) return { title: "Kelas Tidak Ditemukan - Skilvora" };

  return {
    title: `${course.title} - Skilvora`,
    description: course.description || `Pelajari ${course.title} di Skilvora.`,
    alternates: { canonical: `/courses/${course.slug}` },
    openGraph: {
      title: course.title,
      description:
        course.description || `Pelajari ${course.title} di Skilvora.`,
      url: `/courses/${course.slug}`,
      images: course.thumbnail
        ? [{ url: course.thumbnail, alt: course.title }]
        : undefined,
      type: "website",
    },
    twitter: {
      card: course.thumbnail ? "summary_large_image" : "summary",
      title: course.title,
      description:
        course.description || `Pelajari ${course.title} di Skilvora.`,
      images: course.thumbnail ? [course.thumbnail] : undefined,
    },
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // Await params terlebih dahulu untuk Next.js 15+
  const resolvedParams = await params;
  const course = await getCourseData(resolvedParams.slug);

  if (!course) {
    notFound();
  }

  const isFree = Number(course.price) === 0;
  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://skilvora-omega.vercel.app/"
  ).replace(/\/+$/, "");
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.description || "",
    provider: {
      "@type": "Organization",
      name: "Skilvora",
      sameAs: siteUrl,
    },
    url: `${siteUrl}/courses/${course.slug}`,
    educationalLevel: course.level,
    courseCategory: course.category?.name,
    image: course.thumbnail || undefined,
    offers: {
      "@type": "Offer",
      price: Number(course.price),
      priceCurrency: "IDR",
      availability: "https://schema.org/InStock",
      url: `${siteUrl}/courses/${course.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-12 lg:px-8">
        <div>
          <div className="mb-9">
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <Badge>{course.category?.name || "Umum"}</Badge>
              <Badge>{course.level}</Badge>
            </div>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-fg sm:text-5xl">
              {course.title}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-relaxed text-muted sm:text-lg">
              {course.description ||
                `Pelajari materi ${course.title} melalui kelas terstruktur di Skilvora.`}
            </p>
            {course.instructor?.name && (
              <p className="mt-5 inline-flex items-center gap-2 text-sm text-muted">
                <UserRound aria-hidden="true" className="size-4 text-turbo" />
                Instruktur{" "}
                <span className="font-semibold text-fg">
                  {course.instructor.name}
                </span>
              </p>
            )}
          </div>

          <section aria-labelledby="course-modules-title">
            <div className="mb-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-turbo">
                Isi kelas
              </p>
              <h2
                id="course-modules-title"
                className="text-2xl font-bold tracking-tight text-fg sm:text-3xl"
              >
                Materi pembelajaran
              </h2>
            </div>
            {course.modules?.length ? (
              <div className="space-y-3">
                {course.modules.map((modul) => (
                  <GlassCard
                    key={modul.id}
                    className="flex items-center justify-between gap-4 p-4 sm:p-5"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-surface-2 text-sm font-semibold text-turbo">
                        {String(modul.order).padStart(2, "0")}
                      </span>
                      <h3 className="truncate font-semibold text-fg">
                        {modul.title}
                      </h3>
                    </div>
                    {modul.isFreePreview && (
                      <Badge className="shrink-0">Preview gratis</Badge>
                    )}
                  </GlassCard>
                ))}
              </div>
            ) : (
              <GlassCard className="p-6 text-sm text-muted">
                Materi kelas akan segera tersedia.
              </GlassCard>
            )}
          </section>
        </div>

        <aside>
          <div className="lg:sticky lg:top-24">
            <GlassCard className="overflow-hidden p-4 sm:p-5">
              <div className="relative mb-5 aspect-video overflow-hidden rounded-xl border border-line bg-surface-2">
                {course.thumbnail ? (
                  <Image
                    src={course.thumbnail}
                    alt={`Sampul kelas ${course.title}`}
                    fill
                    unoptimized
                    sizes="(min-width: 1024px) 360px, 100vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-subtle">
                    <BookOpen aria-hidden="true" className="size-10" />
                  </div>
                )}
              </div>

              <div className="mb-5">
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-turbo">
                  Investasi belajar
                </p>
                <p className="text-3xl font-bold tracking-tight text-fg">
                  {isFree
                    ? "Gratis"
                    : `Rp ${Number(course.price).toLocaleString("id-ID")}`}
                </p>
                <p className="mt-2 text-sm text-muted">
                  Akses kelas dan materi kapan saja.
                </p>
              </div>

              {isFree || process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === "true" ? (
                <EnrollButton classId={course.id} isFree={isFree} />
              ) : (
                <p className="rounded-xl border border-warning/20 bg-warning/10 p-4 text-sm leading-relaxed text-warning">
                  Pembelian belum dibuka. Jangan melakukan transfer.
                </p>
              )}

              <ul className="mt-5 space-y-3 border-t border-line pt-5 text-sm text-muted">
                <li className="flex items-center gap-3">
                  <BookOpen aria-hidden="true" className="size-4 text-turbo" />
                  {course.modules?.length || 0} modul pembelajaran
                </li>
                <li className="flex items-center gap-3">
                  <Clock3 aria-hidden="true" className="size-4 text-turbo" />
                  Belajar sesuai ritme Anda
                </li>
                <li className="flex items-center gap-3">
                  <GraduationCap
                    aria-hidden="true"
                    className="size-4 text-turbo"
                  />
                  Sertifikat digital kelulusan
                </li>
                <li className="flex items-center gap-3">
                  <Check aria-hidden="true" className="size-4 text-turbo" />
                  Progres belajar tersimpan
                </li>
              </ul>
            </GlassCard>
          </div>
        </aside>
      </div>
    </>
  );
}
