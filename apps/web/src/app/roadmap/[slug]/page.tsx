import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicLayout } from "@/components/layouts/public-layout";
import { GlassCard } from "@/components/ui/glass-card";
import { ArrowLeft, ArrowRight, Compass } from "lucide-react";

type RoadmapData = {
  title: string;
  slug: string;
  description: string | null;
  nodes: Array<{
    id: string;
    title: string;
    order: number;
    class: {
      title: string;
      slug: string;
      description: string | null;
      level: string;
    };
  }>;
};

async function getRoadmap(slug: string): Promise<RoadmapData | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  const response = await fetch(
    `${apiUrl}/roadmaps/${encodeURIComponent(slug)}`,
    { cache: "no-store" },
  );
  if (response.status === 404) return null;
  if (!response.ok)
    throw new Error(`Gagal memuat roadmap (${response.status})`);
  return response.json();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const roadmap = await getRoadmap(slug);
  if (!roadmap) return { title: "Roadmap tidak ditemukan" };
  return {
    title: roadmap.title,
    description:
      roadmap.description ||
      `Ikuti jalur belajar ${roadmap.title} di Skilvora.`,
    alternates: { canonical: `/roadmap/${roadmap.slug}` },
    openGraph: {
      title: roadmap.title,
      description:
        roadmap.description ||
        `Ikuti jalur belajar ${roadmap.title} di Skilvora.`,
      url: `/roadmap/${roadmap.slug}`,
      type: "article",
    },
  };
}

export default async function RoadmapDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const roadmap = await getRoadmap(slug);
  if (!roadmap) notFound();

  return (
    <PublicLayout>
      <article className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20">
        <header className="mb-10">
          <Link
            href="/roadmap"
            className="mb-6 inline-flex min-h-11 items-center gap-2 rounded-xl text-sm font-semibold text-turbo transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turbo"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Semua roadmap
          </Link>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-turbo">
            Jalur belajar
          </p>
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-fg sm:text-5xl">
            {roadmap.title}
          </h1>
          {roadmap.description && (
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted sm:text-lg">
              {roadmap.description}
            </p>
          )}
        </header>
        <ol className="relative space-y-4 before:absolute before:bottom-8 before:left-6 before:top-8 before:w-px before:bg-line">
          {roadmap.nodes.map((node) => (
            <li key={node.id}>
              <GlassCard className="relative flex gap-4 p-5 sm:p-6">
                <span className="z-10 flex size-12 shrink-0 items-center justify-center rounded-xl border border-line bg-surface text-sm font-semibold text-turbo">
                  {node.order}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-fg">{node.title}</h2>
                  <p className="mt-1 text-sm text-muted">
                    {node.class.level} · {node.class.title}
                  </p>
                  {node.class.description && (
                    <p className="mt-3 text-sm leading-relaxed text-muted">
                      {node.class.description}
                    </p>
                  )}
                  <Link
                    href={`/courses/${node.class.slug}`}
                    className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-turbo transition-colors hover:text-fg"
                  >
                    <Compass aria-hidden="true" className="size-4" />
                    Lihat kelas
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </Link>
                </div>
              </GlassCard>
            </li>
          ))}
        </ol>
      </article>
    </PublicLayout>
  );
}
